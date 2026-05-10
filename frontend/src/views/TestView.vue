<!--
  zh: 被测者端页面 — 四步流程：理论选择 → 信息填写 → 答题 → 结果
  en: Test-taker page — four steps: theory select → info → quiz → result
  ja: 被験者側ページ — 4ステップ：理論選択 → 情報入力 → 回答 → 結果
-->
<template>
  <div class="page">
    <!-- zh: 顶部导航栏 | en: Top navbar | ja: トップナビバー -->
    <header class="navbar">
      <span class="logo">{{ t('nav.title') }}</span>
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
    </header>

    <main class="main">
      <!-- ── Step 0: 理论选择 ───────────────────────────────────────────── -->
      <div v-if="store.step === 0" class="step-box">
        <h2>{{ t('test.selectTheory') }}</h2>
        <el-select v-model="store.selectedTheory" style="width:280px">
          <el-option
            v-for="th in theories"
            :key="th.id"
            :value="th.id"
            :label="th.name[locale]"
          />
        </el-select>
        <el-button type="primary" :disabled="!store.selectedTheory" @click="goToInfo">
          {{ t('test.next') }}
        </el-button>
      </div>

      <!-- ── Step 1 + 2: 步骤指示器 ────────────────────────────────────── -->
      <el-steps
        v-if="store.step >= 1 && store.step <= 2"
        :active="store.step - 1"
        align-center
        class="steps"
      >
        <el-step :title="t('test.steps.info')" />
        <el-step :title="t('test.steps.quiz')" />
        <el-step :title="t('test.steps.result')" />
      </el-steps>

      <!-- ── Step 1: 信息填写 ──────────────────────────────────────────── -->
      <div v-if="store.step === 1" class="step-box">
        <h2>{{ t('test.fillInfo') }}</h2>
        <el-form :model="store.infoValues" label-position="top" style="max-width:400px;margin:0 auto">
          <el-form-item
            v-for="field in store.infoFields"
            :key="field.name[locale]"
            :label="field.name[locale]"
            :required="field.required"
          >
            <el-input
              v-model="store.infoValues[field.name.zh]"
              :type="field.type === 'number' ? 'number' : 'text'"
              :placeholder="field.name[locale]"
            />
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="goToQuiz">{{ t('test.startTest') }}</el-button>
        <p v-if="infoError" class="error">{{ t('test.fillAll') }}</p>
      </div>

      <!-- ── Step 2: 答题 ──────────────────────────────────────────────── -->
      <div v-if="store.step === 2" class="quiz-wrap">
        <!-- zh: 可点击的进度条 | en: Clickable progress bar | ja: クリック可能な進捗バー -->
        <div class="progress-bar">
          <div
            v-for="(q, i) in store.questions"
            :key="q.id"
            class="progress-dot"
            :class="{
              answered: store.answers[q.id],
              current: i === store.currentIndex
            }"
            @click="store.currentIndex = i"
          />
        </div>
        <div class="progress-label">
          {{ t('test.progress', { current: store.currentIndex + 1, total: store.questions.length }) }}
        </div>

        <QuestionCard
          v-if="store.currentQuestion"
          :question="store.currentQuestion"
          :selected="store.answers[store.currentQuestion.id]"
          :lang="locale"
          @answer="onAnswer"
        />

        <el-button
          v-if="store.allAnswered"
          type="primary"
          size="large"
          :loading="store.loading"
          style="margin-top:24px"
          @click="store.submit()"
        >{{ t('test.submit') }}</el-button>
      </div>

      <!-- ── Step 3: 结果 ──────────────────────────────────────────────── -->
      <div v-if="store.step === 3 && store.result" class="result-wrap">
        <div class="result-hero">
          <!-- zh: 类型小人图片 | en: Type character image | ja: タイプキャラクター画像 -->
          <img
            :src="`/assets/design/kolb-${store.result.type}.png`"
            :alt="store.result.type"
            class="type-img"
            @error="(e) => e.target.style.display='none'"
          />
          <div class="result-info">
            <div class="type-tag">{{ t('test.result.yourType') }}</div>
            <h1 class="type-name">
              {{ store.result.typeContent?.name?.[locale] }}
            </h1>
            <p class="type-desc">
              {{ store.result.typeContent?.description?.[locale] }}
            </p>
          </div>
        </div>

        <!-- zh: 坐标轴图 | en: Coordinate chart | ja: 座標チャート -->
        <KolbChart
          :ac-ce="store.result.axes.AC_CE"
          :ae-ro="store.result.axes.AE_RO"
        />

        <!-- zh: 特点列表 | en: Traits list | ja: 特徴リスト -->
        <div class="section">
          <h3>{{ t('test.result.traits') }}</h3>
          <ul>
            <li v-for="(trait, i) in store.result.typeContent?.traits" :key="i">
              {{ trait[locale] }}
            </li>
          </ul>
        </div>

        <!-- zh: 学习建议 | en: Suggestions | ja: 学習アドバイス -->
        <div class="section">
          <h3>{{ t('test.result.suggestions') }}</h3>
          <ul>
            <li v-for="(s, i) in store.result.typeContent?.suggestions" :key="i">
              {{ s[locale] }}
            </li>
          </ul>
        </div>

        <el-button @click="store.reset()">{{ t('test.retake') }}</el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useTestStore } from '../stores/test'
