/**
 * zh: 后端入口文件 — Express 服务启动
 * en: Backend entry — Express server startup
 * ja: バックエンドエントリ — Express サーバー起動
 */
require('dotenv').config()
const express = require('express')
const cors = require('cors')

const questionsRouter = require('./routes/questions')
const respondentsRouter = require('./routes/respondents')
const settingsRouter = require('./routes/settings')
const db = require('./db')
const { readAll } = require('./utils/userdata')

const app = express()
const PORT = process.env.PORT || 3000

// zh: 启动时从 Userdata/respondents.csv 回填数据库中缺失的记录
// en: On startup, reload any rows from CSV that are missing from the DB
// ja: 起動時に CSV から DB に不足しているレコードを補填する
async function restoreFromCSV() {
  const rows = readAll()
  if (!rows.length) return
  // zh: 一次查出已有 id，批量插入缺失记录，避免逐行往返数据库
  // en: Fetch existing ids once and batch-insert missing rows (no per-row round trips)
  // ja: 既存 id を一括取得し、不足レコードをバッチ挿入する（1行ずつの往復を回避）
  const existing = new Set((await db('respondents').select('id')).map(r => r.id))
  const missing = rows.filter(row => row.id && !existing.has(row.id))
  if (missing.length) {
    await db.batchInsert('respondents', missing, 50)
    console.log(`[zh] 已从 CSV 恢复 ${missing.length} 条记录 | [en] Restored ${missing.length} records from CSV`)
  }
}

app.use(cors())
app.use(express.json())

// zh: API 路由挂载
// en: API route mounting
// ja: API ルートのマウント
app.use('/api/questions', questionsRouter)
app.use('/api/respondents', respondentsRouter)
app.use('/api/settings', settingsRouter)

// zh: 健康检查端点
// en: Health check endpoint
// ja: ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// zh: 全局错误处理
// en: Global error handler
// ja: グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

restoreFromCSV()
  .catch(err => {
    // zh: CSV 回填失败不应阻止服务启动
    // en: A failed CSV restore must not block server startup
    // ja: CSV 復元の失敗でサーバー起動を妨げない
    console.error('[restoreFromCSV]', err)
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[zh] 服务已启动 | [en] Server running | [ja] サーバー起動 → http://localhost:${PORT}`)
    })
  })
