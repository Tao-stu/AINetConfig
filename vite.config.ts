import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['monaco-editor', '@antv/g6', 'echarts', 'vue-echarts'],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})
