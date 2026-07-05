<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#2461E9" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
        </div>
        <h2 class="login-title">AI驱动网络运维</h2>
        <p class="login-subtitle">智能配置故障诊断平台</p>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="large"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="用户名"
          >
            <template #prefix>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="login-btn"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>演示账号: admin / admin123</p>
        <p>运维账号: operator / oper123</p>
        <p>只读账号: viewer / view123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

function handleLogin() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    loading.value = true
    setTimeout(() => {
      const success = authStore.login(formData.username, formData.password)
      loading.value = false

      if (success) {
        ElMessage.success('登录成功')
        router.push('/topology')
      } else {
        ElMessage.error('用户名或密码错误')
      }
    }, 600)
  })
}
</script>

<style scoped>
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #E9EEFE;
  border: 1px solid #B3C4F6;
  border-radius: 50%;
  margin-bottom: 16px;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 4px;
}

.login-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 2;
  font-family: var(--font-mono);
}
</style>
