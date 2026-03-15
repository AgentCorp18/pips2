import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketAttachments } from '../ticket-attachments'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('../file-upload', () => ({
  FileUpload: ({ ticketId }: { ticketId: string }) => (
    <div data-testid="mock-file-upload">{ticketId}</div>
  ),
}))

vi.mock('../attachments-list', () => ({
  AttachmentsList: ({ attachments }: { attachments: unknown[] }) => (
    <div data-testid="mock-attachments-list">{attachments.length} attachments</div>
  ),
}))

/* ============================================================
   Fixtures
   ============================================================ */

const attachment = {
  id: 'att-1',
  file_name: 'report.pdf',
  file_size: 1024,
  mime_type: 'application/pdf',
  uploaded_by: 'user-1',
  created_at: '2026-01-01',
  uploader: { id: 'user-1', display_name: 'Marc', avatar_url: null },
}

/* ============================================================
   Tests
   ============================================================ */

describe('TicketAttachments', () => {
  it('renders the section with heading', () => {
    render(<TicketAttachments ticketId="ticket-1" attachments={[]} currentUserId="user-1" />)

    expect(screen.getByTestId('ticket-attachments-section')).toBeInTheDocument()
    expect(screen.getByText('Attachments')).toBeInTheDocument()
  })

  it('shows attachment count when there are attachments', () => {
    render(
      <TicketAttachments ticketId="ticket-1" attachments={[attachment]} currentUserId="user-1" />,
    )

    expect(screen.getByText('(1)')).toBeInTheDocument()
  })

  it('renders FileUpload component', () => {
    render(<TicketAttachments ticketId="ticket-1" attachments={[]} currentUserId="user-1" />)

    expect(screen.getByTestId('mock-file-upload')).toBeInTheDocument()
  })

  it('renders AttachmentsList component', () => {
    render(
      <TicketAttachments ticketId="ticket-1" attachments={[attachment]} currentUserId="user-1" />,
    )

    expect(screen.getByTestId('mock-attachments-list')).toBeInTheDocument()
  })
})
