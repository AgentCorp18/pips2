/**
 * CSV generation and download utilities.
 *
 * Framework-agnostic — no React or Next.js imports.
 */

/**
 * Escape a single CSV cell value according to RFC 4180.
 *
 * Values containing commas, double-quotes, or newlines are wrapped in
 * double-quotes, and any internal double-quotes are doubled.
 */
const escapeCell = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Build a full CSV string from headers and row data.
 *
 * @param headers - Column header labels
 * @param rows    - 2-D array of cell values (one inner array per row)
 * @returns       - RFC 4180-compliant CSV string with BOM for Excel compat
 */
export const generateCSV = (headers: string[], rows: string[][]): string => {
  const headerLine = headers.map(escapeCell).join(',')
  const dataLines = rows.map((row) => row.map(escapeCell).join(','))
  // Prefix with UTF-8 BOM so Excel opens the file with correct encoding
  return '\uFEFF' + [headerLine, ...dataLines].join('\r\n')
}

/**
 * Trigger a client-side file download of CSV content.
 *
 * Creates a temporary Blob + anchor element and programmatically clicks it.
 *
 * @param filename - Suggested file name (e.g. `projects-2026-03-03.csv`)
 * @param content  - The CSV string to download
 */
export const downloadCSV = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
