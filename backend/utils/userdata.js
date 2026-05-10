/**
 * zh: Userdata CSV 持久化工具 — 追加、删除、读取全部记录
 * en: Userdata CSV persistence — append, remove, read all
 * ja: Userdata CSV 永続化ユーティリティ — 追加・削除・全件読み込み
 *
 * CSV 列顺序固定，JSON 字段以双引号包裹写入，启动时原样回填数据库。
 */
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'Userdata')
const CSV_PATH = path.join(DATA_DIR, 'respondents.csv')

const COLUMNS = ['id', 'theory_id', 'lang', 'type', 'info', 'scores', 'axes', 'vector', 'answers', 'created_at']

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

// zh: 将单个字段值转义为 CSV 格式（含引号和逗号时包裹双引号）
function escapeField(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function rowToLine(row) {
  return COLUMNS.map(col => escapeField(row[col])).join(',')
}

// zh: 简单 CSV 单行解析，支持带引号的字段
function parseLine(line) {
  const fields = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') { inQuote = false }
      else { cur += c }
    } else {
      if (c === '"') { inQuote = true }
      else if (c === ',') { fields.push(cur); cur = '' }
      else { cur += c }
    }
  }
  fields.push(cur)
  return fields
}

// zh: 追加一行记录（文件不存在时先写入表头）
function appendRow(row) {
  ensureDir()
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, COLUMNS.join(',') + '\n', 'utf8')
  }
  fs.appendFileSync(CSV_PATH, rowToLine(row) + '\n', 'utf8')
}

// zh: 从 CSV 删除指定 id 的行（重写文件）
function removeRow(id) {
  if (!fs.existsSync(CSV_PATH)) return
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n')
  const kept = lines.filter((line, i) => {
    if (i === 0 || !line.trim()) return true  // 保留表头和空行
    return parseLine(line)[0] !== id
  })
  fs.writeFileSync(CSV_PATH, kept.join('\n'), 'utf8')
}

// zh: 读取全部记录，返回对象数组（字段值均为字符串，与数据库存储格式一致）
function readAll() {
  if (!fs.existsSync(CSV_PATH)) return []
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  return lines.slice(1).map(line => {
    const fields = parseLine(line)
    const obj = {}
    COLUMNS.forEach((col, i) => { obj[col] = fields[i] ?? '' })
    return obj
  })
}

module.exports = { appendRow, removeRow, readAll }
