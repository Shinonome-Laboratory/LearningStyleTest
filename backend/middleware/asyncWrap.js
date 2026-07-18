/**
 * zh: async 路由错误包装器 — Express 4 不会捕获 async 处理器抛出的异常，
 *     不包装会导致请求永久挂起，这里统一转交给全局错误处理器
 * en: Async route error wrapper — Express 4 does not catch errors thrown in
 *     async handlers (requests hang forever); forward them to the global handler
 * ja: async ルートエラーラッパー — Express 4 は async ハンドラーの例外を
 *     捕捉しない（リクエストがハングする）ため、グローバルハンドラーへ転送する
 */
const asyncWrap = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncWrap
