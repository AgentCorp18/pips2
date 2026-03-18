import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ImagePreviewDialog } from '../image-preview-dialog'

/* ============================================================
   Mocks
   ============================================================ */

const mockGetAttachmentUrl = vi.fn()

vi.mock('@/app/(app)/tickets/[ticketId]/attachment-actions', () => ({
  getAttachmentUrl: (...args: unknown[]) => mockGetAttachmentUrl(...args),
}))

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  vi.clearAllMocks()
  mockGetAttachmentUrl.mockResolvedValue({ url: 'https://example.com/signed-image.png' })
})

/* ============================================================
   Tests
   ============================================================ */

describe('ImagePreviewDialog', () => {
  it('fetches signed URL and renders image when opened', async () => {
    render(
      <ImagePreviewDialog
        attachmentId="att-1"
        fileName="screenshot.png"
        open={true}
        onOpenChange={vi.fn()}
      />,
    )

    expect(mockGetAttachmentUrl).toHaveBeenCalledWith('att-1')

    await waitFor(() => {
      expect(screen.getByTestId('image-preview-img')).toBeInTheDocument()
    })

    const img = screen.getByTestId('image-preview-img') as HTMLImageElement
    expect(img.src).toBe('https://example.com/signed-image.png')
    expect(img.alt).toBe('screenshot.png')
  })

  it('shows loading state while fetching URL', () => {
    mockGetAttachmentUrl.mockReturnValue(new Promise(() => {})) // never resolves

    render(
      <ImagePreviewDialog
        attachmentId="att-1"
        fileName="photo.jpg"
        open={true}
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('image-preview-loading')).toBeInTheDocument()
  })

  it('shows error when URL fetch fails', async () => {
    mockGetAttachmentUrl.mockResolvedValue({ error: 'Not found' })

    render(
      <ImagePreviewDialog
        attachmentId="att-1"
        fileName="photo.jpg"
        open={true}
        onOpenChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument()
    })
  })

  it('displays the file name in the dialog title', async () => {
    render(
      <ImagePreviewDialog
        attachmentId="att-1"
        fileName="my-image.png"
        open={true}
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByText('my-image.png')).toBeInTheDocument()
  })

  it('shows download button when image is loaded', async () => {
    render(
      <ImagePreviewDialog
        attachmentId="att-1"
        fileName="photo.jpg"
        open={true}
        onOpenChange={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Download photo.jpg')).toBeInTheDocument()
    })
  })

  it('does not render content when closed', () => {
    render(
      <ImagePreviewDialog
        attachmentId="att-1"
        fileName="photo.jpg"
        open={false}
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('image-preview-dialog')).not.toBeInTheDocument()
    expect(mockGetAttachmentUrl).not.toHaveBeenCalled()
  })
})
