import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExportPDFButton } from '../export-pdf-button'

vi.mock('@/app/(app)/export/pdf-actions', () => ({
  getProjectPDFData: vi.fn(),
}))

vi.mock('@/lib/pdf', () => ({
  generateProjectPDF: vi.fn(),
  downloadPDF: vi.fn(),
}))

describe('ExportPDFButton', () => {
  it('renders Export PDF text', () => {
    render(<ExportPDFButton projectId="p-1" projectName="Test Project" />)
    expect(screen.getByText('Export PDF')).toBeTruthy()
  })

  it('renders as a button', () => {
    render(<ExportPDFButton projectId="p-1" projectName="Test Project" />)
    expect(screen.getByRole('button', { name: /Export PDF/ })).toBeTruthy()
  })

  it('is not disabled by default', () => {
    render(<ExportPDFButton projectId="p-1" projectName="Test Project" />)
    const button = screen.getByRole('button', { name: /Export PDF/ })
    expect(button).not.toBeDisabled()
  })
})
