<template>
  <div class="deploy-page">
    <div class="page-toolbar">
      <h3 class="page-title">运维配置下发</h3>
      <el-button size="small" type="primary" @click="showCreateDeploy = true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新建下发任务
      </el-button>
    </div>

    <el-card shadow="never" class="deploy-table-card">
      <el-table :data="deployTasks" stripe style="width: 100%" height="calc(100vh - 370px)">
        <el-table-column prop="id" label="任务编号" width="110" />
        <el-table-column prop="name" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="下发类型" width="100">
          <template #default="{ row }">
            <el-tag :type="deployTypeTag(row.type)" size="small" effect="dark">{{ deployTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标设备" width="110">
          <template #default="{ row }">
            <el-tooltip :content="row.targetDevices.join(', ')" placement="top">
              <span>{{ row.targetDevices.length }} 台</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="deployStatusTag(row.status)" size="small" effect="dark">{{ deployStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="90" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="executeTime" label="执行时间" width="160" />
        <el-table-column prop="result" label="执行结果" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text @click="viewDeployDetail(row)">查看</el-button>
            <el-button v-if="row.status === 'draft' || row.status === 'pending'" size="small" text type="success" @click="executeDeploy(row)">执行</el-button>
            <el-button v-if="row.status === 'completed'" size="small" text type="warning" @click="rollbackDeploy(row)">回滚</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="deployDetailVisible" :title="'下发详情 - ' + currentDeploy?.name" width="750px" top="5vh">
      <div v-if="currentDeploy" class="deploy-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="任务编号">{{ currentDeploy.id }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ currentDeploy.name }}</el-descriptions-item>
          <el-descriptions-item label="下发类型">
            <el-tag :type="deployTypeTag(currentDeploy.type)" size="small" effect="dark">{{ deployTypeLabel(currentDeploy.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="deployStatusTag(currentDeploy.status)" size="small" effect="dark">{{ deployStatusLabel(currentDeploy.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标设备" :span="2">
            <el-tag v-for="d in currentDeploy.targetDevices" :key="d" size="small" style="margin:2px;">{{ d }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentDeploy.operator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDeploy.createTime }}</el-descriptions-item>
          <el-descriptions-item label="执行时间">{{ currentDeploy.executeTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="执行结果">{{ currentDeploy.result || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="deploy-step">
          <h4>部署步骤</h4>
          <el-steps :active="stepActive" finish-status="success" align-center simple>
            <el-step title="配置校验" />
            <el-step title="备份配置" />
            <el-step title="下发配置" />
            <el-step title="验证生效" />
            <el-step title="确认完成" />
          </el-steps>
        </div>

        <el-divider />

        <div class="deploy-config-section">
          <h4>下发配置内容</h4>
          <div class="config-preview">{{ currentDeploy.configContent }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deployDetailVisible = false">关闭</el-button>
        <el-button v-if="currentDeploy?.status === 'draft' || currentDeploy?.status === 'pending'" type="success" @click="executeCurrent">确认下发</el-button>
        <el-button v-if="currentDeploy?.status === 'completed'" type="warning" @click="rollbackCurrent">回滚配置</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCreateDeploy" title="新建配置下发任务" width="650px">
      <el-form :model="deployForm" label-position="top">
        <el-form-item label="任务名称" required>
          <el-input v-model="deployForm.name" placeholder="例如: VLAN 600 全网部署" />
        </el-form-item>
        <el-form-item label="下发类型" required>
          <el-radio-group v-model="deployForm.type">
            <el-radio value="incremental">增量下发</el-radio>
            <el-radio value="full">全量下发</el-radio>
            <el-radio value="rollback">配置回滚</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="目标设备" required>
          <el-select v-model="deployForm.targetDevices" multiple placeholder="选择目标设备" style="width:100%">
            <el-option v-for="d in deviceList" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="配置内容" required>
          <el-input v-model="deployForm.configContent" type="textarea" :rows="8" placeholder="输入需要下发的配置命令..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDeploy = false">取消</el-button>
        <el-button type="primary" @click="createDeployTask">创建任务</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getMockDeployTasks, type DeployTask } from '@/utils/mock-data'
import { ElMessage } from 'element-plus'

const deployTasks = ref<DeployTask[]>(getMockDeployTasks())
const currentDeploy = ref<DeployTask | null>(null)
const deployDetailVisible = ref(false)
const showCreateDeploy = ref(false)
const stepActive = ref(0)

const deviceList = [
  'Core-SW-01', 'Core-SW-02', 'Router-GW-01', 'Router-GW-02',
  'Agg-SW-01', 'Agg-SW-02', 'Agg-SW-03',
  'Acc-SW-04', 'Acc-SW-05', 'Acc-SW-06', 'Acc-SW-07',
  'FW-01', 'FW-02',
]

const deployForm = reactive({
  name: '', type: 'incremental' as DeployTask['type'],
  targetDevices: [] as string[], configContent: '',
})

function deployTypeLabel(t: string) { const m: Record<string, string> = { full: '全量下发', incremental: '增量下发', rollback: '配置回滚' }; return m[t] || t }
function deployTypeTag(t: string) { const m: Record<string, string> = { full: 'primary', incremental: 'success', rollback: 'warning' }; return m[t] || 'info' }
function deployStatusLabel(s: string) {
  const m: Record<string, string> = { draft: '草稿', pending: '待执行', running: '执行中', completed: '已完成', failed: '失败', rolled_back: '已回滚' }
  return m[s] || s
}
function deployStatusTag(s: string) {
  const m: Record<string, string> = { draft: 'info', pending: 'warning', running: 'warning', completed: 'success', failed: 'danger', rolled_back: 'info' }
  return m[s] || 'info'
}

function viewDeployDetail(row: DeployTask) {
  currentDeploy.value = row; deployDetailVisible.value = true
  const m: Record<string, number> = { draft: 0, pending: 1, running: 3, completed: 5, failed: 2, rolled_back: 1 }
  stepActive.value = m[row.status] || 0
}

function executeDeploy(row: DeployTask) {
  row.status = 'running'; row.executeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  ElMessage.info(`任务 ${row.id} 正在执行...`)
  setTimeout(() => { row.status = 'completed'; row.result = `${row.targetDevices.length}台设备配置下发成功`; ElMessage.success(`任务 ${row.id} 下发完成`) }, 3000)
}

function rollbackDeploy(row: DeployTask) {
  ElMessage.info(`正在回滚任务 ${row.id}...`)
  setTimeout(() => { row.status = 'rolled_back'; row.result = '配置已回滚至下发前状态'; ElMessage.success(`任务 ${row.id} 已回滚`) }, 2000)
}

function executeCurrent() { if (currentDeploy.value) { executeDeploy(currentDeploy.value); const m: Record<string, number> = { running: 3 }; stepActive.value = m[currentDeploy.value!.status] || 0 } }
function rollbackCurrent() { if (currentDeploy.value) rollbackDeploy(currentDeploy.value) }

function createDeployTask() {
  if (!deployForm.name) return ElMessage.warning('请输入任务名称')
  if (!deployForm.targetDevices.length) return ElMessage.warning('请选择目标设备')
  if (!deployForm.configContent) return ElMessage.warning('请输入配置内容')
  const nt: DeployTask = {
    id: 'DEP-' + String(deployTasks.value.length + 1).padStart(3, '0'),
    name: deployForm.name, targetDevices: [...deployForm.targetDevices],
    configContent: deployForm.configContent, type: deployForm.type,
    status: 'draft', createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    operator: 'admin',
  }
  deployTasks.value.unshift(nt); showCreateDeploy.value = false
  deployForm.name = ''; deployForm.targetDevices = []; deployForm.configContent = ''
  ElMessage.success('下发任务已创建')
}
</script>

<style scoped>
.deploy-page { display: flex; flex-direction: column; height: calc(100vh - var(--header-height) - 32px); }
.page-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
.page-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.deploy-table-card { flex: 1; min-height: 0; }
.deploy-detail { display: flex; flex-direction: column; }
.deploy-step h4, .deploy-config-section h4 { font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 10px; }
.config-preview {
  background: #fafafa; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  padding: 12px; font-family: var(--font-mono); font-size: 12px; color: #555;
  max-height: 200px; white-space: pre-wrap; overflow-y: auto;
}
</style>
