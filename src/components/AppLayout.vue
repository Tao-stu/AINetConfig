<template>
  <div class="app-layout">
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2461E9" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
        </div>
        <span class="sidebar-title">AI运维诊断平台</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :router="true"
        background-color="#f8f8f8"
        text-color="#666666"
        active-text-color="#2461E9"
        class="sidebar-menu"
      >
        <el-menu-item index="/topology">
          <svg class="menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>
            <line x1="12" y1="8" x2="6" y2="16"/><line x1="12" y1="8" x2="18" y2="16"/>
          </svg>
          <span>网络拓扑</span>
        </el-menu-item>

        <el-menu-item index="/config">
          <svg class="menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>配置管理</span>
        </el-menu-item>

        <el-menu-item index="/diagnosis">
          <svg class="menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>AI故障诊断</span>
        </el-menu-item>

        <el-menu-item index="/dashboard">
          <svg class="menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span>数据看板</span>
        </el-menu-item>

        <el-menu-item index="/alarms">
          <svg class="menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span>告警管理</span>
        </el-menu-item>

        <el-menu-item index="/deploy" v-if="authStore.userRole === 'admin'">
          <svg class="menu-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>配置下发</span>
        </el-menu-item>
      </el-menu>

    </aside>

    <div class="app-main">
      <header class="app-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="header-status">
            <span class="status-dot status-online"></span>
            <span>系统正常</span>
            <span class="status-separator">|</span>
            <span class="status-dot status-alert blink-danger"></span>
            <span style="color: var(--color-danger);">活跃告警: {{ activeAlarmCount }}</span>
          </div>
          <span class="header-time">{{ currentTime }}</span>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <span class="header-user-trigger">
          <span class="header-user-avatar">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span class="header-user-name">{{ authStore.user?.username }}</span>
          <svg class="header-user-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div class="app-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMockAlarms } from '@/utils/mock-data'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title as string || '')
const currentTime = ref('')
let timeTimer: number | undefined

const activeAlarmCount = computed(() => {
  return getMockAlarms().filter(a => a.status === 'active').length
})

function handleUserCommand(command: string) {
  if (command === 'logout') {
    handleLogout()
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

onMounted(() => {
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  background: #fff;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #E9EEFE;
  border-radius: var(--radius-sm);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  padding-top: 4px;
}

.menu-icon {
  margin-right: 8px;
  vertical-align: middle;
  flex-shrink: 0;
}

.sidebar-menu .el-menu-item {
  display: flex;
  align-items: center;
  height: 42px;
  line-height: 42px;
  font-size: 13px;
  margin: 1px 0;
  border-radius: 0;
}

.header-user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 10px 4px 6px;
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
  user-select: none;
}

.header-user-trigger:hover {
  background-color: var(--bg-hover);
}

.header-user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  flex-shrink: 0;
}

.header-user-name {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.header-user-arrow {
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-online {
  background-color: var(--color-success);
}

.status-alert {
  background-color: var(--color-danger);
}

.status-separator {
  color: var(--border-color);
  margin: 0 8px;
}

.header-time {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
