/**
 * zh: Vue Router 配置 — 定义 /test 和 /admin 两条路由
 * en: Vue Router config — defines /test and /admin routes
 * ja: Vue Router 設定 — /test と /admin の 2 つのルートを定義する
 */
import { createRouter, createWebHistory } from 'vue-router'
import TestView from '../views/TestView.vue'
import AdminView from '../views/AdminView.vue'

const routes = [
  { path: '/', redirect: '/test' },
  { path: '/test', component: TestView },
  { path: '/admin', component: AdminView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
