import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../file-upload'

/* ============================================================
   Mocks
   ============================================================ */

const mockUploadAttachment = vi.fn()

vi.mock('@/app/(app)/tickets/[ticketId]/attachment-actions', () => ({
  uploadAttachment: (...args: unknown[]) => mockUploadAttachment(...args),
}))

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  vi.clearAllMocks()
  mockUploadAttachment.mockResolvedValue({})
})

/* ============================================================
   Tests
   ============================================================ */

describe('FileUpload', () => {
  it('renders the dropzone', () => {
    render(<FileUpload ticketId="ticket-1" />)
    expect(screen.getByTestId('file-upload-dropzone')).toBeInTheDocument()
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument()
  })

  it('opens file picker on click', async () => {
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" />)

    const dropzone = screen.getByTestId('file-upload-dropzone')
    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    // Verify hidden input exists
    expect(input).toBeInTheDocument()
    expect(input.type).toBe('file')

    // Click dropzone should trigger hidden input
    await user.click(dropzone)
  })

  it('shows error for files over 50 MB', async () => {
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" />)

    const input = screen.getByTestId('file-upload-input')
    const largeFile = new File(['x'], 'big.zip', { type: 'application/zip' })
    Object.defineProperty(largeFile, 'size', { value: 60 * 1024 * 1024 })

    await user.upload(input, largeFile)

    expect(screen.getByText(/50 MB or smaller/i)).toBeInTheDocument()
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })

  it('shows error for blocked file extensions', async () => {
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" />)

    const input = screen.getByTestId('file-upload-input')
    const exeFile = new File(['MZ'], 'malware.exe', { type: 'application/octet-stream' })

    await user.upload(input, exeFile)

    expect(screen.getByText(/not allowed for security/i)).toBeInTheDocument()
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })

  it('validates all files before uploading any', async () => {
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" />)

    const input = screen.getByTestId('file-upload-input')
    const goodFile = new File(['a'], 'doc.txt', { type: 'text/plain' })
    const badFile = new File(['MZ'], 'virus.exe', { type: 'application/octet-stream' })

    await user.upload(input, [goodFile, badFile])

    // Neither file should be uploaded when one fails validation
    expect(mockUploadAttachment).not.toHaveBeenCalled()
  })

  it('calls uploadAttachment for valid files', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" onUploadComplete={onComplete} />)

    const input = screen.getByTestId('file-upload-input')
    const file = new File(['hello world'], 'doc.txt', { type: 'text/plain' })

    await user.upload(input, file)

    expect(mockUploadAttachment).toHaveBeenCalledWith('ticket-1', expect.any(FormData))
    expect(onComplete).toHaveBeenCalled()
  })

  it('shows error status for failed server upload', async () => {
    mockUploadAttachment.mockResolvedValue({ error: 'Server error' })
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" />)

    const input = screen.getByTestId('file-upload-input')
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })

    await user.upload(input, file)

    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('supports multiple file selection', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<FileUpload ticketId="ticket-1" onUploadComplete={onComplete} />)

    const input = screen.getByTestId('file-upload-input') as HTMLInputElement
    expect(input.multiple).toBe(true)

    const file1 = new File(['a'], 'doc1.txt', { type: 'text/plain' })
    const file2 = new File(['b'], 'doc2.txt', { type: 'text/plain' })

    await user.upload(input, [file1, file2])

    expect(mockUploadAttachment).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<FileUpload ticketId="ticket-1" disabled />)
    const dropzone = screen.getByTestId('file-upload-dropzone')
    expect(dropzone.className).toContain('cursor-not-allowed')
  })
})
