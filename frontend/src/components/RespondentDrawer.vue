<!--
  zh: 统计页抽屉 — 点击散点后从右侧滑出，展示个人坐标图和答题详情
  en: Statistics drawer — slides in from right on scatter click, shows personal chart and answer details
  ja: 統計ページのドロワー — 散布図クリック後に右からスライドインし、個人チャートと回答詳細を表示する
-->
<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    direction="rtl"
    size="420px"
    @close="emit('close')"
  >
    <div v-if="loading" class="center">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="detail" class="drawer-body">
      <!-- zh: 基本信息 | en: Basic info | ja: 基本情報 -->
      <div class="info-block">
        <div v-for="(val, key) in detail.info" :key="key" class="info-row">
          <span class="label">{{ key }}</span>
          <span class="val">{{ val }}</span>
        </div>
        <div class="info-row">
          <span class="label">{{ t('admin.data.type') }}</span>
          <el-tag :color="typeColor(detail.type)">{{ typeName(detail.type) }}</el-tag>
        </div>
        <div class="info-row">
          <span class="label">{{ t('admin.data.time') }}</span>
          <span class="val">{{ detail.created_at?.slice(0, 16).replace('T', ' ') }}</span>
        </div>
        <div class="info-row">
          <span class="label">{{ t('admin.data.lang') }}</span>
          <span class="val">{{ detail.lang?.toUpperCase() }}</span>
        </div>
      </div>

      <!-- zh: 个人坐标轴小图 | en: Personal Kolb chart | ja: 個人コルブチャート -->
      <div class="section-title">Kolb</div>
      <KolbChart
        :ac-ce="detail.axes?.AC_CE"
        :ae-ro="detail.axes?.AE_RO"
        :small="true"
      />

      <!-- zh: 原始分值 | en: Raw scores | ja: 生スコア -->
      <div class="section-title">{{ t('admin.data.rawScores') }}</div>
      <div class="scores-grid">
        <div v-for="dim in ['CE','RO','AC','AE']" :key="dim" class="score-item">
          <span class="dim">{{ dim }}</span>
          <span class="score">{{ detail.scores?.[dim] }}</span>
        </div>
        <div class="score-item">
          <span class="dim">AC-CE</span>
          <span class="score">{{ detail.axes?.AC_CE }}</span>
        </div>
        <div class="score-item">
          <span class="dim">AE-RO</span>
          <span class="score">{{ detail.axes?.AE_RO }}</span>
        </div>
      </div>

      <!-- zh: 数值序列 | en: Numeric vector | ja: 数値ベクトル -->
      <div class="section-title">{{ t('admin.data.vector') }}</div>
      <div class="vector-box">
        <code>{{ JSON.stringify(detail.vector) }}</code>
        <el-button size="small" @click="copyVector">
          {{ copied ? t('admin.data.copied') : t('admin.data.copy') }}
        </el-button>
      </div>

      <!-- zh: 下载此记录 | en: Download record | ja: レコードをダウンロード -->
      <el-dropdown trigger="click" @command="downloadRecord">
        <el-button type="primary" plain style="width:100%;margin-top:12px">
          {{ t('admin.data.downloadRecord') }} <el-icon><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="json">JSON</el-dropdown-item>
            <el-dropdown-item command="csv">CSV</el-dropdown-item>
            <el-dropdown-item command="xlsx">XLSX</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- zh: 答题详情 | en: Answer details | ja: 回答詳細 -->
      <div class="section-title">{{ t('admin.data.answers') }}</div>
      <div v-for="q in detail.answeredQuestions" :key="q.id" class="answer-item">
        <div class="q-stem">Q{{ q.order_num }}. {{ q.stem[currentLang] }}</div>
        <div v-for="opt in q.options" :key="opt.key" class="opt-row" :class="{ chosen: opt.key === q.selected }">
          <el-icon v-if="opt.key === q.selected"><Check /></el-icon>
          <span v-else class="spacer" />
          {{ opt.key }}. {{ opt.text[currentLang] }}
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '../stores/admin'
import KolbChart from './KolbChart.vue'
import { exportData } from '../utils/export'

const { t, locale } = useI18n()
const adminStore = useAdminStore()

const props = defineProps({
  respondentId: { type: String, default: null }
})
const emit = defineEmits(['close'])

const visible = ref(false)
const loading = ref(false)
const detail = ref(null)
const copied = ref(false)

const currentLang = computed(() => locale.value)

const drawerTitle = computed(() => {
  if (!detail.value) return ''
  return Object.values(detail.value.info || {}).join(' · ')
})

const TYPE_COLORS = {
  converging: '#EBF5FB', assimilating: '#F5EEF8',
  diverging: '#FEF9E7', accommodating: '#EAFAF1'
}

function typeColor(type) { return TYPE_COLORS[type] || '#eee' }
function typeName(type) { return t(`test.result.axis.${type}`) }

// zh: 监听传入 ID，有 ID 则打开抽屉并加载数据
// en: Watch respondentId, open drawer and load data when set
// ja: respondentId を監視し、設定されたらドロワーを開いてデータを読み込む
watch(() => props.respondentId, async (id) => {
  if (!id) return
  visible.value = true
  loading.value = true
  detail.value = null
  detail.value = await adminStore.getRespondentDetail(id)
  loading.value = false
})

function copyVector() {
  navigator.clipboard.writeText(JSON.stringify(detail.value.vector))
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function downloadRecord(format) {
  const name = Object.values(detail.value.info || {}).join('_')
  exportData([detail.value], format, `respondent_${name}.${format}`)
}
</script>

<style scoped>
.drawer-body { padding: 0 4px; }
.center { padding: 40px; text-align: center; }
.info-block { background: #f8f9fa; border-radius: 8px; padding: 14px; margin-bottom: 16px; }
.info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
.label { color: #888; }
.val { color: #2c3e50; font-weight: 500; }
.section-title { font-weight: 600; color: #4A90B8; margin: 16px 0 8px; font-size: 14px; }
.scores-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.score-item { background: #eaf4fb; border-radius: 8px; padding: 8px; text-align: center; }
.dim { font-size: 12px; color: #888; display: block; }
.score { font-size: 18px; font-weight: bold; color: #4A90B8; }
.vector-box { display: flex; align-items: center; gap: 8px; background: #f0f0f0; border-radius: 6px; padding: 8px 12px; font-size: 12px; word-break: break-all; }
.vector-box code { flex: 1; }
.answer-item { margin-bottom: 14px; font-size: 13px; }
.q-stem { font-weight: 500; color: #2c3e50; margin-bottom: 4px; }
.opt-row { display: flex; align-items: center; gap: 4px; padding: 2px 0; color: #888; }
.opt-row.chosen { color: #4A90B8; font-weight: 600; }
.spacer { width: 14px; display: inline-block; }
</style>
