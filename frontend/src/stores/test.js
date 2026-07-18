/**
 * zh: 被测者答题流程状态管理
 * en: Test-taker quiz flow state management
 * ja: 被験者のテストフロー状態管理
 */
import { defineStore } from 'pinia'
import axios from 'axios'

export const useTestStore = defineStore('test', {
  state: () => ({
    // zh: 当前步骤：0=理论选择, 1=信息填写, 2=答题, 3=结果
    // en: Current step: 0=theory, 1=info, 2=quiz, 3=result
    // ja: 現在のステップ: 0=理論, 1=情報, 2=回答, 3=結果
    step: 0,
    selectedTheory: null,
    infoFields: [],
    infoValues: {},
    questions: [],
    answers: {},       // { [question_id]: option_key }
    currentIndex: 0,
    result: null,
    loading: false,
    lang: localStorage.getItem('lst-lang') || 'zh'
  }),

  getters: {
    // zh: 当前正在回答的题目
    // en: Currently displayed question
    // ja: 現在表示されている問題
    currentQuestion: (s) => s.questions[s.currentIndex] || null,

    // zh: 已答题数
    // en: Number of answered questions
    // ja: 回答済み問題数
    answeredCount: (s) => Object.keys(s.answers).length,

    // zh: 是否全部答完
    // en: Whether all questions are answered
    // ja: すべての問題に回答したかどうか
    allAnswered: (s) => s.questions.length > 0 && Object.keys(s.answers).length === s.questions.length
  },

  actions: {
    // zh: 加载题目列表
    // en: Load questions from API
    // ja: API から問題リストを読み込む
    async loadQuestions(theoryId) {
      const { data } = await axios.get(`/api/questions?theory_id=${theoryId}`)
      this.questions = data
    },

    // zh: 加载信息字段配置
    // en: Load info field configuration
    // ja: 情報フィールド設定を読み込む
    async loadInfoFields() {
      const { data } = await axios.get('/api/settings/info-fields')
      this.infoFields = data
    },

    // zh: 记录某题的答案
    // en: Record answer for a question
    // ja: 問題の回答を記録する
    setAnswer(questionId, optionKey) {
      this.answers[questionId] = optionKey
    },

    // zh: 提交问卷，获取计算结果
    // en: Submit questionnaire and get result
    // ja: アンケートを提出して結果を取得する
    async submit() {
      this.loading = true
      // zh: question_id 是字符串主键（如 kolb-q01），不可 parseInt
      // en: question_id is a string primary key (e.g. kolb-q01) — never parseInt it
      // ja: question_id は文字列主キー（例: kolb-q01）のため parseInt してはいけない
      const answers = Object.entries(this.answers).map(([question_id, option_key]) => ({
        question_id,
        option_key
      }))
      try {
        const { data } = await axios.post('/api/respondents', {
          theory_id: this.selectedTheory,
          lang: this.lang,
          info: this.infoValues,
          answers
        })
        this.result = data
        this.step = 3
      } finally {
        this.loading = false
      }
    },

    // zh: 重置状态，重新开始测试
    // en: Reset state and restart test
    // ja: 状態をリセットしてテストを再開する
    reset() {
      this.step = 0
      this.selectedTheory = null
      this.infoValues = {}
      this.questions = []
      this.answers = {}
      this.currentIndex = 0
      this.result = null
    }
  }
})
