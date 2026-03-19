import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CsvExportButton } from '../csv-export-button'

/* ============================================================
   Tests
   ============================================================ */

describe('CsvExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the export button', () => {
    render(
      <CsvExportButton
        data={[{ name: 'Project Alpha', savings: 10000 }]}
        filename="test-export"
        columns={[
          { key: 'name', label: 'Project Name' },
          { key: 'savings', label: 'Savings ($)' },
        ]}
      />,
    )
    expect(screen.getByTestId('csv-export-button')).toBeTruthy()
    expect(screen.getByText('Export CSV')).toBeTruthy()
  })

  it('has correct aria-label', () => {
    render(
      <CsvExportButton
        data={[{ name: 'Alpha' }]}
        filename="test-export"
        columns={[{ key: 'name', label: 'Name' }]}
      />,
    )
    const button = screen.getByTestId('csv-export-button')
    expect(button.getAttribute('aria-label')).toBe('Export test-export as CSV')
  })

  it('is disabled when data is empty', () => {
    render(
      <CsvExportButton data={[]} filename="empty" columns={[{ key: 'name', label: 'Name' }]} />,
    )
    const button = screen.getByTestId('csv-export-button')
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('is enabled when data has rows', () => {
    render(
      <CsvExportButton
        data={[{ name: 'Alpha' }]}
        filename="test-export"
        columns={[{ key: 'name', label: 'Name' }]}
      />,
    )
    const button = screen.getByTestId('csv-export-button')
    expect(button.hasAttribute('disabled')).toBe(false)
  })

  it('renders a Download icon (svg)', () => {
    const { container } = render(
      <CsvExportButton
        data={[{ name: 'Alpha' }]}
        filename="test-export"
        columns={[{ key: 'name', label: 'Name' }]}
      />,
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('applies optional className prop', () => {
    render(
      <CsvExportButton
        data={[{ name: 'Alpha' }]}
        filename="test"
        columns={[{ key: 'name', label: 'Name' }]}
        className="custom-class"
      />,
    )
    const button = screen.getByTestId('csv-export-button')
    expect(button.className).toContain('custom-class')
  })

  it('does not throw when clicked with data', () => {
    // Mock URL APIs that jsdom does not implement
    const createObjectURL = vi.fn().mockReturnValue('blob:mock')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(window, 'URL', {
      writable: true,
      value: { createObjectURL, revokeObjectURL },
    })

    render(
      <CsvExportButton
        data={[{ name: 'Alpha', depth: '80%' }]}
        filename="test"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'depth', label: 'Depth' },
        ]}
      />,
    )
    // Should not throw
    expect(() => {
      fireEvent.click(screen.getByTestId('csv-export-button'))
    }).not.toThrow()

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledTimes(1)
  })

  it('calls URL.createObjectURL when export is triggered', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(window, 'URL', {
      writable: true,
      value: { createObjectURL, revokeObjectURL },
    })

    render(
      <CsvExportButton
        data={[{ name: 'Test Project', value: 1000 }]}
        filename="export"
        columns={[
          { key: 'name', label: 'Project' },
          { key: 'value', label: 'Value' },
        ]}
      />,
    )

    fireEvent.click(screen.getByTestId('csv-export-button'))

    // createObjectURL called with a Blob
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0]?.[0]
    expect(blob).toBeInstanceOf(Blob)
  })

  it('does not call createObjectURL when data is empty', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    Object.defineProperty(window, 'URL', {
      writable: true,
      value: { createObjectURL, revokeObjectURL: vi.fn() },
    })

    render(
      <CsvExportButton data={[]} filename="empty" columns={[{ key: 'name', label: 'Name' }]} />,
    )

    // Button is disabled so click should not fire the handler
    fireEvent.click(screen.getByTestId('csv-export-button'))
    expect(createObjectURL).not.toHaveBeenCalled()
  })
})
