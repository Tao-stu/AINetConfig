<template>
  <div class="alarm-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <h3 class="page-title">告警列表管理</h3>
        <el-select v-model="filterLevel" placeholder="告警级别" size="small" clearable style="width: 110px;">
          <el-option label="严重" value="critical" />
          <el-option label="告警" value="warning" />
          <el-option label="信息" value="info" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="告警状态" size="small" clearable style="width: 110px;">
          <el-option label="活跃" value="active" />
          <el-option label="已确认" value="acknowledged" />
          <el-option label="已解决" value="resolved" />
        </el-select>
        <el-input v-model="searchKey" placeholder="搜索设备..." size="small" clearable style="width: 170px;" />
      </div>
      <div class="toolbar-right">
        <span class="alarm-count">共 {{ filteredAlarms.length }} 条</span>
        <el-button size="small" @click="batchAck" :disabled="selectedRows.length === 0">批量确认</el-button>
        <el-button size="small" @click="exportAlarms">导出告警</el-button>
      </div>
    </div>

    <el-card shadow="never" class="alarm-table-card">
      <el-table
        :data="paginatedAlarms" stripe style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-class-name="tableRowClassName"
        height="calc(100vh - 300px)"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column prop="time" label="告警时间" width="170" sortable />
        <el-table-column label="级别" width="70">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" size="small" effect="dark">{{ levelLabel(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="device" label="告警设备" width="140" />
        <el-table-column prop="deviceIp" label="管理IP" width="140" />
        <el-table-column prop="type" label="告警类型" width="130" />
        <el-table-column prop="message" label="告警内容" min-width="250" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="alarmStatusTagType(row.status)" size="small" effect="dark">{{ alarmStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ackBy" label="确认人" width="90" />
        <el-table-column prop="ackTime" label="确认时间" width="160" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button v-if="row.status === 'active'" size="small" type="warning" @click="acknowledge(row)">确认</el-button>
              <el-button v-if="row.status !== 'resolved'" size="small" type="success" @click="resolveAlarm(row)">解决</el-button>
              <el-button size="small" type="primary" @click="jumpToDiagnosis(row)">诊断</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage" v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="filteredAlarms.length"
          layout="total, sizes, prev, pager, next" background size="small"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMockAlarms, type AlarmRecord } from '@/utils/mock-data'
import { ElMessage } from 'element-plus'

const router = useRouter()
const alarms = ref<AlarmRecord[]>(getMockAlarms())
const filterLevel = ref('')
const filterStatus = ref('')
const searchKey = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedRows = ref<AlarmRecord[]>([])

const filteredAlarms = computed(() => {
  let r = alarms.value
  if (filterLevel.value) r = r.filter(a => a.level === filterLevel.value)
  if (filterStatus.value) r = r.filter(a => a.status === filterStatus.value)
  if (searchKey.value) {
    const kw = searchKey.value.toLowerCase()
    r = r.filter(a => a.device.toLowerCase().includes(kw) || a.deviceIp.includes(kw) || a.message.toLowerCase().includes(kw))
  }
  return r
})

const paginatedAlarms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredAlarms.value.slice(start, start + pageSize.value)
})

function levelLabel(l: string) { const m: Record<string, string> = { critical: '严重', warning: '告警', info: '信息' }; return m[l] || l }
function levelTagType(l: string) { const m: Record<string, string> = { critical: 'danger', warning: 'warning', info: 'info' }; return m[l] || 'info' }
function alarmStatusLabel(s: string) { const m: Record<string, string> = { active: '活跃', acknowledged: '已确认', resolved: '已解决' }; return m[s] || s }
function alarmStatusTagType(s: string) { const m: Record<string, string> = { active: 'danger', acknowledged: 'warning', resolved: 'success' }; return m[s] || 'info' }

function tableRowClassName({ row }: { row: AlarmRecord }) {
  if (row.level === 'critical' && row.status !== 'resolved') return 'alarm-critical-row'
  if (row.level === 'warning' && row.status !== 'resolved') return 'alarm-warning-row'
  return ''
}

function handleSelectionChange(rows: AlarmRecord[]) { selectedRows.value = rows }

function acknowledge(row: AlarmRecord) {
  row.status = 'acknowledged'; row.ackBy = 'admin'
  row.ackTime = new Date().toLocaleString('zh-CN', { hour12: false })
  ElMessage.success(`告警 ${row.id} 已确认`)
}

function resolveAlarm(row: AlarmRecord) {
  row.status = 'resolved'; row.ackTime = new Date().toLocaleString('zh-CN', { hour12: false })
  ElMessage.success(`告警 ${row.id} 已解决`)
}

function batchAck() {
  if (!selectedRows.value.length) return ElMessage.warning('请先选择告警')
  selectedRows.value.forEach(row => {
    if (row.status === 'active') {
      row.status = 'acknowledged'; row.ackBy = 'admin'
      row.ackTime = new Date().toLocaleString('zh-CN', { hour12: false })
    }
  })
  ElMessage.success(`已批量确认 ${selectedRows.value.length} 条告警`)
}

function jumpToDiagnosis(_row: AlarmRecord) { router.push('/diagnosis') }

function exportAlarms() {
  const headers = ['告警编号', '告警时间', '级别', '设备', '管理IP', '告警类型', '告警内容', '状态']
  const rows = filteredAlarms.value.map(a => [a.id, a.time, levelLabel(a.level), a.device, a.deviceIp, a.type, a.message, alarmStatusLabel(a.status)])
  const csv = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `Alarms_${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${filteredAlarms.value.length} 条告警`)
}
</script>

<style scoped>
.alarm-page { display: flex; flex-direction: column; height: calc(100vh - var(--header-height) - 32px); }
.page-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; flex-wrap: wrap; gap: 8px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 10px; }
.page-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.alarm-count { font-size: 12px; color: var(--text-tertiary); }
.alarm-table-card { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.pagination-wrapper { display: flex; justify-content: flex-end; padding: 12px 0 0; flex-shrink: 0; }
.action-btns { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; }
</style>
