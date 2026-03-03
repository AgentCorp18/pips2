'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadCSV } from '@/lib/csv'

type ExportCSVButtonProps = {
  /** Server action that returns `{ csv?: string; error?: string }` */
  exportAction: () => Promise<{ csv?: string; error?: string }>
  /** File name for the downloaded CSV (without extension) */
  filenamePrefix: string
}

export const ExportCSVButton = ({ exportAction, filenamePrefix }: ExportCSVButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await exportAction()

      if (result.error) {
        console.error('Export failed:', result.error)
        return
      }

      if (result.csv) {
        const date = new Date().toISOString().slice(0, 10)
        downloadCSV(`${filenamePrefix}-${date}.csv`, result.csv)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-2">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      Export CSV
    </Button>
  )
}
