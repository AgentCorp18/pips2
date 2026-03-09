import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportOnePagerButton } from '../export-one-pager-button'

const mockGetOnePagerData = vi.fn()
const mockGenerateOnePagerPDF = vi.fn()
const mockDownloadPDF = vi.fn()

vi.mock('@/app/(app)/export/pdf-actions', () => ({
  getOnePagerData: (...args: unknown[]) => mockGetOnePagerData(...args),
}))

vi.mock('@/lib/pdf-one-pager', () => ({
  generateOnePagerPDF: (...args: unknown[]) => mockGenerateOnePagerPDF(...args),
}))

vi.mock('@/lib/pdf', () => ({
  downloadPDF: (...args: unknown[]) => mockDownloadPDF(...args),
}))

describe('ExportOnePagerButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Export One-Pager text', () => {
    render(<ExportOnePagerButton projectId="p-1" projectName="Test Project" />)
    expect(screen.getByText('Export One-Pager')).toBeTruthy()
  })

  it('renders as a button with correct testid', () => {
    render(<ExportOnePagerButton projectId="p-1" projectName="Test Project" />)
    const button = screen.getByTestId('export-one-pager-button')
    expect(button).toBeTruthy()
    expect(button.tagName.toLowerCase()).toBe('button')
  })

  it('is not disabled by default', () => {
    render(<ExportOnePagerButton projectId="p-1" projectName="Test Project" />)
    const button = screen.getByRole('button', { name: /Export One-Pager/ })
    expect(button).not.toBeDisabled()
  })

  it('calls getOnePagerData and generates PDF on click', async () => {
    const mockData = {
      projectName: 'Test Project',
      orgName: 'Test Org',
      description: null,
      ownerName: 'Alice',
      createdAt: '2026-01-01',
      targetDate: null,
      status: 'active',
      steps: [],
      members: [],
    }
    mockGetOnePagerData.mockResolvedValue({ data: mockData })
    mockGenerateOnePagerPDF.mockReturnValue(new Uint8Array([1, 2, 3]))

    render(<ExportOnePagerButton projectId="p-1" projectName="Test Project" />)
    fireEvent.click(screen.getByRole('button', { name: /Export One-Pager/ }))

    await waitFor(() => {
      expect(mockGetOnePagerData).toHaveBeenCalledWith('p-1')
    })

    await waitFor(() => {
      expect(mockGenerateOnePagerPDF).toHaveBeenCalledWith(mockData)
      expect(mockDownloadPDF).toHaveBeenCalledWith(
        'test-project-one-pager.pdf',
        expect.any(Uint8Array),
      )
    })
  })

  it('handles error gracefully without crashing', async () => {
    mockGetOnePagerData.mockResolvedValue({ error: 'Not authenticated' })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ExportOnePagerButton projectId="p-1" projectName="Test Project" />)
    fireEvent.click(screen.getByRole('button', { name: /Export One-Pager/ }))

    await waitFor(() => {
      expect(mockGetOnePagerData).toHaveBeenCalledWith('p-1')
    })

    expect(mockGenerateOnePagerPDF).not.toHaveBeenCalled()
    expect(mockDownloadPDF).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
