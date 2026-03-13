import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportDataButton } from '../export-data-button'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../export-data-action', () => ({
  exportUserData: vi.fn().mockResolvedValue({
    data: JSON.stringify({ exportedAt: '2026-01-01T00:00:00Z' }),
    filename: 'pips-data-export-2026-01-01.json',
  }),
}))

describe('ExportDataButton', () => {
  it('renders the download button', () => {
    render(<ExportDataButton />)
    expect(screen.getByTestId('export-data-button')).toBeTruthy()
  })

  it('renders with correct label text', () => {
    render(<ExportDataButton />)
    expect(screen.getByText('Download My Data')).toBeTruthy()
  })

  it('button has correct data-testid', () => {
    render(<ExportDataButton />)
    const button = screen.getByTestId('export-data-button')
    expect(button).toBeTruthy()
  })

  it('button is not disabled initially', () => {
    render(<ExportDataButton />)
    const button = screen.getByTestId('export-data-button') as HTMLButtonElement
    expect(button.disabled).toBe(false)
  })

  it('shows loading state when clicked', async () => {
    const { exportUserData } = await import('../export-data-action')
    vi.mocked(exportUserData).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: '{}', filename: 'test.json' }), 100),
        ),
    )

    render(<ExportDataButton />)
    const button = screen.getByTestId('export-data-button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeTruthy()
    })
  })

  it('button is disabled during loading', async () => {
    const { exportUserData } = await import('../export-data-action')
    vi.mocked(exportUserData).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: '{}', filename: 'test.json' }), 100),
        ),
    )

    render(<ExportDataButton />)
    const button = screen.getByTestId('export-data-button') as HTMLButtonElement
    fireEvent.click(button)

    await waitFor(() => {
      expect(button.disabled).toBe(true)
    })
  })
})
