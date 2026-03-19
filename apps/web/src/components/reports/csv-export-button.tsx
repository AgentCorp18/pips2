'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ============================================================
   Types
   ============================================================ */

type CsvColumn = {
  key: string
  label: string
}

type CsvExportButtonProps = {
  data: Record<string, unknown>[]
  filename: string
  columns: CsvColumn[]
  className?: string
}

/* ============================================================
   Helpers
   ============================================================ */

/** Escape a cell value for CSV: wrap in quotes if it contains comma, newline, or quote. */
const escapeCsvCell = (value: unknown): string => {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const buildCsvString = (data: Record<string, unknown>[], columns: CsvColumn[]): string => {
  const header = columns.map((col) => escapeCsvCell(col.label)).join(',')
  const rows = data.map((row) => columns.map((col) => escapeCsvCell(row[col.key])).join(','))
  return [header, ...rows].join('\r\n')
}

/* ============================================================
   Component
   ============================================================ */

export const CsvExportButton = ({ data, filename, columns, className }: CsvExportButtonProps) => {
  const handleExport = () => {
    if (data.length === 0) return

    const csv = buildCsvString(data, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    // Revoke the object URL to free memory
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0}
      className={className}
      aria-label={`Export ${filename} as CSV`}
      data-testid="csv-export-button"
    >
      <Download size={14} aria-hidden="true" />
      Export CSV
    </Button>
  )
}
