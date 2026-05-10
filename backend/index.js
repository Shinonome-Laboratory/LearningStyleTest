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
  let restored = 0
  for (const row of rows) {
    const exists = await db('respondents').where({ id: row.id }).first()
    if (!exists) {
      await db('respondents').insert(row)
      restored++
    }
  }
  if (restored > 0) {
    console.log(`[zh] 已从 CSV 恢复 ${restored} 条记录 | [en] Restored ${restored} records from CSV`)
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

restoreFromCSV().then(() => {
  app.listen(PORT, () => {
    console.log(`[zh] 服务已启动 | [en] Server running | [ja] サーバー起動 → http://localhost:${PORT}`)
  })
})
