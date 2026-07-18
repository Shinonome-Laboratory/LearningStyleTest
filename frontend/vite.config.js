/**
 * zh: Vite 配置 — 开发时将 /api 代理到后端服务；构建时按依赖库分包
 * en: Vite config — proxy /api to backend in dev; split vendor chunks on build
 * ja: Vite 設定 — 開発中に /api をバックエンドへプロキシし、ビルド時にチャンク分割する
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
  },
  build: {
    rollupOptions: {
      output: {
        // zh: 大依赖各自成块，避免 2.6MB 单文件首屏
        // en: Isolate heavy deps into their own chunks (was one 2.6MB bundle)
        // ja: 重い依存関係を個別チャンクに分離する（元は 2.6MB の単一ファイル）
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          echarts: ['echarts'],
          xlsx: ['xlsx']
        }
      }
    }
  }
})
