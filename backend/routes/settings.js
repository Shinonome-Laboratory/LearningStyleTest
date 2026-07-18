/**
 * zh: 系统设置路由（登录、密码修改、字段配置、理论列表）
 * en: Settings routes (login, password, field config, theory list)
 * ja: システム設定ルート（ログイン・パスワード・フィールド設定・理論リスト）
 */
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const db = require('../db')
const { requireAdmin, signToken } = require('../middleware/auth')
const asyncWrap = require('../middleware/asyncWrap')

// zh: 管理员登录，验证密码并返回 JWT
// en: Admin login, verify password and return JWT
// ja: 管理者ログイン、パスワードを検証して JWT を返す
router.post('/login', asyncWrap(async (req, res) => {
  const { password } = req.body
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'password_required' })
  }
  const row = await db('settings').where({ key: 'admin_password' }).first()
  const valid = row && await bcrypt.compare(password, row.value)
  if (!valid) return res.status(401).json({ error: 'Wrong password' })
  res.json({ token: signToken() })
}))

// zh: 修改管理员密码（需要管理员权限，至少 6 位）
// en: Change admin password (requires admin auth, min 6 chars)
// ja: 管理者パスワードを変更する（管理者権限が必要、6文字以上）
router.put('/password', requireAdmin, asyncWrap(async (req, res) => {
  const { password } = req.body
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'password_too_short' })
  }
  const hash = await bcrypt.hash(password, 10)
  await db('settings').where({ key: 'admin_password' }).update({ value: hash })
  res.json({ ok: true })
}))

// zh: 获取被测者信息字段配置
// en: Get respondent info field configuration
// ja: 回答者情報フィールドの設定を取得する
router.get('/info-fields', asyncWrap(async (req, res) => {
  const row = await db('settings').where({ key: 'info_fields' }).first()
  res.json(row ? JSON.parse(row.value) : [])
}))

// zh: 更新被测者信息字段配置（需要管理员权限）
// en: Update respondent info field configuration (requires admin auth)
// ja: 回答者情報フィールドの設定を更新する（管理者権限が必要）
router.put('/info-fields', requireAdmin, asyncWrap(async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'invalid_body' })
  }
  await db('settings').where({ key: 'info_fields' }).update({
    value: JSON.stringify(req.body)
  })
  res.json({ ok: true })
}))

// zh: 获取所有理论列表（供前端下拉菜单使用）
// en: Get all theories (for frontend dropdown)
// ja: すべての理論リストを取得する（フロントエンドのドロップダウン用）
router.get('/theories', asyncWrap(async (req, res) => {
  const rows = await db('theories')
  res.json(rows.map(r => ({ ...r, name: JSON.parse(r.name) })))
}))

// zh: 新增理论（需要管理员权限）
// en: Create a new theory (requires admin auth)
// ja: 新しい理論を作成する（管理者権限が必要）
router.post('/theories', requireAdmin, asyncWrap(async (req, res) => {
  const { id, name, dimensions, axes, types } = req.body
  if (!/^[a-z0-9-]+$/.test(id)) return res.status(400).json({ error: 'invalid_id' })
  const existing = await db('theories').where({ id }).first()
  if (existing) return res.status(409).json({ error: 'id_exists' })
  await db('theories').insert({
    id,
    name: JSON.stringify(name),
    dimensions: JSON.stringify(dimensions),
    axes: JSON.stringify(axes),
    types: JSON.stringify(types)
  })
  if (types.length) {
    await db('type_content').insert(types.map(type => ({
      theory_id: id,
      type,
      name: JSON.stringify({ zh: type, en: type, ja: type }),
      description: JSON.stringify({ zh: '', en: '', ja: '' }),
      traits: JSON.stringify([]),
      suggestions: JSON.stringify([])
    })))
  }
  res.json({ ok: true })
}))

module.exports = router
