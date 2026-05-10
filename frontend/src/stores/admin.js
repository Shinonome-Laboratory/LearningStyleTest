/**
 * zh: 管理控制台状态管理（登录、题目、数据、设置）
 * en: Admin console state management (login, questions, data, settings)
 * ja: 管理コンソールの状態管理（ログイン・問題・データ・設定）
 */
import { defineStore } from 'pinia'
import axios from 'axios'

// zh: 从 sessionStorage 读取 token，页面刷新后保持登录
// en: Read token from sessionStorage to persist login on refresh
// ja: ページリフレッシュ後もログインを維持するため sessionStorage から token を読み込む
const getToken = () => sessionStorage.getItem('lst-admin-token')
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` })

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isLoggedIn: !!getToken(),
    token: getToken(),
    theories: [],
    selectedTheory: 'kolb',
    questions: [],
    respondents: [],
    infoFields: [],
    loading: false
  }),

  actions: {
    // zh: 管理员登录
    // en: Admin login
    // ja: 管理者ログイン
    async login(password) {
      const { data } = await axios.post('/api/settings/login', { password })
      this.token = data.token
      this.isLoggedIn = true
      sessionStorage.setItem('lst-admin-token', data.token)
    },

    // zh: 退出登录，清除 token
    // en: Logout and clear token
    // ja: ログアウトして token をクリアする
    logout() {
      this.token = null
      this.isLoggedIn = false
      sessionStorage.removeItem('lst-admin-token')
    },

    // zh: 加载理论列表
    // en: Load theory list
    // ja: 理論リストを読み込む
    async loadTheories() {
      const { data } = await axios.get('/api/settings/theories')
      this.theories = data
    },

    async addTheory(theory) {
      await axios.post('/api/settings/theories', theory, { headers: authHeader() })
      await this.loadTheories()
    },

    // zh: 加载当前理论下的题目
    // en: Load questions for current theory
    // ja: 現在の理論の問題を読み込む
    async loadQuestions() {
      const { data } = await axios.get(`/api/questions?theory_id=${this.selectedTheory}`)
      this.questions = data
    },

    async addQuestion(question) {
      await axios.post('/api/questions', question, { headers: authHeader() })
      await this.loadQuestions()
    },

    async updateQuestion(id, question) {
      await axios.put(`/api/questions/${id}`, question, { headers: authHeader() })
      await this.loadQuestions()
    },

    async deleteQuestion(id) {
      await axios.delete(`/api/questions/${id}`, { headers: authHeader() })
      await this.loadQuestions()
    },

    // zh: 加载所有被测者数据
    // en: Load all respondent data
    // ja: すべての回答者データを読み込む
    async loadRespondents() {
      const { data } = await axios.get(
        `/api/respondents?theory_id=${this.selectedTheory}`,
        { headers: authHeader() }
      )
      this.respondents = data
    },

    async deleteRespondent(id) {
      await axios.delete(`/api/respondents/${id}`, { headers: authHeader() })
      await this.loadRespondents()
    },

    // zh: 获取单个被测者详情（含答题详情）
    // en: Get single respondent detail (with answer details)
    // ja: 個々の回答者の詳細を取得する（回答詳細を含む）
    async getRespondentDetail(id) {
      const { data } = await axios.get(`/api/respondents/${id}`, { headers: authHeader() })
      return data
    },

    async loadInfoFields() {
      const { data } = await axios.get('/api/settings/info-fields')
      this.infoFields = data
    },

    async saveInfoFields(fields) {
      await axios.put('/api/settings/info-fields', fields, { headers: authHeader() })
      this.infoFields = fields
    },

    async changePassword(password) {
      await axios.put('/api/settings/password', { password }, { headers: authHeader() })
    }
  }
})
