<template>
  <div class="config-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <h3 class="page-title">设备配置管理</h3>
        <el-select v-model="selectedDevice" placeholder="选择设备" size="small" style="width: 200px;" @change="onDeviceChange">
          <el-option v-for="d in deviceList" :key="d.id" :label="`${d.deviceName} (${d.deviceIp})`" :value="d.id" />
        </el-select>
        <el-select v-model="selectedVersion" placeholder="版本选择" size="small" style="width: 170px;" @change="onVersionChange">
          <el-option v-for="v in availableVersions" :key="v.id" :label="`${v.version} - ${v.lastModified}`" :value="v.id" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button size="small" @click="toggleDiffMode" :type="diffMode ? 'warning' : 'default'">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          {{ diffMode ? '退出对比' : '版本对比' }}
        </el-button>
        <el-button size="small" @click="exportConfig">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出配置
        </el-button>
      </div>
    </div>

    <div v-if="!diffMode" class="config-single-view">
      <div class="config-header">
        <span class="config-info">设备: {{ currentConfig?.deviceName }} | IP: {{ currentConfig?.deviceIp }} | 版本: {{ currentConfig?.version }} | 更新: {{ currentConfig?.lastModified }}</span>
      </div>
      <div class="monaco-container" ref="monacoContainer" style="height: calc(100vh - 170px);"></div>
    </div>

    <div v-else class="diff-view" style="height: calc(100vh - 170px);">
      <div class="diff-panel">
        <div class="config-header">基准: {{ leftConfig?.version }} ({{ leftConfig?.lastModified }})</div>
        <div class="monaco-container" ref="leftDiffContainer" style="height: calc(100vh - 220px);"></div>
      </div>
      <div class="diff-panel">
        <div class="config-header">对比: {{ rightConfig?.version }} ({{ rightConfig?.lastModified }})</div>
        <div class="monaco-container" ref="rightDiffContainer" style="height: calc(100vh - 220px);"></div>
      </div>
    </div>

    <div v-if="diffMode" class="diff-summary">
      <div class="diff-stat-item"><span class="diff-stat-value added">+{{ addedLines }}</span> 新增</div>
      <div class="diff-stat-item"><span class="diff-stat-value removed">-{{ removedLines }}</span> 删除</div>
      <div class="diff-stat-item"><span class="diff-stat-value modified">{{ modifiedLines }}</span> 修改</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as monaco from 'monaco-editor'
import { getMockDeviceConfigs, type DeviceConfig } from '@/utils/mock-data'

const allConfigs = getMockDeviceConfigs()
const deviceList = ref<DeviceConfig[]>([...new Map(allConfigs.map(c => [c.deviceIp, c])).values()])
const availableVersions = ref<DeviceConfig[]>([])
const selectedDevice = ref(deviceList.value[0]?.id || '')
const selectedVersion = ref('')
const diffMode = ref(false)

const currentConfig = ref<DeviceConfig | null>(null)
const leftConfig = ref<DeviceConfig | null>(null)
const rightConfig = ref<DeviceConfig | null>(null)

const monacoContainer = ref<HTMLElement>()
const leftDiffContainer = ref<HTMLElement>()
const rightDiffContainer = ref<HTMLElement>()

let editor: monaco.editor.IStandaloneCodeEditor | null = null
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

const addedLines = ref(0)
const removedLines = ref(0)
const modifiedLines = ref(0)

function onDeviceChange() {
  availableVersions.value = allConfigs.filter(c => c.deviceIp === getDeviceIpById(selectedDevice.value))
  if (availableVersions.value.length > 0) {
    selectedVersion.value = availableVersions.value[0].id
    currentConfig.value = availableVersions.value[0]
    if (!diffMode.value) updateEditor()
  }
}

function onVersionChange() {
  currentConfig.value = availableVersions.value.find(v => v.id === selectedVersion.value) || null
  if (!diffMode.value && currentConfig.value) updateEditor()
}

function getDeviceIpById(id: string): string {
  const found = allConfigs.find(c => c.id === id)
  return found?.deviceIp || ''
}

function updateEditor() {
  if (!editor || !currentConfig.value) return
  const model = editor.getModel()
  if (model) {
    model.setValue(currentConfig.value.content)
    monaco.editor.setModelLanguage(model, 'ini')
  }
}

