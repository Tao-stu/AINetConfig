<template>
  <div class="topology-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <h3 class="page-title">网络设备拓扑</h3>
        <el-tag size="small" type="success" effect="dark">在线 {{ onlineCount }}</el-tag>
        <el-tag size="small" type="danger" effect="dark">故障 {{ offlineCount + warningCount }}</el-tag>
        <el-tag size="small" type="warning" effect="dark">待诊断 {{ pendingCount }}</el-tag>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button size="small" @click="zoomIn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </el-button>
          <el-button size="small" @click="zoomOut">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </el-button>
          <el-button size="small" @click="fitView">自适应</el-button>
        </el-button-group>
        <el-button size="small" @click="refreshTopo" :loading="refreshing">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          刷新
        </el-button>
      </div>
    </div>

    <div class="topo-main">
      <div class="topo-container" ref="topoContainer"></div>

      <div class="topo-sidebar">
        <el-card header="拓扑图例" shadow="never">
          <div class="legend-list">
            <div class="legend-item">
              <span class="legend-dot" style="background: #4caf50;"></span>
              <span>设备正常</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot blink-danger" style="background: #ff5722;"></span>
              <span>设备故障</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot pulse-warning" style="background: #ed6c00;"></span>
              <span>待诊断</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot pulse-warning" style="background: #ffb800;"></span>
              <span>告警中</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background: #999;"></span>
              <span>链路正常</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background: #ff5722; border-style: dashed;"></span>
              <span>链路中断</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background: #ed6c00; border-style: dashed;"></span>
              <span>链路降级</span>
            </div>
          </div>
        </el-card>

        <el-card header="设备详情" shadow="never" style="margin-top: 12px;">
          <div v-if="selectedNode" class="node-detail">
            <div class="detail-row"><span class="detail-label">设备名称</span><span>{{ selectedNode.label }}</span></div>
            <div class="detail-row"><span class="detail-label">设备类型</span><span>{{ typeLabel(selectedNode.type) }}</span></div>
            <div class="detail-row"><span class="detail-label">管理IP</span><span class="mono">{{ selectedNode.ip }}</span></div>
            <div class="detail-row"><span class="detail-label">厂商型号</span><span>{{ selectedNode.vendor }} {{ selectedNode.model }}</span></div>
            <div class="detail-row">
              <span class="detail-label">运行状态</span>
              <span :class="statusClass(selectedNode.status)">{{ statusLabel(selectedNode.status) }}</span>
            </div>
          </div>
          <div v-else class="node-detail-empty">点击拓扑节点查看详情</div>
        </el-card>
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="设备详细信息" width="600px">
      <div v-if="selectedNode" class="device-detail-dialog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ selectedNode.label }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ typeLabel(selectedNode.type) }}</el-descriptions-item>
          <el-descriptions-item label="管理IP">{{ selectedNode.ip }}</el-descriptions-item>
          <el-descriptions-item label="厂商">{{ selectedNode.vendor }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ selectedNode.model }}</el-descriptions-item>
          <el-descriptions-item label="运行状态">
            <el-tag :type="statusTagType(selectedNode.status)" size="small" effect="dark">
              {{ statusLabel(selectedNode.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="jumpToConfig">查看配置</el-button>
        <el-button type="primary" @click="jumpToDiagnosis" v-if="selectedNode && selectedNode.status !== 'normal'">发起诊断</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import G6 from '@antv/g6'
import { getMockTopologyNodes, getMockTopologyEdges, type TopologyNode, type TopologyEdge } from '@/utils/mock-data'

const router = useRouter()
const topoContainer = ref<HTMLElement>()
const selectedNode = ref<TopologyNode | null>(null)
const detailVisible = ref(false)
const refreshing = ref(false)

let graph: any = null
let blinkTimer: number | undefined
let resizeObserver: ResizeObserver | undefined

const nodes = ref<TopologyNode[]>(getMockTopologyNodes())
const edges = ref<TopologyEdge[]>(getMockTopologyEdges())

const onlineCount = computed(() => nodes.value.filter(n => n.status === 'normal').length)
const warningCount = computed(() => nodes.value.filter(n => n.status === 'warning').length)
const pendingCount = computed(() => nodes.value.filter(n => n.status === 'pending').length)
const offlineCount = computed(() => nodes.value.filter(n => n.status === 'critical').length)

const statusColorMap: Record<string, string> = {
  normal: '#4caf50',
  warning: '#ffb800',
  critical: '#ff5722',
  pending: '#ed6c00',
}

const statusIconBgMap: Record<string, string> = {
  normal: '#E9EEFE',
  warning: '#fff8e1',
  critical: '#fbe9e7',
  pending: '#fff3e0',
}

const iconMap: Record<string, string> = {
  router: 'R',
  switch: 'S',
  firewall: 'F',
  server: 'SRV',
  core: 'CORE',
}

function typeLabel(type: string) {
  const map: Record<string, string> = { router: '路由器', switch: '交换机', firewall: '防火墙', server: '服务器', core: '核心交换机' }
  return map[type] || type
}

function statusLabel(status: string) {
  const map: Record<string, string> = { normal: '运行正常', warning: '告警中', critical: '严重故障', pending: '待诊断' }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = { normal: 'status-normal', warning: 'status-warning', critical: 'status-critical', pending: 'status-pending' }
  return map[status] || ''
}

function statusTagType(status: string) {
  const map: Record<string, string> = { normal: 'success', warning: 'warning', critical: 'danger', pending: 'info' }
  return map[status] || 'info'
}

function initGraph() {
  if (!topoContainer.value) return

  const { width, height } = topoContainer.value.getBoundingClientRect()

  graph = new G6.Graph({
    container: topoContainer.value,
    width,
    height,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    },
    defaultNode: {
      type: 'circle',
      size: 50,
      style: {
        stroke: '#d9d9d9',
        lineWidth: 2,
        cursor: 'pointer',
      },
      labelCfg: {
        position: 'bottom',
        offset: 8,
        style: {
          fill: '#555',
          fontSize: 11,
          fontFamily: '-apple-system, sans-serif',
        },
      },
    },
    defaultEdge: {
      type: 'polyline',
      style: {
        stroke: '#b0b0b0',
        lineWidth: 1.5,
        endArrow: {
          path: G6.Arrow.triangle(6, 8, 0),
          fill: '#b0b0b0',
        },
      },
      labelCfg: {
        style: {
          fill: '#999',
          fontSize: 10,
        },
      },
    },
    layout: {
      type: 'force',
      preventOverlap: true,
      linkDistance: 150,
      nodeStrength: -200,
      edgeStrength: 0.5,
    },
    animate: true,
    fitView: true,
    fitViewPadding: 40,
  })

  graph.on('node:click', (e: any) => {
    const model = e.item.getModel()
    const node = nodes.value.find(n => n.id === model.id)
    if (node) {
      selectedNode.value = node
      detailVisible.value = true
    }
  })

  graph.on('node:mouseenter', (e: any) => {
    const model = e.item.getModel()
    const node = nodes.value.find(n => n.id === model.id)
    if (node) {
      selectedNode.value = node
    }
  })

  resizeObserver = new ResizeObserver(() => {
    if (topoContainer.value && graph) {
      const { width: w, height: h } = topoContainer.value.getBoundingClientRect()
      graph.changeSize(w, h)
      graph.fitView(40)
    }
  })
  resizeObserver.observe(topoContainer.value)

  renderTopo()
  startBlinkAnimation()
}

function renderTopo() {
  if (!graph) return

  const g6Nodes = nodes.value.map(n => ({
    id: n.id,
    label: n.label,
    x: n.x,
    y: n.y,
    size: n.type === 'core' ? 60 : 48,
    style: {
      fill: '#ffffff',
      stroke: statusColorMap[n.status] || '#d9d9d9',
      lineWidth: n.status === 'critical' ? 3 : 2.5,
      shadowColor: n.status === 'critical' ? 'rgba(255,87,34,0.3)' : 'rgba(0,0,0,0.08)',
      shadowBlur: n.status === 'critical' ? 10 : 4,
    },
    labelCfg: {
      position: 'bottom',
      offset: 8,
      style: {
        fill: '#555',
        fontSize: 11,
      },
    },
    type: 'circle',
  }))

  const edgeColorMap: Record<string, string> = {
    up: '#b0b0b0',
    down: '#ff5722',
    degraded: '#ed6c00',
  }

  const g6Edges = edges.value.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label + ' ' + e.bandwidth,
    style: {
      stroke: edgeColorMap[e.status] || '#b0b0b0',
      lineWidth: e.status === 'down' ? 2 : 1.5,
      lineDash: e.status === 'up' ? undefined : [6, 3],
      endArrow: {
        path: G6.Arrow.triangle(6, 8, 0),
        fill: edgeColorMap[e.status] || '#b0b0b0',
      },
    },
    labelCfg: {
      style: { fill: '#999', fontSize: 10 },
    },
  }))

  graph.data({ nodes: g6Nodes, edges: g6Edges })
  graph.render()
  graph.fitView(40)

  graph.getNodes().forEach((node: any) => {
    const model = node.getModel()
    const n = nodes.value.find(x => x.id === model.id)
    if (n) {
      drawNodeIcon(node, n.type)
      if (n.status === 'critical') {
        node.getContainer().classList.add('blink-danger')
      } else if (n.status === 'warning' || n.status === 'pending') {
        node.getContainer().classList.add('pulse-warning')
      }
    }
  })
}

