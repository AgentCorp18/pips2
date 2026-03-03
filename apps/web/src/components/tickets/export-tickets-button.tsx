'use client'

import { ExportCSVButton } from '@/components/export-csv-button'
import { exportTicketsCSV } from '@/app/(app)/export/actions'

export const ExportTicketsButton = () => {
  return <ExportCSVButton exportAction={exportTicketsCSV} filenamePrefix="tickets" />
}
