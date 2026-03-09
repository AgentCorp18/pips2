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
  exportTicketsCSV: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { ExportTicketsButton } from '../export-tickets-button'

/* ============================================================
   ExportTicketsButton
   ============================================================ */

describe('ExportTicketsButton', () => {
  it('renders the export button', () => {
    render(<ExportTicketsButton />)
    expect(screen.getByTestId('export-csv-button')).toBeInTheDocument()
  })

  it('renders button text', () => {
    render(<ExportTicketsButton />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('passes "tickets" as filenamePrefix', () => {
    render(<ExportTicketsButton />)
    const btn = screen.getByTestId('export-csv-button')
    expect(btn.getAttribute('data-prefix')).toBe('tickets')
  })

  it('passes exportTicketsCSV as exportAction', async () => {
    const { exportTicketsCSV } = await import('@/app/(app)/export/actions')
    render(<ExportTicketsButton />)
    const btn = screen.getByTestId('export-csv-button')
    btn.click()
    expect(exportTicketsCSV).toHaveBeenCalled()
  })
})
