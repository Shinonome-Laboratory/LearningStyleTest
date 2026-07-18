/**
 * zh: 被测者数据路由（提交答卷、查询、导出）
 * en: Respondent data routes (submit, query, export)
 * ja: 回答者データルート（提出・照会・エクスポート）
 */
const router = require('express').Router()
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const { requireAdmin } = require('../middleware/auth')
const asyncWrap = require('../middleware/asyncWrap')
const { calculate } = require('../scoring/kolb')
const { appendRow, removeRow } = require('../utils/userdata')

const parse = row => ({
  ...row,
  info: JSON.parse(row.info),
  scores: JSON.parse(row.scores),
  axes: JSON.parse(row.axes),
  vector: JSON.parse(row.vector),
  answers: JSON.parse(row.answers)
})

// zh: 提交问卷（被测者端调用，无需鉴权）
// en: Submit questionnaire (called by test-taker, no auth required)
// ja: アンケートを提出する（被験者側から呼び出し、認証不要）
router.post('/', asyncWrap(async (req, res) => {
  const { theory_id = 'kolb', lang = 'zh', info = {}, answers } = req.body

  // zh: 基本输入校验，拒绝格式非法的请求
  // en: Basic input validation, reject malformed requests
  // ja: 基本的な入力検証、不正なリクエストを拒否する
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers_required' })
  }

  // zh: 从数据库读取题目选项，用于计分（用 Map 加速查找）
  // en: Load question options from DB for scoring (Map for O(1) lookup)
  // ja: 採点のためにDBから問題の選項を読み込む（Map で高速検索）
  const questions = await db('questions').where({ theory_id }).orderBy('order_num')
  const questionMap = new Map(questions.map(q => [String(q.id), q]))
  const answersWithOptions = answers
    .map(a => {
      const q = questionMap.get(String(a.question_id))
      return q ? { ...a, options: JSON.parse(q.options) } : null
    })
    .filter(Boolean)

  if (answersWithOptions.length === 0) {
    return res.status(400).json({ error: 'no_valid_answers' })
  }

  const { scores, axes, type, vector } = calculate(answersWithOptions)

  const id = uuidv4()
  const created_at = new Date().toISOString()
  const dbRow = {
    id,
    theory_id,
    lang,
    info: JSON.stringify(info),
    scores: JSON.stringify(scores),
    axes: JSON.stringify(axes),
    type,
    vector: JSON.stringify(vector),
    answers: JSON.stringify(answers),
    created_at
  }
  await db('respondents').insert(dbRow)
  appendRow(dbRow)

  // zh: 同时返回类型内容，供结果页展示
  // en: Also return type content for the result page
  // ja: 結果ページ表示のためにタイプコンテンツも返す
  const typeContent = await db('type_content').where({ theory_id, type }).first()

  res.json({
    id, scores, axes, type, vector,
    typeContent: typeContent ? {
      name: JSON.parse(typeContent.name),
      description: JSON.parse(typeContent.description),
      traits: JSON.parse(typeContent.traits),
      suggestions: JSON.parse(typeContent.suggestions)
    } : null
  })
}))

// zh: 获取所有被测者列表（需要管理员权限）
// en: Get all respondents list (requires admin auth)
// ja: すべての回答者リストを取得する（管理者権限が必要）
router.get('/', requireAdmin, asyncWrap(async (req, res) => {
  const { theory_id } = req.query
  let query = db('respondents').orderBy('created_at', 'desc')
  if (theory_id) query = query.where({ theory_id })
  const rows = await query
  res.json(rows.map(parse))
}))

// zh: 获取单个被测者详情（需要管理员权限）
// en: Get single respondent detail (requires admin auth)
// ja: 個々の回答者の詳細を取得する（管理者権限が必要）
router.get('/:id', requireAdmin, asyncWrap(async (req, res) => {
  const row = await db('respondents').where({ id: req.params.id }).first()
  if (!row) return res.status(404).json({ error: 'Not found' })

  const parsed = parse(row)

  // zh: 附加完整的题目信息（含答案），供管理端展示答题详情
  // en: Attach full question info with answers for admin detail view
  // ja: 管理者側の回答詳細表示のために、回答付きの完全な問題情報を添付する
  const questions = await db('questions')
    .where({ theory_id: row.theory_id })
    .orderBy('order_num')
  const answeredQuestions = questions.map(q => {
    const stem = JSON.parse(q.stem)
    const options = JSON.parse(q.options)
    const answer = parsed.answers.find(a => String(a.question_id) === String(q.id))
    return { id: q.id, order_num: q.order_num, stem, options, selected: answer?.option_key }
  })

  res.json({ ...parsed, answeredQuestions })
}))

// zh: 删除单个被测者记录（需要管理员权限）
// en: Delete a respondent record (requires admin auth)
// ja: 回答者レコードを削除する（管理者権限が必要）
router.delete('/:id', requireAdmin, asyncWrap(async (req, res) => {
  await db('respondents').where({ id: req.params.id }).del()
  removeRow(req.params.id)
  res.json({ ok: true })
}))

module.exports = router
