/**
 * zh: 生成 20 条虚拟学生数据（中/日/英混合姓名），写入数据库 + Userdata/respondents.csv
 * en: Generate 20 fake students (mixed Chinese/Japanese/English names), write to DB + CSV
 *
 * 用法 / Usage: node scripts/seed_fake_students.js
 * 每次运行前会清空全部被测者记录并重建 CSV。
 */
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const { appendRow } = require('../utils/userdata')

const CSV_PATH = path.join(__dirname, '..', 'Userdata', 'respondents.csv')

// zh: 20 位虚拟学生：8 中文 / 6 日文 / 6 英文
const STUDENTS = [
  // ── 中文姓名 ──────────────────────────────────
  { name: '张伟',   sid: '2024001', lang: 'zh' },
  { name: '李娜',   sid: '2024002', lang: 'zh' },
  { name: '王芳',   sid: '2024003', lang: 'zh' },
  { name: '刘洋',   sid: '2024004', lang: 'zh' },
  { name: '陈志远', sid: '2024005', lang: 'zh' },
  { name: '赵雨薇', sid: '2024006', lang: 'zh' },
  { name: '黄浩然', sid: '2024007', lang: 'zh' },
  { name: '周思琦', sid: '2024008', lang: 'zh' },
  // ── 日文姓名 ──────────────────────────────────
  { name: '田中美咲',   sid: '2024009', lang: 'ja' },
  { name: '山本健太',   sid: '2024010', lang: 'ja' },
  { name: '佐藤花奈',   sid: '2024011', lang: 'ja' },
  { name: '鈴木一郎',   sid: '2024012', lang: 'ja' },
  { name: '中村さくら', sid: '2024013', lang: 'ja' },
  { name: '高橋龍也',   sid: '2024014', lang: 'ja' },
  // ── 英文姓名 ──────────────────────────────────
  { name: 'Alex Johnson',    sid: '2024015', lang: 'en' },
  { name: 'Emma Williams',   sid: '2024016', lang: 'en' },
  { name: 'Michael Chen',    sid: '2024017', lang: 'en' },
  { name: 'Sarah Davis',     sid: '2024018', lang: 'en' },
  { name: 'James Wilson',    sid: '2024019', lang: 'en' },
  { name: 'Olivia Martinez', sid: '2024020', lang: 'en' },
]

// zh: 各类型答题倾向权重（A=CE, B=RO, C=AC, D=AE）
const TYPE_BIAS = {
  converging:    { A: 1, B: 1, C: 4, D: 4 },
  assimilating:  { A: 1, B: 4, C: 4, D: 1 },
  diverging:     { A: 4, B: 4, C: 1, D: 1 },
  accommodating: { A: 4, B: 1, C: 1, D: 4 },
}

// zh: 20 人目标类型分布（6聚合 / 5同化 / 5发散 / 4适应）
const TARGET_TYPES = [
  'converging', 'converging', 'converging', 'converging', 'converging', 'converging',
  'assimilating', 'assimilating', 'assimilating', 'assimilating', 'assimilating',
  'diverging', 'diverging', 'diverging', 'diverging', 'diverging',
  'accommodating', 'accommodating', 'accommodating', 'accommodating',
]

function pickKey(bias) {
  const total = bias.A + bias.B + bias.C + bias.D
  const r = Math.random() * total
  if (r < bias.A) return 'A'
  if (r < bias.A + bias.B) return 'B'
  if (r < bias.A + bias.B + bias.C) return 'C'
  return 'D'
}

function generateAnswers(questions, targetType) {
  return questions.map(q => ({
    question_id: q.id,
    option_key: pickKey(TYPE_BIAS[targetType])
  }))
}

function computeScores(answers, questions) {
  const scores = { CE: 0, RO: 0, AC: 0, AE: 0 }
  for (const a of answers) {
    const q = questions.find(q => q.id === a.question_id)
    const opts = JSON.parse(q.options)
    const opt = opts.find(o => o.key === a.option_key)
    if (opt) {
      for (const [dim, val] of Object.entries(opt.scores)) scores[dim] += val
    }
  }
  return scores
}

function computeType({ AC_CE, AE_RO }) {
  if (AC_CE >= 0 && AE_RO >= 0) return 'converging'
  if (AC_CE >= 0 && AE_RO < 0) return 'assimilating'
  if (AC_CE < 0 && AE_RO < 0) return 'diverging'
  return 'accommodating'
}

function randomDate() {
  const now = Date.now()
  const offset = Math.floor(Math.random() * 60) * 86400000
              + Math.floor(Math.random() * 24) * 3600000
              + Math.floor(Math.random() * 60) * 60000
  return new Date(now - offset).toISOString()
}

async function main() {
  // zh: 清空旧数据
  await db('respondents').del()
  if (fs.existsSync(CSV_PATH)) fs.unlinkSync(CSV_PATH)
  console.log('已清空旧的被测者记录\n')

  const questions = await db('questions').where({ theory_id: 'kolb' }).orderBy('order_num')
  if (!questions.length) {
    console.error('未找到 kolb 题目，请先运行 knex seed:run。')
    process.exit(1)
  }

  for (let i = 0; i < STUDENTS.length; i++) {
    const { name, sid, lang } = STUDENTS[i]
    const targetType = TARGET_TYPES[i]

    let answers, scores, axes, type
    for (let attempt = 0; attempt < 8; attempt++) {
      answers = generateAnswers(questions, targetType)
      scores  = computeScores(answers, questions)
      axes    = { AC_CE: scores.AC - scores.CE, AE_RO: scores.AE - scores.RO }
      type    = computeType(axes)
      if (type === targetType) break
    }

    const id = uuidv4()
    const dbRow = {
      id,
      theory_id: 'kolb',
      lang,
      type,
      info:       JSON.stringify({ 姓名: name, 学号: sid }),
      scores:     JSON.stringify(scores),
      axes:       JSON.stringify(axes),
      vector:     JSON.stringify([scores.CE, scores.RO, scores.AC, scores.AE]),
      answers:    JSON.stringify(answers),
      created_at: randomDate(),
    }

    await db('respondents').insert(dbRow)
    appendRow(dbRow)

    const langTag = { zh: '中', ja: '日', en: 'EN' }[lang]
    console.log(`[${String(i + 1).padStart(2)}] [${langTag}] ${name.padEnd(12)}→ ${type.padEnd(13)} AC_CE=${String(axes.AC_CE).padStart(4)}  AE_RO=${String(axes.AE_RO).padStart(4)}`)
  }

  console.log('\n完成：共写入 20 条记录。')
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