function initEditor() {
  if (!monacoContainer.value) return

  monaco.editor.defineTheme('layui-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6a8759', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'b8860b' },
      { token: 'string', foreground: '6a8759' },
      { token: 'number', foreground: '5c6b73' },
      { token: 'type', foreground: '555555' },
    ],
    colors: {
      'editor.background': '#fafafa',
      'editor.foreground': '#333333',
      'editor.lineHighlightBackground': '#f0f0f0',
      'editor.selectionBackground': '#e0e0e0',
      'editorCursor.foreground': '#2461E9',
      'editorLineNumber.foreground': '#bbb',
      'editorLineNumber.activeForeground': '#666',
    },
  })

  editor = monaco.editor.create(monacoContainer.value, {
    value: currentConfig.value?.content || '',
    language: 'ini',
    theme: 'layui-light',
    automaticLayout: true,
    fontSize: 13,
    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
    minimap: { enabled: true },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    tabSize: 2,
    readOnly: true,
    padding: { top: 12 },
  })
}

function initDiffEditor() {
  if (!rightDiffContainer.value) return

  if (diffEditor) {
    diffEditor.dispose()
    diffEditor = null
  }

  const originalModel = monaco.editor.createModel(leftConfig.value?.content || '', 'ini')
  const modifiedModel = monaco.editor.createModel(rightConfig.value?.content || '', 'ini')

  diffEditor = monaco.editor.createDiffEditor(rightDiffContainer.value, {
    automaticLayout: true,
    fontSize: 12,
    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
    minimap: { enabled: false },
    readOnly: true,
    renderSideBySide: false,
    scrollBeyondLastLine: false,
    theme: 'layui-light',
    padding: { top: 8 },
  })

  diffEditor.setModel({ original: originalModel, modified: modifiedModel })

  computeDiffStats(leftConfig.value?.content || '', rightConfig.value?.content || '')
}

function computeDiffStats(original: string, modified: string) {
  const oLines = original.split('\n')
  const mLines = modified.split('\n')
  const oSet = new Set(oLines.map(l => l.trim()))
  const mSet = new Set(mLines.map(l => l.trim()))
  let added = 0, removed = 0, mod = 0
  for (const l of mLines) { if (!oSet.has(l.trim())) added++ }
  for (const l of oLines) { if (!mSet.has(l.trim())) removed++ }
  mod = Math.min(added, removed)
  addedLines.value = Math.max(0, added - mod)
  removedLines.value = Math.max(0, removed - mod)
  modifiedLines.value = mod
}

function toggleDiffMode() {
  diffMode.value = !diffMode.value
  if (diffMode.value) {
    const vers = allConfigs.filter(c => c.deviceIp === getDeviceIpById(selectedDevice.value))
    if (vers.length >= 2) { leftConfig.value = vers[0]; rightConfig.value = vers[1] }
    if (editor) { editor.dispose(); editor = null }
    nextTick(() => initDiffEditor())
  } else {
    if (diffEditor) { diffEditor.dispose(); diffEditor = null }
    nextTick(() => { onDeviceChange(); setTimeout(() => initEditor(), 100) })
  }
}

function exportConfig() {
  if (!currentConfig.value) return
  const blob = new Blob([currentConfig.value.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentConfig.value.deviceName}_${currentConfig.value.version}.cfg`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => { onDeviceChange(); nextTick(() => initEditor()) })

onUnmounted(() => {
  if (editor) { editor.dispose(); editor = null }
  if (diffEditor) { diffEditor.dispose(); diffEditor = null }
})
</script>

<style scoped>
.config-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - 32px);
}
.page-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; flex-shrink: 0; flex-wrap: wrap; gap: 8px;
}
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.page-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.config-single-view { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.config-header {
  padding: 5px 12px; background: var(--bg-tertiary);
  border: 1px solid var(--border-color); border-bottom: none; font-size: 12px; color: var(--text-tertiary);
  font-family: var(--font-mono);
}
.diff-view { display: flex; gap: 2px; flex: 1; min-height: 0; }
.diff-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.diff-summary {
  margin-top: 10px; display: flex; gap: 32px; padding: 10px 16px;
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md);
}
.diff-stat-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
.diff-stat-value { font-size: 20px; font-weight: 700; font-family: var(--font-mono); }
.diff-stat-value.added { color: #4caf50; }
.diff-stat-value.removed { color: #ff5722; }
.diff-stat-value.modified { color: #ed6c00; }
</style>
