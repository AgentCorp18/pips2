'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getOnePagerData } from '@/app/(app)/export/pdf-actions'
import { generateOnePagerPDF } from '@/lib/pdf-one-pager'
import { downloadPDF } from '@/lib/pdf'

type ExportOnePagerButtonProps = {
  projectId: string
  projectName: string
}

export const ExportOnePagerButton = ({ projectId, projectName }: ExportOnePagerButtonProps) => {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await getOnePagerData(projectId)

      if (result.error || !result.data) {
        toast.error(result.error ?? 'Failed to generate one-pager PDF')
        return
      }

      const pdfData = generateOnePagerPDF(result.data)
      const safeName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      downloadPDF(`${safeName}-one-pager.pdf`, new Uint8Array(pdfData))
    } catch {
      toast.error('An unexpected error occurred while generating the PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
      data-testid="export-one-pager-button"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
      Export One-Pager
    </Button>
  )
}
