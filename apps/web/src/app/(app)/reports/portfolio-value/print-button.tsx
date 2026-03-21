'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const PortfolioPrintButton = () => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="gap-2 print:hidden"
      aria-label="Print or save Portfolio Value Report as PDF"
    >
      <Printer size={15} />
      Print / PDF
    </Button>
  )
}