import QuestionCard from '../components/QuestionCard.vue'
import KolbChart from '../components/KolbChart.vue'

const { t, locale } = useI18n()
const store = useTestStore()
const theories = ref([])
const infoError = ref(false)

onMounted(async () => {
  const { data } = await axios.get('/api/settings/theories')
  theories.value = data
  if (data.length === 1) store.selectedTheory = data[0].id
  await store.loadInfoFields()
})

// zh: 切换语言并保存偏好
// en: Switch language and save preference
// ja: 言語を切り替えて設定を保存する
function switchLang(l) {
  locale.value = l
  localStorage.setItem('lst-lang', l)
  store.lang = l
}

async function goToInfo() {
  store.step = 1
}

async function goToQuiz() {
  // zh: 验证必填字段
  // en: Validate required fields
  // ja: 必須フィールドを検証する
  const missing = store.infoFields
    .filter(f => f.required && !store.infoValues[f.name.zh])
  if (missing.length) { infoError.value = true; return }
  infoError.value = false
  await store.loadQuestions(store.selectedTheory)
  store.step = 2
}

// zh: 记录答案并自动跳下一题
// en: Record answer and auto-advance to next question
// ja: 回答を記録し、自動的に次の問題へ進む
function onAnswer({ questionId, key }) {
  store.setAnswer(questionId, key)
  setTimeout(() => {
    if (store.currentIndex < store.questions.length - 1) {
      store.currentIndex++
    }
  }, 300)
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
.main { max-width: 720px; margin: 0 auto; padding: 40px 16px; }
.step-box { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.step-box h2 { font-size: 22px; color: #2c3e50; }
.steps { margin-bottom: 32px; }
.quiz-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.progress-bar {
  display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;
  max-width: 600px;
}
.progress-dot {
  width: 14px; height: 14px; border-radius: 50%;
  background: #ddd; cursor: pointer; transition: background 0.2s;
}
.progress-dot.answered { background: #4A90B8; }
.progress-dot.current { background: #2c7fb8; box-shadow: 0 0 0 3px rgba(74,144,184,0.3); }
.progress-label { color: #888; font-size: 14px; }
.result-wrap { display: flex; flex-direction: column; gap: 24px; }
.result-hero {
  display: flex; align-items: center; gap: 24px;
  background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 4px 20px rgba(74,144,184,0.1);
}
.type-img { width: 120px; height: 120px; object-fit: contain; }
.type-tag { font-size: 13px; color: #888; margin-bottom: 4px; }
.type-name { font-size: 28px; font-weight: 700; color: #2c3e50; margin: 0 0 8px; }
.type-desc { color: #555; line-height: 1.6; margin: 0; }
.section { background: #fff; border-radius: 12px; padding: 20px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.section h3 { color: #4A90B8; margin-bottom: 12px; }
.section ul { padding-left: 20px; margin: 0; }
.section li { line-height: 2; color: #34495e; }
.error { color: #e74c3c; font-size: 14px; }

/* zh: 移动端适配 | en: Mobile | ja: モバイル対応 */
@media (max-width: 480px) {
  .result-hero { flex-direction: column; text-align: center; }
  .type-img { width: 90px; height: 90px; }
}
</style>
