/**
 * zh: 应用入口 — 注册 Vue 插件并挂载应用
 * en: App entry — register Vue plugins and mount
 * ja: アプリエントリ — Vue プラグインを登録してマウントする
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'
import zh from './i18n/zh.json'
import en from './i18n/en.json'
import ja from './i18n/ja.json'

// zh: 从 localStorage 读取上次使用的语言，默认中文
// en: Read last used language from localStorage, default to Chinese
// ja: localStorage から最後に使用した言語を読み込む（デフォルトは中国語）
const savedLang = localStorage.getItem('lst-lang') || 'zh'

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { zh, en, ja }
})

const app = createApp(App)

// zh: 注册所有 Element Plus 图标
// en: Register all Element Plus icons
// ja: すべての Element Plus アイコンを登録する
for (const [name, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, comp)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.mount('#app')