function drawNodeIcon(node: any, type: string) {
  const group = node.getContainer()
  const icon = group.findById('type-icon')
  if (icon) return

  group.addShape('text', {
    id: 'type-icon',
    attrs: {
      x: 0,
      y: 0,
      text: iconMap[type] || '?',
      fill: '#555',
      fontSize: 11,
      fontWeight: 600,
      textAlign: 'center',
      textBaseline: 'middle',
      fontFamily: '-apple-system, sans-serif',
    },
    capture: false,
  })
}

function startBlinkAnimation() {
  let visible = true
  blinkTimer = window.setInterval(() => {
    if (!graph) return
    visible = !visible

    graph.getNodes().forEach((node: any) => {
      const model = node.getModel()
      const n = nodes.value.find(x => x.id === model.id)
      if (n && n.status === 'critical') {
        const container = node.getContainer()
        if (container) {
          const circle = container.findById('node-shape')
          if (circle) {
            circle.attr('opacity', visible ? 1 : 0.35)
          }
        }
      }
    })
  }, 800)
}

function zoomIn() {
  if (graph) {
    const zoom = graph.getZoom()
    graph.zoomTo(zoom * 1.2, { x: 0, y: 0 })
  }
}

function zoomOut() {
  if (graph) {
    const zoom = graph.getZoom()
    graph.zoomTo(zoom / 1.2, { x: 0, y: 0 })
  }
}

