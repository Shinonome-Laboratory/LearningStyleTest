<!--
  zh: 答题卡片 — 支持两种模式：Likert 5分量表（键值为"1"-"5"）和传统4选项
  en: Question card — supports Likert scale (keys "1"-"5") and classic 4-option mode
  ja: 質問カード — リッカート5段階尺度（キー"1"〜"5"）と従来の4択モードに対応
-->
<template>
  <div class="question-card">
    <p class="stem">{{ question.stem[lang] }}</p>

    <!-- zh: Likert 5分量表模式 | en: Likert scale | ja: リッカート尺度 -->
    <div v-if="isLikert" class="likert-wrap">
      <span class="end-label">{{ question.options[0].text[lang] }}</span>
      <div class="likert-scale">
        <button
          v-for="opt in question.options"
          :key="opt.key"
          class="likert-btn"
          :class="{ selected: selected === opt.key }"
          @click="choose(opt.key)"
        >
          {{ opt.key }}
        </button>
      </div>
      <span class="end-label end-label--right">{{ question.options[4].text[lang] }}</span>
    </div>

    <!-- zh: 传统4选项模式 | en: Classic 4-option mode | ja: 従来の4択モード -->
    <div v-else class="options">
      <div
        v-for="opt in question.options"
        :key="opt.key"
        class="option"
        :class="{ selected: selected === opt.key }"
        @click="choose(opt.key)"
      >
        <span class="key">{{ opt.key }}</span>
        <span class="text">{{ opt.text[lang] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// zh: 题目卡片不持有状态，通过 props 展示并 emit 事件
// en: Stateless card; display via props and emit events only
// ja: カードはステートレス。props で表示し、イベントのみ発行する
import { computed } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  selected: { type: String, default: null },
  lang:     { type: String, default: 'zh' }
})

const emit = defineEmits(['answer'])

// zh: 判断是否为 Likert 量表格式（选项键为 "1"-"5"）
// en: Detect Likert format (option keys are "1"-"5")
// ja: リッカート形式を検出（オプションキーが "1"〜"5"）
const isLikert = computed(() =>
  props.question.options?.length === 5 && props.question.options[0]?.key === '1'
)

function choose(key) {
  emit('answer', { questionId: props.question.id, key })
}
</script>

<style scoped>
.question-card {
  background: #fff;
  border-radius: 14px;
  padding: 36px 32px 28px;
  box-shadow: 0 4px 20px rgba(74, 144, 184, 0.12);
  max-width: 660px;
  margin: 0 auto;
}
.stem {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.7;
  margin-bottom: 28px;
  text-align: center;
}

/* ── Likert scale ──────────────────────────────────────── */
.likert-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.end-label {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  max-width: 80px;
  text-align: center;
  line-height: 1.3;
  flex-shrink: 0;
}
.end-label--right { text-align: center; }
.likert-scale {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: center;
}
.likert-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #d0e8f7;
  background: #f8fbff;
  font-size: 17px;
  font-weight: 700;
  color: #7fb3d3;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.likert-btn:hover {
  border-color: #4A90B8;
  background: #e8f4fd;
  color: #4A90B8;
  transform: scale(1.08);
}
.likert-btn.selected {
  border-color: #4A90B8;
  background: #4A90B8;
  color: #fff;
  transform: scale(1.12);
  box-shadow: 0 4px 14px rgba(74, 144, 184, 0.35);
}

/* ── Classic 4-option ──────────────────────────────────── */
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border: 2px solid #e8f4fd;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.option:hover  { border-color: #4A90B8; background: #f0f8ff; }
.option.selected { border-color: #4A90B8; background: #e8f4fd; }
.key {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #4A90B8;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  flex-shrink: 0;
}
.text { font-size: 15px; color: #34495e; }

/* ── 移动端 | Mobile | モバイル ──────────────────────────── */
@media (max-width: 600px) {
  .question-card { padding: 24px 16px 20px; }
  .stem { font-size: 16px; }
  .likert-btn { width: 40px; height: 40px; font-size: 15px; }
  .likert-scale { gap: 6px; }
  .end-label { font-size: 11px; max-width: 60px; }
}
</style>
