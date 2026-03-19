'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PrintButton = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="gap-2"
      aria-label="Print or save as PDF"
    >
      <Printer size={15} />
      Print / Save as PDF
    </Button>
  )
}
