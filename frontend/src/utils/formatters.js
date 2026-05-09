/** Format an ISO date string into a readable date. */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Convert an array of objects to a CSV string. */
export function toCSV(rows, columns) {
  const header = columns.join(',')
  const body = rows.map(row => columns.map(col => JSON.stringify(row[col] ?? '')).join(',')).join('\n')
  return `${header}\n${body}`
}

/** Trigger a browser download of a text file. */
export function downloadFile(content, filename, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
