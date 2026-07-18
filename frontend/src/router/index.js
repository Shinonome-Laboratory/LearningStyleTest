/**
 * zh: Vue Router 配置 — 定义 /test 和 /admin 两条路由（懒加载分包）
 * en: Vue Router config — /test and /admin routes (lazy-loaded chunks)
 * ja: Vue Router 設定 — /test と /admin の 2 ルート（遅延読み込み）
 */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/test' },
  { path: '/test', component: () => import('../views/TestView.vue') },
  { path: '/admin', component: () => import('../views/AdminView.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
