'use client'

import { ExportCSVButton } from '@/components/export-csv-button'
import { exportProjectsCSV } from '@/app/(app)/export/actions'

export const ExportProjectsButton = () => {
  return <ExportCSVButton exportAction={exportProjectsCSV} filenamePrefix="projects" />
}
