import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportCSVButton } from '../export-csv-button'

/* ============================================================
   Mocks
   ============================================================ */

const mockDownloadCSV = vi.fn()
vi.mock('@/lib/csv', () => ({
  downloadCSV: (...args: unknown[]) => mockDownloadCSV(...args),
}))

/* ============================================================
   Helpers
   ============================================================ */

const mockExportAction = vi.fn()

const defaultProps = {
  exportAction: mockExportAction,
  filenamePrefix: 'projects',
}

/* ============================================================
   Tests
   ============================================================ */

describe('ExportCSVButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExportAction.mockResolvedValue({ csv: 'id,name\n1,test' })
  })

  /* ---- Basic rendering ---- */

  it('renders the export button', () => {
    render(<ExportCSVButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })

  it('renders the Export CSV text', () => {
    render(<ExportCSVButton {...defaultProps} />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('renders SVG icon (Download)', () => {
    render(<ExportCSVButton {...defaultProps} />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('button is enabled by default', () => {
    render(<ExportCSVButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /export csv/i })).not.toBeDisabled()
  })

  /* ---- Click triggers export ---- */

  it('calls exportAction when clicked', async () => {
    const user = userEvent.setup()
    render(<ExportCSVButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => {
      expect(mockExportAction).toHaveBeenCalled()
    })
  })

  it('calls downloadCSV with correct filename and data', async () => {
    const user = userEvent.setup()
    // Mock the date so the filename is predictable
    vi.setSystemTime(new Date('2026-03-03'))

    render(<ExportCSVButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => {
      expect(mockDownloadCSV).toHaveBeenCalledWith('projects-2026-03-03.csv', 'id,name\n1,test')
    })

    vi.useRealTimers()
  })

  it('uses the filenamePrefix in the downloaded filename', async () => {
    const user = userEvent.setup()
    vi.setSystemTime(new Date('2026-03-03'))

    render(<ExportCSVButton exportAction={mockExportAction} filenamePrefix="tickets" />)
    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => {
      expect(mockDownloadCSV).toHaveBeenCalledWith(
        expect.stringContaining('tickets-'),
        expect.any(String),
      )
    })

    vi.useRealTimers()
  })

  /* ---- Error handling ---- */

  it('does not call downloadCSV when export returns error', async () => {
    const user = userEvent.setup()
    mockExportAction.mockResolvedValue({ error: 'Something went wrong' })

    render(<ExportCSVButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => {
      expect(mockExportAction).toHaveBeenCalled()
    })

    expect(mockDownloadCSV).not.toHaveBeenCalled()
  })

  it('does not call downloadCSV when exportAction throws', async () => {
    const user = userEvent.setup()
    mockExportAction.mockRejectedValue(new Error('Network error'))

    render(<ExportCSVButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => {
      expect(mockExportAction).toHaveBeenCalled()
    })

    expect(mockDownloadCSV).not.toHaveBeenCalled()
  })

  it('re-enables the button after export completes', async () => {
    const user = userEvent.setup()
    render(<ExportCSVButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /export csv/i })
    await user.click(button)

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('re-enables the button after export fails', async () => {
    const user = userEvent.setup()
    mockExportAction.mockRejectedValue(new Error('fail'))

    render(<ExportCSVButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /export csv/i })
    await user.click(button)

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })
})
