/**
 * zh: Kolb 学习风格计分逻辑
 * en: Kolb Learning Style scoring logic
 * ja: コルブ学習スタイルの採点ロジック
 */

/**
 * zh: 根据答案计算各维度原始分
 * en: Calculate raw scores for each dimension based on answers
 * ja: 回答に基づいて各次元の生スコアを計算する
 *
 * @param {Array} answers - [{question_id, option_key, options}]
 * @returns {{CE, RO, AC, AE}}
 */
function calcScores(answers) {
  const scores = { CE: 0, RO: 0, AC: 0, AE: 0 }
  for (const { option_key, options } of answers) {
    const opt = options.find(o => o.key === option_key)
    if (!opt) continue
    for (const dim of ['CE', 'RO', 'AC', 'AE']) {
      scores[dim] += opt.scores[dim] || 0
    }
  }
  return scores
}

/**
 * zh: 计算坐标轴偏移量（AC-CE 和 AE-RO）
 * en: Calculate axis offsets (AC-CE and AE-RO)
 * ja: 軸のオフセット（AC-CE と AE-RO）を計算する
 */
function calcAxes(scores) {
  return {
    AC_CE: scores.AC - scores.CE,
    AE_RO: scores.AE - scores.RO
  }
}

/**
 * zh: 根据坐标轴值判断学习类型
 * en: Determine learning type based on axis values
 * ja: 軸の値に基づいて学習タイプを決定する
 *
 * 四象限规则 / Quadrant rules / 四象限のルール:
 *   AC_CE > 0 && AE_RO > 0 → converging  (聚合型)
 *   AC_CE > 0 && AE_RO <= 0 → assimilating (同化型)
 *   AC_CE <= 0 && AE_RO > 0 → accommodating (适应型)
 *   AC_CE <= 0 && AE_RO <= 0 → diverging  (发散型)
 */
function determineType(axes) {
  const { AC_CE, AE_RO } = axes
  if (AC_CE > 0 && AE_RO > 0) return 'converging'
  if (AC_CE > 0 && AE_RO <= 0) return 'assimilating'
  if (AC_CE <= 0 && AE_RO > 0) return 'accommodating'
  return 'diverging'
}

/**
 * zh: 生成专属数值序列，供 LLM 使用
 * en: Generate unique numeric vector for LLM consumption
 * ja: LLM で使用するための固有の数値ベクトルを生成する
 */
function buildVector(scores, axes, type) {
  return [scores.CE, scores.RO, scores.AC, scores.AE, axes.AC_CE, axes.AE_RO, type]
}

/**
 * zh: 主计算入口：传入答案数组，返回完整结果
 * en: Main entry: given answers array, return full result
 * ja: メインエントリ：回答配列を受け取り、完全な結果を返す
 */
function calculate(answers) {
  const scores = calcScores(answers)
  const axes = calcAxes(scores)
  const type = determineType(axes)
  const vector = buildVector(scores, axes, type)
  return { scores, axes, type, vector }
}

module.exports = { calculate }
