'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProjectPDFData } from '@/app/(app)/export/pdf-actions'
import { generateProjectPDF, downloadPDF } from '@/lib/pdf'

type ExportPDFButtonProps = {
  projectId: string
  projectName: string
}

export const ExportPDFButton = ({ projectId, projectName }: ExportPDFButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await getProjectPDFData(projectId)

      if (result.error || !result.data) {
        console.error('PDF export failed:', result.error)
        return
      }

      const pdfData = generateProjectPDF(result.data)
      const date = new Date().toISOString().slice(0, 10)
      const safeName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      downloadPDF(`${safeName}-summary-${date}.pdf`, new Uint8Array(pdfData))
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="gap-2">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
      Export PDF
    </Button>
  )
}
