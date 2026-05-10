/**
 * zh: 数据导出工具 — 支持 JSON / CSV / XLSX 三种格式
 * en: Export utility — supports JSON / CSV / XLSX formats
 * ja: データエクスポートユーティリティ — JSON / CSV / XLSX の3形式に対応
 */
import * as XLSX from 'xlsx'

/**
 * zh: 将被测者数据数组扁平化为表格行格式
 * en: Flatten respondent data array into table row format
 * ja: 回答者データ配列をテーブル行形式にフラット化する
 */
function flatten(respondents) {
  return respondents.map(r => {
    const infoStr = Object.entries(r.info || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ')
    return {
      ID: r.id,
      Info: infoStr,
      Theory: r.theory_id,
      Type: r.type,
      Lang: r.lang,
      CE: r.scores?.CE,
      RO: r.scores?.RO,
      AC: r.scores?.AC,
      AE: r.scores?.AE,
      'AC-CE': r.axes?.AC_CE,
      'AE-RO': r.axes?.AE_RO,
      Vector: JSON.stringify(r.vector),
      Time: r.created_at
    }
  })
}

/**
 * zh: 触发浏览器文件下载
 * en: Trigger browser file download
 * ja: ブラウザのファイルダウンロードをトリガーする
 */
function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * zh: 生成带日期的文件名
 * en: Generate filename with current date
 * ja: 現在の日付付きファイル名を生成する
 */
function dateSuffix() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

// zh: 导出为 JSON 文件
// en: Export as JSON file
// ja: JSON ファイルとしてエクスポートする
export function exportJSON(respondents, filename) {
  const blob = new Blob([JSON.stringify(respondents, null, 2)], { type: 'application/json' })
  download(blob, filename || `respondents_${dateSuffix()}.json`)
}

// zh: 导出为 CSV 文件（通过 SheetJS）
// en: Export as CSV file (via SheetJS)
// ja: CSV ファイルとしてエクスポートする（SheetJS 経由）
export function exportCSV(respondents, filename) {
  const ws = XLSX.utils.json_to_sheet(flatten(respondents))
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  download(blob, filename || `respondents_${dateSuffix()}.csv`)
}

// zh: 导出为 XLSX 文件（通过 SheetJS）
// en: Export as XLSX file (via SheetJS)
// ja: XLSX ファイルとしてエクスポートする（SheetJS 経由）
export function exportXLSX(respondents, filename) {
  const ws = XLSX.utils.json_to_sheet(flatten(respondents))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Respondents')
  XLSX.writeFile(wb, filename || `respondents_${dateSuffix()}.xlsx`)
}

// zh: 统一导出入口，根据格式分发
// en: Unified export entry, dispatch by format
// ja: 統一エクスポートエントリ、フォーマットに応じて振り分ける
export function exportData(respondents, format, filename) {
  if (format === 'json') exportJSON(respondents, filename)
  else if (format === 'csv') exportCSV(respondents, filename)
  else exportXLSX(respondents, filename)
}
