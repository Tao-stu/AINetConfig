<template>
  <div class="diagnosis-page">
    <div class="page-toolbar">
      <h3 class="page-title">AI故障诊断任务管理</h3>
      <el-button size="small" type="primary" @click="showCreateDialog = true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建诊断任务
      </el-button>
    </div>

    <el-card shadow="never" class="task-table-card">
      <el-table :data="tasks" stripe style="width: 100%" height="calc(100vh - 350px)" @row-click="selectTask">
        <el-table-column prop="id" label="任务编号" width="100" />
        <el-table-column prop="device" label="目标设备" width="150" />
        <el-table-column prop="deviceIp" label="管理IP" width="140" />
        <el-table-column prop="issue" label="故障描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="dark">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置信度" width="80">
          <template #default="{ row }">
            <span v-if="row.confidence" class="confidence-value">{{ row.confidence }}%</span>
            <span v-else class="no-data">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="completeTime" label="完成时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text @click="viewTask(row)">查看</el-button>
            <el-button v-if="row.status === 'pending'" size="small" text type="success" @click.stop="runDiagnosis(row)">执行</el-button>
            <el-button v-if="row.status === 'running'" size="small" text type="danger" @click.stop="abortDiagnosis(row)">终止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" :title="'诊断详情 - ' + currentTask?.id" width="800px" top="5vh">
      <div v-if="currentTask" class="diagnosis-detail">
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="设备">{{ currentTask.device }}</el-descriptions-item>
          <el-descriptions-item label="管理IP">{{ currentTask.deviceIp }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(currentTask.status)" size="small" effect="dark">
              {{ statusLabel(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="故障描述" :span="3">{{ currentTask.issue }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="stream-section">
          <div class="stream-header">
            <span class="stream-title">
              <span v-if="streamActive" class="stream-indicator blink-danger"></span>
              AI诊断输出
            </span>
            <el-tag v-if="streamActive" size="small" effect="dark" type="warning">诊断中...</el-tag>
            <el-tag v-else-if="currentTask.status === 'completed'" size="small" effect="dark" type="success">诊断完成</el-tag>
          </div>

          <div class="stream-output" ref="streamOutput">
            <div v-if="!streamContent && currentTask.result" class="result-text">{{ currentTask.result }}</div>
            <div v-else-if="!streamContent && currentTask.status === 'pending'" class="placeholder-text">等待执行...</div>
            <div v-else-if="!streamContent && currentTask.status === 'failed'" class="placeholder-text error-text">诊断失败</div>
            <div v-else class="stream-content">
              <template v-for="(chunk, i) in streamChunks" :key="i">
                <span :class="['stream-chunk', 'chunk-' + chunk.type]">{{ chunk.content }}</span>
              </template>
              <span v-if="streamActive" class="cursor-blink">|</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentTask?.result" type="primary" @click="exportReport">导出报告</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCreateDialog" title="新建诊断任务" width="500px">
      <el-form :model="createForm" label-position="top">
        <el-form-item label="目标设备">
          <el-select v-model="createForm.device" placeholder="选择设备" style="width:100%">
            <el-option v-for="d in deviceOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="createForm.issue" type="textarea" :rows="3" placeholder="描述故障现象..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建并执行</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onUnmounted } from 'vue'
import { getMockDiagnosisTasks, type DiagnosisTask } from '@/utils/mock-data'
import { simulateStreamDiagnosis, type StreamMessage } from '@/utils/mock-stream'
import { ElMessage } from 'element-plus'

const tasks = ref<DiagnosisTask[]>(getMockDiagnosisTasks())
const currentTask = ref<DiagnosisTask | null>(null)
const detailVisible = ref(false)
const showCreateDialog = ref(false)
const streamActive = ref(false)
const streamContent = ref('')
const streamChunks = ref<StreamMessage[]>([])
const streamOutput = ref<HTMLElement>()

let abortController: AbortController | null = null

const createForm = reactive({ device: '', issue: '' })

const deviceOptions = [
  'Agg-SW-01', 'Agg-SW-02', 'Agg-SW-03', 'Core-SW-01', 'Core-SW-02',
  'Router-GW-01', 'Router-GW-02', 'FW-01', 'FW-02',
  'Acc-SW-04', 'Acc-SW-05', 'Acc-SW-06', 'Acc-SW-07',
  'AAA-Server', 'Log-Server', 'NMS-Server'
]

function statusLabel(s: string) {
  const m: Record<string, string> = { pending: '待诊断', running: '诊断中', completed: '已完成', failed: '失败' }
  return m[s] || s
}
function statusTagType(s: string) {
  const m: Record<string, string> = { pending: 'info', running: 'warning', completed: 'success', failed: 'danger' }
  return m[s] || 'info'
}

function selectTask(row: DiagnosisTask) { currentTask.value = row }

function viewTask(row: DiagnosisTask) {
  currentTask.value = row; detailVisible.value = true
  streamChunks.value = []; streamContent.value = ''; streamActive.value = false
  if (row.status === 'running') startStream(row)
}

function runDiagnosis(row: DiagnosisTask) {
  const t = tasks.value.find(x => x.id === row.id)
  if (!t) return
  t.status = 'running'; currentTask.value = t; detailVisible.value = true
  startStream(t)
}

function abortDiagnosis(row: DiagnosisTask) {
  if (abortController) { abortController.abort(); abortController = null }
  const t = tasks.value.find(x => x.id === row.id)
  if (t) { t.status = 'failed'; streamActive.value = false }
}

function startStream(task: DiagnosisTask) {
  streamActive.value = true; streamChunks.value = []; streamContent.value = ''
  abortController = new AbortController()

  simulateStreamDiagnosis(task.id, task.device,
    (msg: StreamMessage) => {
      if (msg.type === 'complete') {
        streamActive.value = false; task.status = 'completed'
        task.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
        task.result = streamContent.value; task.confidence = 92
        abortController = null; return
      }
      streamChunks.value.push(msg); streamContent.value += msg.content
      nextTick(() => { if (streamOutput.value) streamOutput.value.scrollTop = streamOutput.value.scrollHeight })
    },
    () => {
      streamActive.value = false
      if (task.status === 'running') {
        task.status = 'completed'; task.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
        task.result = streamContent.value; task.confidence = 88
      }
      abortController = null
    },
    (err: string) => { streamActive.value = false; task.status = 'failed'; abortController = null; ElMessage.error('诊断出错: ' + err) },
    abortController?.signal
  )
}

function createTask() {
  if (!createForm.device) return ElMessage.warning('请选择目标设备')
  if (!createForm.issue) return ElMessage.warning('请输入故障描述')
  const nt: DiagnosisTask = {
    id: 'DX-' + String(tasks.value.length + 1).padStart(3, '0'),
    device: createForm.device, deviceIp: '10.0.' + (tasks.value.length + 1) + '.1',
    issue: createForm.issue, status: 'pending',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
  }
  tasks.value.unshift(nt); showCreateDialog.value = false
  createForm.device = ''; createForm.issue = ''
  ElMessage.success('诊断任务已创建')
  setTimeout(() => runDiagnosis(nt), 300)
}

function exportReport() {
  if (!currentTask.value?.result) return
  const report = [
    '='.repeat(60), 'AI网络故障诊断报告', '='.repeat(60), '',
    '任务编号: ' + currentTask.value.id,
    '目标设备: ' + currentTask.value.device + ' (' + currentTask.value.deviceIp + ')',
    '故障描述: ' + currentTask.value.issue,
    '诊断时间: ' + currentTask.value.createTime + ' - ' + (currentTask.value.completeTime || ''),
    '置信度: ' + (currentTask.value.confidence || 'N/A') + '%', '',
    currentTask.value.result, '', '='.repeat(60),
  ].join('\n')
  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `Diagnosis_${currentTask.value.id}_${currentTask.value.device}.txt`
  a.click(); URL.revokeObjectURL(url); ElMessage.success('报告已导出')
}

onUnmounted(() => { if (abortController) { abortController.abort(); abortController = null } })
</script>

<style scoped>
.diagnosis-page { display: flex; flex-direction: column; height: calc(100vh - var(--header-height) - 32px); }
.page-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
.page-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.task-table-card { flex: 1; min-height: 0; }
.confidence-value { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: #1D4FBF; }
.no-data { color: var(--text-tertiary); }
.diagnosis-detail { display: flex; flex-direction: column; }
.stream-section { margin-top: 8px; }
.stream-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.stream-title { font-size: 14px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.stream-indicator { width: 8px; height: 8px; border-radius: 50%; background: var(--color-danger); }
.stream-output {
  background: #fafafa; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  padding: 16px; font-family: var(--font-mono); font-size: 13px; color: #555;
  max-height: 450px; overflow-y: auto; line-height: 1.8;
}
.stream-content { white-space: pre-wrap; word-break: break-all; }
.chunk-thinking { color: #999; }
.chunk-analysis { color: #666; }
.chunk-conclusion { color: #333; font-weight: 500; border-left: 2px solid #4caf50; padding-left: 10px; }
.chunk-suggestion { color: #e65100; border-left: 2px solid #ed6c00; padding-left: 10px; }
.chunk-error { color: var(--color-danger); }
.result-text { white-space: pre-wrap; word-break: break-all; line-height: 1.8; }
.placeholder-text { color: var(--text-tertiary); text-align: center; padding: 20px 0; }
.error-text { color: var(--color-danger); }
.cursor-blink { animation: blink 1s steps(1) infinite; color: var(--color-primary); }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
</style>
