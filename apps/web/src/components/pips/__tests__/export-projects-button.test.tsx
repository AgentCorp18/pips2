import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

vi.mock('@/components/export-csv-button', () => ({
  ExportCSVButton: ({
    exportAction,
    filenamePrefix,
  }: {
    exportAction: () => void
    filenamePrefix: string
  }) => (
    <button
      data-testid="export-csv-button"
      data-prefix={filenamePrefix}
      onClick={() => exportAction()}
    >
      Export CSV
    </button>
  ),
}))

vi.mock('@/app/(app)/export/actions', () => ({
  exportProjectsCSV: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { ExportProjectsButton } from '../export-projects-button'

/* ============================================================
   ExportProjectsButton
   ============================================================ */

describe('ExportProjectsButton', () => {
  it('renders the export button', () => {
    render(<ExportProjectsButton />)
    expect(screen.getByTestId('export-csv-button')).toBeInTheDocument()
  })

  it('renders button text', () => {
    render(<ExportProjectsButton />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('passes "projects" as filenamePrefix', () => {
    render(<ExportProjectsButton />)
    const btn = screen.getByTestId('export-csv-button')
    expect(btn.getAttribute('data-prefix')).toBe('projects')
  })

  it('passes exportProjectsCSV as exportAction', async () => {
    const { exportProjectsCSV } = await import('@/app/(app)/export/actions')
    render(<ExportProjectsButton />)
    const btn = screen.getByTestId('export-csv-button')
    btn.click()
    expect(exportProjectsCSV).toHaveBeenCalled()
  })
})
