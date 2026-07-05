<template>
  <div class="dashboard-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <h3 class="page-title">故障数据统计看板</h3>
        <el-date-picker
          v-model="dateRange" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"
          size="small" style="width: 240px;"
        />
        <el-button size="small" @click="refreshStats">刷新数据</el-button>
      </div>
      <div class="toolbar-right">
        <el-button size="small" type="primary" @click="exportDashboard">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出报表
        </el-button>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card__label">总告警数</div>
        <div class="stat-card__value">{{ stats.totalAlarms }}</div>
        <div class="stat-card__footer">本月累计</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">活跃告警</div>
        <div class="stat-card__value" style="color: var(--color-danger);">{{ stats.activeAlarms }}</div>
        <div class="stat-card__footer">严重: {{ stats.criticalAlarms }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">设备在线率</div>
        <div class="stat-card__value" style="color: var(--color-success);">{{ deviceOnlineRate }}%</div>
        <div class="stat-card__footer">在线 {{ stats.deviceOnline }} / 总计 {{ stats.deviceTotal }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__label">诊断成功率</div>
        <div class="stat-card__value" style="color: var(--color-success);">{{ diagnosisSuccessRate }}%</div>
        <div class="stat-card__footer">平均耗时 {{ stats.avgDiagnosisTime }}s</div>
      </div>
    </div>

    <div class="chart-row">
      <el-card shadow="never" class="chart-card">
        <template #header><span>月度故障趋势</span></template>
        <v-chart :option="monthlyFaultOption" style="height: 320px;" autoresize />
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>设备类型分布</span></template>
        <v-chart :option="deviceTypeOption" style="height: 320px;" autoresize />
      </el-card>
    </div>

    <div class="chart-row">
      <el-card shadow="never" class="chart-card">
        <template #header><span>故障Top5设备</span></template>
        <v-chart :option="topFaultDeviceOption" style="height: 300px;" autoresize />
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>告警级别分布</span></template>
        <v-chart :option="alarmLevelOption" style="height: 300px;" autoresize />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getFaultStatistics } from '@/utils/mock-data'
import { ElMessage } from 'element-plus'

const stats = ref(getFaultStatistics())
const dateRange = ref<[Date, Date]>()

const deviceOnlineRate = computed(() => Math.round((stats.value.deviceOnline / stats.value.deviceTotal) * 100))
const diagnosisSuccessRate = computed(() => Math.round((stats.value.diagnosisSuccess / (stats.value.diagnosisTotal || 1)) * 100))

const chartTextColor = '#666'
const chartAxisColor = '#e0e0e0'

const monthlyFaultOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e0e0e0', textStyle: { color: '#333', fontSize: 12 } },
  legend: { data: ['严重', '告警', '信息'], textStyle: { color: chartTextColor, fontSize: 12 }, top: 0 },
  grid: { left: 40, right: 20, top: 40, bottom: 20 },
  xAxis: {
    type: 'category', data: stats.value.monthlyFaults.map(d => d.month),
    axisLine: { lineStyle: { color: chartAxisColor } }, axisTick: { show: false },
    axisLabel: { color: chartTextColor, fontSize: 11 },
  },
  yAxis: {
    type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } },
    axisLabel: { color: chartTextColor, fontSize: 11 },
  },
  series: [
    { name: '严重', type: 'bar', stack: 'total', data: stats.value.monthlyFaults.map(d => d.critical), itemStyle: { color: '#ff5722' }, barWidth: 28 },
    { name: '告警', type: 'bar', stack: 'total', data: stats.value.monthlyFaults.map(d => d.warning), itemStyle: { color: '#ffb800' }, barWidth: 28 },
    { name: '信息', type: 'bar', stack: 'total', data: stats.value.monthlyFaults.map(d => d.info), itemStyle: { color: '#999' }, barWidth: 28 },
  ],
}))

const deviceTypeOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#e0e0e0', textStyle: { color: '#333', fontSize: 12 }, formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: chartTextColor, fontSize: 11 } },
  series: [{
    type: 'pie', radius: ['45%', '75%'], center: ['38%', '50%'],
    avoidLabelOverlap: false, label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    data: stats.value.deviceTypeDist.map(d => ({ name: d.type, value: d.count })),
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
    color: ['#2461E9', '#5285F0', '#999', '#ffb800', '#ff5722', '#666'],
  }],
}))

const topFaultDeviceOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#e0e0e0', textStyle: { color: '#333', fontSize: 12 } },
  grid: { left: 120, right: 40, top: 10, bottom: 20 },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: chartTextColor, fontSize: 11 } },
  yAxis: {
    type: 'category', data: stats.value.topFaultDevices.map(d => d.device).reverse(),
    axisLine: { lineStyle: { color: chartAxisColor } }, axisTick: { show: false },
    axisLabel: { color: chartTextColor, fontSize: 11 },
  },
  series: [{
    type: 'bar', data: stats.value.topFaultDevices.map(d => d.count).reverse(),
    itemStyle: { color: '#ff5722', borderRadius: [0, 2, 2, 0] }, barWidth: 20,
    label: { show: true, position: 'right', color: chartTextColor, fontSize: 11 },
  }],
}))

const alarmLevelOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e0e0e0', textStyle: { color: '#333', fontSize: 12 } },
  legend: { data: ['活跃', '已确认', '已解决'], textStyle: { color: chartTextColor, fontSize: 12 }, bottom: 0 },
  grid: { left: 40, right: 20, top: 20, bottom: 40 },
  xAxis: {
    type: 'category', data: ['严重', '告警', '信息'],
    axisLine: { lineStyle: { color: chartAxisColor } }, axisTick: { show: false },
    axisLabel: { color: chartTextColor, fontSize: 11 },
  },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: chartTextColor, fontSize: 11 } },
  series: [
    { name: '活跃', type: 'line', data: [stats.value.criticalAlarms, stats.value.warningAlarms, stats.value.infoAlarms], smooth: true, lineStyle: { color: '#ff5722', width: 2 }, itemStyle: { color: '#ff5722' }, symbol: 'circle', symbolSize: 6 },
    { name: '已确认', type: 'line', data: [stats.value.acknowledgedAlarms, 4, 2], smooth: true, lineStyle: { color: '#ffb800', width: 2 }, itemStyle: { color: '#ffb800' }, symbol: 'diamond', symbolSize: 6 },
    { name: '已解决', type: 'line', data: [stats.value.resolvedAlarms - 100, 60, 30], smooth: true, lineStyle: { color: '#2461E9', width: 2 }, itemStyle: { color: '#2461E9' }, symbol: 'triangle', symbolSize: 6 },
  ],
}))

function refreshStats() { stats.value = getFaultStatistics(); ElMessage.success('数据已刷新') }
function exportDashboard() {
  const data = JSON.stringify(stats.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `Dashboard_${new Date().toISOString().slice(0,10)}.json`
  a.click(); URL.revokeObjectURL(url); ElMessage.success('报表已导出')
}
</script>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; height: calc(100vh - var(--header-height) - 32px); overflow-y: auto; }
.page-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; flex-wrap: wrap; gap: 8px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.page-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; flex-shrink: 0; }
.chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; flex-shrink: 0; }
.chart-card { background: var(--bg-card); }
@media (max-width: 1200px) { .stat-cards { grid-template-columns: repeat(2, 1fr); } .chart-row { grid-template-columns: 1fr; } }
</style>
