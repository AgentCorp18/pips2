import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AttachmentsList } from '../attachments-list'

/* ============================================================
   Mocks
   ============================================================ */

const mockDeleteAttachment = vi.fn()
const mockGetAttachmentUrl = vi.fn()
const mockWindowOpen = vi.fn()

vi.mock('@/app/(app)/tickets/[ticketId]/attachment-actions', () => ({
  deleteAttachment: (...args: unknown[]) => mockDeleteAttachment(...args),
  getAttachmentUrl: (...args: unknown[]) => mockGetAttachmentUrl(...args),
}))

/* ============================================================
   Fixtures
   ============================================================ */

const makeAttachment = (
  overrides?: Partial<Parameters<typeof AttachmentsList>[0]['attachments'][0]>,
) => ({
  id: 'att-1',
  file_name: 'report.pdf',
  file_size: 1048576,
  mime_type: 'application/pdf',
  uploaded_by: 'user-1',
  created_at: '2026-03-15T10:00:00Z',
  uploader: { id: 'user-1', display_name: 'Marc', avatar_url: null },
  ...overrides,
})

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  vi.clearAllMocks()
  mockDeleteAttachment.mockResolvedValue({})
  mockGetAttachmentUrl.mockResolvedValue({ url: 'https://example.com/signed' })
  // Mock window.open
  Object.defineProperty(window, 'open', { value: mockWindowOpen, writable: true })
})

/* ============================================================
   Tests
   ============================================================ */

describe('AttachmentsList', () => {
  it('renders nothing when there are no attachments', () => {
    const { container } = render(<AttachmentsList attachments={[]} currentUserId="user-1" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders attachment with file name and size', () => {
    render(<AttachmentsList attachments={[makeAttachment()]} currentUserId="user-1" />)

    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument()
  })

  it('shows delete button only for own attachments', () => {
    render(
      <AttachmentsList
        attachments={[
          makeAttachment({ id: 'att-mine', uploaded_by: 'user-1' }),
          makeAttachment({ id: 'att-other', uploaded_by: 'user-2' }),
        ]}
        currentUserId="user-1"
      />,
    )

    expect(screen.getByTestId('delete-attachment-att-mine')).toBeInTheDocument()
    expect(screen.queryByTestId('delete-attachment-att-other')).not.toBeInTheDocument()
  })

  it('shows download button for all attachments', () => {
    render(
      <AttachmentsList attachments={[makeAttachment({ id: 'att-1' })]} currentUserId="user-1" />,
    )

    expect(screen.getByTestId('download-attachment-att-1')).toBeInTheDocument()
  })

  it('opens signed URL on download click', async () => {
    const user = userEvent.setup()
    render(
      <AttachmentsList attachments={[makeAttachment({ id: 'att-1' })]} currentUserId="user-1" />,
    )

    await user.click(screen.getByTestId('download-attachment-att-1'))

    expect(mockGetAttachmentUrl).toHaveBeenCalledWith('att-1')
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://example.com/signed',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('calls deleteAttachment on delete click', async () => {
    const onDeleteComplete = vi.fn()
    const user = userEvent.setup()
    render(
      <AttachmentsList
        attachments={[makeAttachment({ id: 'att-1', uploaded_by: 'user-1' })]}
        currentUserId="user-1"
        onDeleteComplete={onDeleteComplete}
      />,
    )

    await user.click(screen.getByTestId('delete-attachment-att-1'))

    expect(mockDeleteAttachment).toHaveBeenCalledWith('att-1')
  })

  it('formats file sizes correctly', () => {
    render(
      <AttachmentsList
        attachments={[
          makeAttachment({ id: 'att-bytes', file_size: 500 }),
          makeAttachment({ id: 'att-kb', file_size: 5120 }),
          makeAttachment({ id: 'att-mb', file_size: 5242880 }),
        ]}
        currentUserId="user-1"
      />,
    )

    expect(screen.getByText(/500 B/)).toBeInTheDocument()
    expect(screen.getByText(/5\.0 KB/)).toBeInTheDocument()
    expect(screen.getByText(/5\.0 MB/)).toBeInTheDocument()
  })

  it('shows uploader name', () => {
    render(<AttachmentsList attachments={[makeAttachment()]} currentUserId="user-1" />)

    expect(screen.getByText(/Marc/)).toBeInTheDocument()
  })
})
