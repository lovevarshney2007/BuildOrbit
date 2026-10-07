/**
 * Shared report export helpers.
 *
 * Produces CSV and Excel-compatible CSV downloads from arbitrary row data.
 * Excel opens plain UTF-8 CSV with the BOM, so a single CSV writer covers both
 * "Export CSV" and "Export Excel" buttons without any extra dependency.
 */

const BOM = "﻿"

/** Quote a CSV cell so embedded commas/quotes/newlines survive. */
function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return ""
  let s: string
  if (v instanceof Date) s = v.toISOString().split("T")[0]
  else if (typeof v === "object") s = JSON.stringify(v)
  else s = String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.map(escapeCell).join(",")]
  for (const row of rows) lines.push(headers.map((h) => escapeCell(row[h])).join(","))
  return lines.join("\r\n")
}

/** Returns a Blob URL that triggers a download when clicked. */
export function downloadCsvBlob(rows: Record<string, unknown>[], filename: string): string {
  const csv = buildCsv(rows)
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
  return URL.createObjectURL(blob)
}

export function triggerDownload(blobUrl: string, filename: string) {
  if (typeof window === "undefined") return
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}