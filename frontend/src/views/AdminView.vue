<!--
  zh: 管理控制台页面 — 登录 + 四标签（题目管理、数据、统计、设置）
  en: Admin console page — login + four tabs (questions, data, stats, settings)
  ja: 管理コンソールページ — ログイン + 4タブ（問題管理・データ・統計・設定）
-->
<template>
  <div class="page">
    <header class="navbar">
      <span class="logo">{{ t('nav.title') }} Admin</span>
      <div style="display:flex;gap:8px;align-items:center">
        <div class="lang-switch">
          <el-button
            v-for="l in ['zh','en','ja']"
            :key="l"
            size="small"
            :type="locale === l ? 'primary' : ''"
            text
            @click="switchLang(l)"
          >{{ t(`lang.${l}`) }}</el-button>
        </div>
        <el-button v-if="store.isLoggedIn" size="small" @click="store.logout()">
          {{ t('admin.login.logout') }}
        </el-button>
      </div>
    </header>

    <!-- ── 登录页 ─────────────────────────────────────────────────────── -->
    <div v-if="!store.isLoggedIn" class="login-wrap">
      <el-card class="login-card" shadow="always">
        <h2>🔒 {{ t('admin.login.title') }}</h2>
        <el-form @submit.prevent="doLogin">
          <el-form-item :label="t('admin.login.password')">
            <el-input
              v-model="password"
              type="password"
              show-password
              :class="{ shake: loginError }"
              @animationend="loginError = false"
            />
          </el-form-item>
          <p v-if="loginError" class="error">{{ t('admin.login.wrongPassword') }}</p>
          <el-button native-type="submit" type="primary" :loading="loginLoading" style="width:100%">
            {{ t('admin.login.submit') }}
          </el-button>
        </el-form>
      </el-card>
    </div>

    <!-- ── 控制台主界面 ───────────────────────────────────────────────── -->
    <main v-else class="console">
      <el-tabs v-model="activeTab" @tab-change="onTabChange">

        <!-- ── 题目管理 ──────────────────────────────────────────────── -->
        <el-tab-pane :label="t('admin.tabs.questions')" name="questions">
          <div class="tab-layout">
            <div class="sidebar">
              <div class="sidebar-label">{{ t('admin.questions.theory') }}</div>
              <el-radio-group v-model="store.selectedTheory" direction="vertical" class="theory-selector" @change="store.loadQuestions()">
                <el-radio-button
                  v-for="th in store.theories"
                  :key="th.id"
                  :value="th.id"
                >{{ th.name[locale] }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="content">
              <div class="toolbar">
                <el-button type="success" @click="openTheoryDialog()">
                  + {{ t('admin.theories.add') }}
                </el-button>
                <el-button type="primary" @click="openQuestionDialog()">
                  + {{ t('admin.questions.add') }}
                </el-button>
              </div>
              <el-table :data="store.questions" border stripe>
                <el-table-column type="index" width="50" />
                <el-table-column :label="t('admin.questions.stem')" min-width="240">
                  <template #default="{ row }">{{ row.stem[locale] }}</template>
                </el-table-column>
                <el-table-column :label="t('admin.questions.options')" width="60" align="center">
                  <template #default="{ row }">{{ row.options.length }}</template>
                </el-table-column>
                <el-table-column width="140" align="center">
                  <template #default="{ row }">
                    <el-button size="small" @click="openQuestionDialog(row)">{{ t('admin.questions.edit') }}</el-button>
                    <el-popconfirm
                      :title="t('admin.questions.confirmDelete')"
                      @confirm="store.deleteQuestion(row.id)"
                    >
                      <template #reference>
                        <el-button size="small" type="danger">{{ t('admin.questions.delete') }}</el-button>
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- ── 数据 ─────────────────────────────────────────────────── -->
        <el-tab-pane :label="t('admin.tabs.data')" name="data">
          <div class="toolbar">
            <el-dropdown trigger="click" @command="(f) => exportData(store.respondents, f)">
              <el-button type="primary" plain>
                {{ t('admin.data.exportAll') }} <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="json">JSON</el-dropdown-item>
                  <el-dropdown-item command="csv">CSV</el-dropdown-item>
                  <el-dropdown-item command="xlsx">XLSX</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-table :data="store.respondents" border stripe row-key="id">
            <el-table-column :label="t('admin.data.name')" min-width="120">
              <template #default="{ row }">
                {{ Object.values(row.info || {}).join(' / ') }}
              </template>
            </el-table-column>
            <el-table-column :label="t('admin.data.type')" width="100">
              <template #default="{ row }">
                <el-tag>{{ t(`test.result.axis.${row.type}`) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('admin.data.acce')" prop="axes.AC_CE" width="80" align="center">
              <template #default="{ row }">{{ row.axes?.AC_CE }}</template>
            </el-table-column>
            <el-table-column :label="t('admin.data.aero')" width="80" align="center">
              <template #default="{ row }">{{ row.axes?.AE_RO }}</template>
            </el-table-column>
            <el-table-column :label="t('admin.data.lang')" width="70" align="center">
              <template #default="{ row }">{{ row.lang?.toUpperCase() }}</template>
            </el-table-column>
            <el-table-column :label="t('admin.data.time')" width="140">
              <template #default="{ row }">{{ row.created_at?.slice(0,16).replace('T',' ') }}</template>
            </el-table-column>
            <el-table-column width="160" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="selectedRespondentId = row.id">
                  {{ t('admin.data.answers') }}
                </el-button>
                <el-dropdown trigger="click" @command="(f) => exportSingle(row, f)">
                  <el-button size="small" type="success" plain>↓</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="json">JSON</el-dropdown-item>
                      <el-dropdown-item command="csv">CSV</el-dropdown-item>
                      <el-dropdown-item command="xlsx">XLSX</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-popconfirm
                  :title="t('admin.data.confirmDeleteRecord')"
                  @confirm="store.deleteRespondent(row.id)"
                >
                  <template #reference>
                    <el-button size="small" type="danger" plain>✕</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ── 统计 ─────────────────────────────────────────────────── -->
        <el-tab-pane :label="t('admin.tabs.stats')" name="stats">
          <div class="stats-header">
            <h3>{{ t('admin.stats.title') }}</h3>
            <span class="total-count">{{ t('admin.stats.total', { n: store.respondents.length }) }}</span>
          </div>
          <p class="tip">{{ t('admin.stats.clickTip') }}</p>

          <!-- zh: 多人散点图 | en: Multi-person scatter | ja: 複数人散布図 -->
          <KolbChart
            :points="scatterPoints"
            @point-click="(id) => selectedRespondentId = id"
          />

          <!-- zh: 类型分布统计条 | en: Type distribution | ja: タイプ分布 -->
          <div class="dist-row">
            <div
              v-for="(count, type) in typeCounts"
              :key="type"
              class="dist-item"
            >
              <el-tag>{{ t(`test.result.axis.${type}`) }}</el-tag>
              <span class="count">{{ count }} 人</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- ── 设置 ─────────────────────────────────────────────────── -->
        <el-tab-pane :label="t('admin.tabs.settings')" name="settings">
          <div class="settings-section">
            <h3>{{ t('admin.settings.infoFields') }}</h3>
            <div v-for="(field, i) in editableFields" :key="i" class="field-row">
              <el-input v-model="field.name.zh" placeholder="中文" style="width:100px" />
              <el-input v-model="field.name.en" placeholder="English" style="width:100px" />
              <el-input v-model="field.name.ja" placeholder="日本語" style="width:100px" />
              <el-select v-model="field.type" style="width:90px">
                <el-option value="text" :label="t('admin.settings.text')" />
                <el-option value="number" :label="t('admin.settings.number')" />
              </el-select>
              <el-checkbox v-model="field.required">{{ t('admin.settings.required') }}</el-checkbox>
              <el-button type="danger" circle size="small" @click="editableFields.splice(i, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button @click="editableFields.push({ name: { zh:'', en:'', ja:'' }, type:'text', required:false })">
              + {{ t('admin.settings.addField') }}
            </el-button>
            <el-button type="primary" @click="saveFields">{{ t('admin.settings.saveFields') }}</el-button>
          </div>

          <el-divider />

          <div class="settings-section">
            <h3>{{ t('admin.settings.password') }}</h3>
            <el-form label-position="top" style="max-width:300px">
              <el-form-item :label="t('admin.settings.newPassword')">
                <el-input v-model="newPwd" type="password" show-password />
              </el-form-item>
              <el-form-item :label="t('admin.settings.confirmPassword')">
                <el-input v-model="confirmPwd" type="password" show-password />
              </el-form-item>
              <p v-if="pwdError" class="error">{{ t('admin.settings.passwordMismatch') }}</p>
              <el-button type="primary" @click="savePwd">{{ t('admin.settings.savePassword') }}</el-button>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- zh: 题目编辑弹窗 | en: Question edit dialog | ja: 問題編集ダイアログ -->
    <el-dialog v-model="questionDialogVisible" width="680px" :title="editingQuestion?.id ? t('admin.questions.edit') : t('admin.questions.add')">
      <el-form v-if="editingQuestion" label-position="top">
        <el-form-item v-for="l in ['zh','en','ja']" :key="l" :label="t('admin.questions.stemLang', { lang: l.toUpperCase() })">
          <el-input v-model="editingQuestion.stem[l]" type="textarea" :rows="2" />
        </el-form-item>
        <el-divider>{{ t('admin.questions.options') }}</el-divider>
        <div v-for="(opt, oi) in editingQuestion.options" :key="opt.key" class="opt-edit">
          <strong>{{ opt.key }}</strong>
          <el-input v-for="l in ['zh','en','ja']" :key="l" v-model="opt.text[l]" :placeholder="l" style="flex:1" />
          <div class="scores-edit">
            <span v-for="dim in ['CE','RO','AC','AE']" :key="dim">
              {{ dim }}<el-input-number v-model="opt.scores[dim]" :min="0" :max="9" size="small" style="width:70px" />
            </span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="questionDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveQuestion">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- zh: 新增理论弹窗 | en: Add theory dialog | ja: 理論追加ダイアログ -->
    <el-dialog v-model="theoryDialogVisible" width="600px" :title="t('admin.theories.add')">
      <el-form v-if="editingTheory" label-position="top">
        <el-form-item :label="t('admin.theories.id')">
          <el-input v-model="editingTheory.id" :placeholder="t('admin.theories.idPlaceholder')" />
          <p v-if="theoryIdError" class="error">{{ theoryIdError }}</p>
        </el-form-item>
        <el-form-item :label="t('admin.theories.name')">
          <div style="display:flex;gap:8px">
            <el-input v-model="editingTheory.name.zh" placeholder="中文" />
            <el-input v-model="editingTheory.name.en" placeholder="English" />
            <el-input v-model="editingTheory.name.ja" placeholder="日本語" />
          </div>
        </el-form-item>
        <el-form-item :label="t('admin.theories.dimensions')">
          <el-input v-model="editingTheory.dimensions" :placeholder="t('admin.theories.dimensionsPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('admin.theories.axes')">
          <div v-for="(axis, i) in editingTheory.axes" :key="i" class="axis-row">
            <el-input v-model="axis.name" :placeholder="t('admin.theories.axisName')" style="width:100px" />
            <el-input v-model="axis.formula" :placeholder="t('admin.theories.axisFormulaPlaceholder')" style="width:110px" />
            <el-input v-model="axis.label.zh" placeholder="标签(zh)" style="width:90px" />
            <el-input v-model="axis.label.en" placeholder="label(en)" style="width:90px" />
            <el-input v-model="axis.label.ja" placeholder="ラベル(ja)" style="width:90px" />
            <el-button type="danger" circle size="small" @click="editingTheory.axes.splice(i, 1)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-button size="small" @click="editingTheory.axes.push({ name:'', formula:'', label:{ zh:'', en:'', ja:'' } })">
            {{ t('admin.theories.addAxis') }}
          </el-button>
        </el-form-item>
        <el-form-item :label="t('admin.theories.types')">
          <el-input
            v-model="editingTheory.types"
            type="textarea"
            :rows="4"
            :placeholder="t('admin.theories.typesPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="theoryDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveTheory">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>

    <!-- zh: 被测者详情抽屉 | en: Respondent detail drawer | ja: 回答者詳細ドロワー -->
    <RespondentDrawer
      :respondent-id="selectedRespondentId"
      @close="selectedRespondentId = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '../stores/admin'
import KolbChart from '../components/KolbChart.vue'
import RespondentDrawer from '../components/RespondentDrawer.vue'
import { exportData as doExport } from '../utils/export'

const { t, locale } = useI18n()
const store = useAdminStore()

const activeTab = ref('questions')
const password = ref('')
const loginError = ref(false)
const loginLoading = ref(false)
const selectedRespondentId = ref(null)
const questionDialogVisible = ref(false)
const editingQuestion = ref(null)
const theoryDialogVisible = ref(false)
const editingTheory = ref(null)
const theoryIdError = ref('')
const editableFields = ref([])
const newPwd = ref('')
const confirmPwd = ref('')
const pwdError = ref(false)

onMounted(async () => {
  if (store.isLoggedIn) {
    await store.loadTheories()
    await store.loadQuestions()
    await store.loadRespondents()
    await store.loadInfoFields()
    editableFields.value = JSON.parse(JSON.stringify(store.infoFields))
  }
})

function switchLang(l) {
  locale.value = l
  localStorage.setItem('lst-lang', l)
}

async function doLogin() {
  loginLoading.value = true
  try {
    await store.login(password.value)
    await store.loadTheories()
    await store.loadQuestions()
    await store.loadRespondents()
    await store.loadInfoFields()
    editableFields.value = JSON.parse(JSON.stringify(store.infoFields))
  } catch {
    loginError.value = true
  }
  loginLoading.value = false
}

async function onTabChange(tab) {
  if (tab === 'data' || tab === 'stats') await store.loadRespondents()
}

// zh: 散点图数据格式转换
// en: Convert respondents to scatter chart format
// ja: 回答者データを散布図形式に変換する
const scatterPoints = computed(() =>
  store.respondents.map(r => ({
    id: r.id,
    AC_CE: r.axes?.AC_CE,
    AE_RO: r.axes?.AE_RO,
    type: r.type,
    label: Object.values(r.info || {}).join(' / ')
  }))
)

// zh: 各类型人数统计
// en: Count per type
// ja: タイプ別人数集計
const typeCounts = computed(() => {
  const counts = {}
  for (const r of store.respondents) {
    counts[r.type] = (counts[r.type] || 0) + 1
  }
  return counts
})

function openTheoryDialog() {
  editingTheory.value = {
    id: '',
    name: { zh: '', en: '', ja: '' },
    dimensions: '',
    axes: [{ name: '', formula: '', label: { zh: '', en: '', ja: '' } }],
    types: ''
  }
  theoryIdError.value = ''
  theoryDialogVisible.value = true
}

async function saveTheory() {
  const th = editingTheory.value
  if (!/^[a-z0-9-]+$/.test(th.id)) {
    theoryIdError.value = t('admin.theories.idInvalid')
    return
  }
  try {
    await store.addTheory({
      id: th.id,
      name: th.name,
      dimensions: th.dimensions.split(',').map(s => s.trim()).filter(Boolean),
      axes: th.axes,
      types: th.types.split('\n').map(s => s.trim()).filter(Boolean)
    })
    theoryDialogVisible.value = false
    ElMessage.success(t('admin.settings.savedSuccess'))
  } catch (e) {
    if (e.response?.data?.error === 'id_exists') {
      theoryIdError.value = t('admin.theories.idExists')
    }
  }
}

function openQuestionDialog(q) {
  if (q) {
    editingQuestion.value = JSON.parse(JSON.stringify(q))
  } else {
    editingQuestion.value = {
      theory_id: store.selectedTheory,
      stem: { zh: '', en: '', ja: '' },
      options: ['A','B','C','D'].map(key => ({
        key,
        text: { zh: '', en: '', ja: '' },
        scores: { CE: 0, RO: 0, AC: 0, AE: 0 }
      }))
    }
  }
  questionDialogVisible.value = true
}

async function saveQuestion() {
  const q = editingQuestion.value
  if (q.id) {
    await store.updateQuestion(q.id, { stem: q.stem, options: q.options })
  } else {
    await store.addQuestion({ theory_id: q.theory_id, stem: q.stem, options: q.options })
  }
  questionDialogVisible.value = false
}

function exportData(data, format) {
  doExport(data, format)
}

function exportSingle(row, format) {
  const name = Object.values(row.info || {}).join('_')
  doExport([row], format, `respondent_${name}.${format}`)
}

async function saveFields() {
  await store.saveInfoFields(editableFields.value)
  ElMessage.success(t('admin.settings.savedSuccess'))
}

async function savePwd() {
  if (newPwd.value !== confirmPwd.value) { pwdError.value = true; return }
  pwdError.value = false
  await store.changePassword(newPwd.value)
  newPwd.value = ''
  confirmPwd.value = ''
  ElMessage.success(t('admin.settings.savedSuccess'))
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f8fc; }
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 24px; height: 56px;
  background: #fff; box-shadow: 0 1px 8px rgba(0,0,0,0.06);
  position: sticky; top: 0; z-index: 10;
}
.logo { font-size: 18px; font-weight: 700; color: #4A90B8; }
.login-wrap { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 56px); }
.login-card { width: 340px; }
.login-card h2 { text-align: center; margin-bottom: 20px; }
.console { padding: 16px 24px; }
.tab-layout { display: flex; gap: 24px; }
.sidebar { min-width: 140px; }
.sidebar-label { font-size: 13px; color: #888; margin-bottom: 8px; }
.content { flex: 1; }
.toolbar { margin-bottom: 12px; }
.stats-header { display: flex; align-items: center; gap: 12px; }
.total-count { color: #888; font-size: 14px; }
.tip { color: #aaa; font-size: 13px; margin: 4px 0 12px; }
.dist-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px; }
.dist-item { display: flex; align-items: center; gap: 6px; }
.count { font-weight: 600; color: #2c3e50; }
.settings-section { max-width: 700px; margin-bottom: 16px; }
.settings-section h3 { color: #4A90B8; margin-bottom: 12px; }
.field-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.opt-edit { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 8px; }
.scores-edit { display: flex; gap: 8px; align-items: center; }
.axis-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; }
.theory-selector :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
  box-shadow: -1px 0 0 0 #67c23a !important;
  color: #fff !important;
}
.error { color: #e74c3c; font-size: 13px; }

/* zh: 抖动动画（密码错误时）| en: Shake animation (on wrong password) | ja: シェークアニメーション（パスワードエラー時） */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.shake { animation: shake 0.4s ease; border-color: #e74c3c !important; }
</style>
