import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentFileUpload } from '../comment-file-upload'

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  vi.clearAllMocks()
})

/* ============================================================
   Tests
   ============================================================ */

describe('CommentFileUpload', () => {
  it('renders attach button', () => {
    render(<CommentFileUpload stagedFiles={[]} onFilesChange={vi.fn()} />)
    expect(screen.getByTestId('comment-attach-button')).toBeInTheDocument()
    expect(screen.getByText('Attach')).toBeInTheDocument()
  })

  it('shows staged files with remove buttons', () => {
    const file1 = new File(['a'], 'doc.pdf', { type: 'application/pdf' })
    const file2 = new File(['b'], 'photo.png', { type: 'image/png' })

    render(<CommentFileUpload stagedFiles={[file1, file2]} onFilesChange={vi.fn()} />)

    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
    expect(screen.getByText('photo.png')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove doc.pdf')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove photo.png')).toBeInTheDocument()
  })

  it('removes a staged file when remove button is clicked', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()
    const file1 = new File(['a'], 'doc.pdf', { type: 'application/pdf' })
    const file2 = new File(['b'], 'photo.png', { type: 'image/png' })

    render(<CommentFileUpload stagedFiles={[file1, file2]} onFilesChange={onFilesChange} />)

    await user.click(screen.getByLabelText('Remove doc.pdf'))
    expect(onFilesChange).toHaveBeenCalledWith([file2])
  })

  it('rejects files with blocked extensions', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()

    render(<CommentFileUpload stagedFiles={[]} onFilesChange={onFilesChange} />)

    const input = screen.getByTestId('comment-file-input') as HTMLInputElement
    const exeFile = new File(['MZ'], 'malware.exe', { type: 'application/octet-stream' })

    await user.upload(input, exeFile)

    expect(onFilesChange).not.toHaveBeenCalled()
    expect(
      screen.getByText('This file type is not allowed for security reasons'),
    ).toBeInTheDocument()
  })

  it('rejects files over 50 MB', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()

    render(<CommentFileUpload stagedFiles={[]} onFilesChange={onFilesChange} />)

    const input = screen.getByTestId('comment-file-input') as HTMLInputElement
    const bigFile = new File(['x'], 'big.zip', { type: 'application/zip' })
    Object.defineProperty(bigFile, 'size', { value: 60 * 1024 * 1024 })

    await user.upload(input, bigFile)

    expect(onFilesChange).not.toHaveBeenCalled()
    expect(screen.getByText('File must be 50 MB or smaller')).toBeInTheDocument()
  })

  it('disables attach button when disabled prop is true', () => {
    render(<CommentFileUpload stagedFiles={[]} onFilesChange={vi.fn()} disabled />)
    expect(screen.getByTestId('comment-attach-button')).toBeDisabled()
  })

  it('accepts valid files and calls onFilesChange', async () => {
    const user = userEvent.setup()
    const onFilesChange = vi.fn()

    render(<CommentFileUpload stagedFiles={[]} onFilesChange={onFilesChange} />)

    const input = screen.getByTestId('comment-file-input') as HTMLInputElement
    const validFile = new File(['hello'], 'doc.txt', { type: 'text/plain' })

    await user.upload(input, validFile)

    expect(onFilesChange).toHaveBeenCalledWith([validFile])
  })
})