function fitView() {
  graph?.fitView(40)
}

function refreshTopo() {
  refreshing.value = true
  setTimeout(() => {
    nodes.value = getMockTopologyNodes()
    edges.value = getMockTopologyEdges()
    renderTopo()
    refreshing.value = false
  }, 600)
}

function jumpToConfig() {
  detailVisible.value = false
  router.push('/config')
}

function jumpToDiagnosis() {
  detailVisible.value = false
  router.push('/diagnosis')
}

onMounted(() => {
  nextTick(() => {
    initGraph()
  })
})

onUnmounted(() => {
  if (graph) {
    graph.destroy()
    graph = null
  }
  if (blinkTimer) clearInterval(blinkTimer)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
.topology-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height) - 32px);
}

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topo-main {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.topo-sidebar {
  width: 220px;
  flex-shrink: 0;
  overflow-y: auto;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.legend-line {
  width: 20px;
  height: 2px;
  flex-shrink: 0;
}

.node-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.node-detail-empty {
  color: var(--text-tertiary);
  font-size: 13px;
  text-align: center;
  padding: 10px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.detail-label {
  color: var(--text-tertiary);
}

.mono {
  font-family: var(--font-mono);
  font-size: 11px;
}

.status-normal { color: #4caf50; }
.status-warning { color: #ed6c00; }
.status-critical { color: #ff5722; }
.status-pending { color: #b8860b; }
</style>
