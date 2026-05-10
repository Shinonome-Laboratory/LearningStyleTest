/**
 * zh: 题目管理路由（增删改查）
 * en: Question management routes (CRUD)
 * ja: 問題管理ルート（CRUD）
 */
const router = require('express').Router()
const db = require('../db')
const { requireAdmin } = require('../middleware/auth')

const parse = row => ({
  ...row,
  stem: JSON.parse(row.stem),
  options: JSON.parse(row.options)
})

// zh: 获取指定理论下的所有题目（按序号排列）
// en: Get all questions for a theory (ordered by order_num)
// ja: 指定された理論のすべての問題を取得する（順序番号順）
router.get('/', async (req, res) => {
  const { theory_id = 'kolb' } = req.query
  const rows = await db('questions').where({ theory_id }).orderBy('order_num')
  res.json(rows.map(parse))
})

// zh: 新增题目（需要管理员权限）
// en: Add a new question (requires admin auth)
// ja: 新しい問題を追加する（管理者権限が必要）
router.post('/', requireAdmin, async (req, res) => {
  const { theory_id, stem, options } = req.body
  const maxOrder = await db('questions').where({ theory_id }).max('order_num as m').first()
  const order_num = (maxOrder.m || 0) + 1
  const [id] = await db('questions').insert({
    theory_id,
    order_num,
    stem: JSON.stringify(stem),
    options: JSON.stringify(options)
  })
  res.json({ id, order_num })
})

// zh: 更新题目内容（需要管理员权限）
// en: Update question content (requires admin auth)
// ja: 問題の内容を更新する（管理者権限が必要）
router.put('/:id', requireAdmin, async (req, res) => {
  const { stem, options } = req.body
  await db('questions').where({ id: req.params.id }).update({
    stem: JSON.stringify(stem),
    options: JSON.stringify(options)
  })
  res.json({ ok: true })
})

// zh: 删除题目（需要管理员权限）
// en: Delete a question (requires admin auth)
// ja: 問題を削除する（管理者権限が必要）
router.delete('/:id', requireAdmin, async (req, res) => {
  await db('questions').where({ id: req.params.id }).del()
  res.json({ ok: true })
})

module.exports = router
