/**
 * zh: 管理员身份验证中间件
 * en: Admin authentication middleware
 * ja: 管理者認証ミドルウェア
 */
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'lst-secret'

/**
 * zh: 验证请求头中的 JWT token
 * en: Verify the JWT token in the request header
 * ja: リクエストヘッダーの JWT トークンを検証する
 */
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    jwt.verify(auth.slice(7), SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * zh: 生成 JWT token（登录成功时调用）
 * en: Generate JWT token (called on successful login)
 * ja: JWT トークンを生成する（ログイン成功時に呼び出す）
 */
function signToken() {
  return jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '8h' })
}

module.exports = { requireAdmin, signToken }
