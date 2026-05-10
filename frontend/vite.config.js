/**
 * zh: Vite 配置 — 开发时将 /api 代理到后端服务
 * en: Vite config — proxy /api to backend during development
 * ja: Vite 設定 — 開発中に /api をバックエンドにプロキシする
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
