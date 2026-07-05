import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录', noAuth: true },
  },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    redirect: '/topology',
    children: [
      {
        path: 'topology',
        name: 'Topology',
        component: () => import('@/views/TopologyView.vue'),
        meta: { title: '网络拓扑', icon: 'topology', roles: ['admin', 'operator', 'viewer'] },
      },
      {
        path: 'config',
        name: 'ConfigViewer',
        component: () => import('@/views/ConfigViewer.vue'),
        meta: { title: '配置管理', icon: 'config', roles: ['admin', 'operator'] },
      },
      {
        path: 'diagnosis',
        name: 'Diagnosis',
        component: () => import('@/views/DiagnosisView.vue'),
        meta: { title: 'AI故障诊断', icon: 'diagnosis', roles: ['admin', 'operator'] },
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '数据看板', icon: 'dashboard', roles: ['admin', 'operator', 'viewer'] },
      },
      {
        path: 'alarms',
        name: 'Alarms',
        component: () => import('@/views/AlarmView.vue'),
        meta: { title: '告警管理', icon: 'alarm', roles: ['admin', 'operator', 'viewer'] },
      },
      {
        path: 'deploy',
        name: 'Deploy',
        component: () => import('@/views/DeployView.vue'),
        meta: { title: '配置下发', icon: 'deploy', roles: ['admin'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || ''} - AI网络运维诊断平台`

  const token = localStorage.getItem('ops_token')
  const userRole = localStorage.getItem('ops_role') || 'viewer'

  if (to.meta.noAuth) {
    if (token) {
      next('/topology')
    } else {
      next()
    }
    return
  }

  if (!token) {
    next('/login')
    return
  }

  if (to.meta.roles) {
    const allowedRoles = to.meta.roles as string[]
    if (!allowedRoles.includes(userRole)) {
      next('/topology')
      return
    }
  }

  next()
})

export default router
