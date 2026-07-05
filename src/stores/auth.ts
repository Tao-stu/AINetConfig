import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  username: string
  role: 'admin' | 'operator' | 'viewer'
  avatar: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || 'viewer')

  function login(username: string, password: string): boolean {
    const mockUsers: Record<string, { password: string; role: UserInfo['role']; avatar: string }> = {
      admin: { password: 'admin123', role: 'admin', avatar: '' },
      operator: { password: 'oper123', role: 'operator', avatar: '' },
      viewer: { password: 'view123', role: 'viewer', avatar: '' },
    }

    const u = mockUsers[username]
    if (u && u.password === password) {
      const t = 'mock_token_' + Date.now()
      token.value = t
      user.value = { username, role: u.role, avatar: u.avatar }
      localStorage.setItem('ops_token', t)
      localStorage.setItem('ops_role', u.role)
      localStorage.setItem('ops_username', username)
      return true
    }
    return false
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('ops_token')
    localStorage.removeItem('ops_role')
    localStorage.removeItem('ops_username')
  }

  function restoreSession() {
    const t = localStorage.getItem('ops_token')
    const r = localStorage.getItem('ops_role') as UserInfo['role'] | null
    const u = localStorage.getItem('ops_username')
    if (t && r && u) {
      token.value = t
      user.value = { username: u, role: r, avatar: '' }
    }
  }

  return { user, token, isLoggedIn, userRole, login, logout, restoreSession }
})
