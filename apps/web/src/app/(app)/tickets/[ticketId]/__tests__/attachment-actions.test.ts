import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = fromResults[idx] ?? { data: null, error: null }
    return Promise.resolve(result)
  }

  const chain: Record<string, unknown> = {}
  const proxy = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') {
        const p = terminal()
        return p.then.bind(p)
      }
      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

const mockGetUser = vi.fn()
const mockUpload = vi.fn()
const mockRemove = vi.fn()
const mockCreateSignedUrl = vi.fn()

const mockSupabaseClient = {
  auth: {
    getUser: () => mockGetUser(),
  },
  from: () => {
    const idx = fromCallIndex++
    return createChainForIndex(idx)
  },
  storage: {
    from: () => ({
      upload: (...args: unknown[]) => mockUpload(...args),
      remove: (...args: unknown[]) => mockRemove(...args),
      createSignedUrl: (...args: unknown[]) => mockCreateSignedUrl(...args),
    }),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabaseClient),
}))

vi.mock('@/lib/auth-context', () => ({
  getAuthContext: vi.fn(async () => {
    const result = await mockGetUser()
    const user = result?.data?.user ?? null
    return {
      supabase: mockSupabaseClient,
      user,
      orgId: 'org-1',
    }
  }),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

/* ============================================================
   Imports
   ============================================================ */

import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  getAttachmentUrl,
  getCommentAttachments,
  getTicketCommentAttachments,
  uploadCommentAttachment,
} from '../attachment-actions'

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  vi.clearAllMocks()
  fromCallIndex = 0
  fromResults = []
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
})

/* ============================================================
   getAttachments
   ============================================================ */

describe('getAttachments', () => {
  it('returns attachments for a ticket', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'att-1',
            file_name: 'doc.pdf',
            file_size: 1024,
            mime_type: 'application/pdf',
            uploaded_by: 'user-1',
            created_at: '2026-01-01',
            uploader: { id: 'user-1', display_name: 'Marc', avatar_url: null },
          },
        ],
        error: null,
      },
    ]

    const result = await getAttachments('ticket-1')
    expect(result).toHaveLength(1)
    expect(result[0].file_name).toBe('doc.pdf')
  })

  it('returns empty array on error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getAttachments('ticket-1')
    expect(result).toEqual([])
  })
})

/* ============================================================
   uploadAttachment
   ============================================================ */

describe('uploadAttachment', () => {
  it('returns error when no file is provided', async () => {
    const formData = new FormData()
    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBe('No file provided')
  })

  it('returns error when file is too large', async () => {
    const formData = new FormData()
    const largeFile = new File(['x'.repeat(100)], 'big.zip', { type: 'application/zip' })
    Object.defineProperty(largeFile, 'size', { value: 60 * 1024 * 1024 })
    formData.append('file', largeFile)

    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBe('File must be 50 MB or smaller')
  })

  it('blocks dangerous file extensions', async () => {
    const formData = new FormData()
    const exeFile = new File(['MZ'], 'malware.exe', { type: 'application/octet-stream' })
    formData.append('file', exeFile)

    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBe('This file type is not allowed for security reasons')
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBe('You must be signed in to upload files')
  })

  it('returns error when ticket is not found', async () => {
    fromResults = [
      // tickets lookup
      { data: null, error: null },
    ]

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBe('Ticket not found')
  })

  it('uploads file and creates attachment record', async () => {
    fromResults = [
      // tickets lookup
      { data: { org_id: 'org-1' }, error: null },
      // file_attachments insert
      {
        data: {
          id: 'att-new',
          org_id: 'org-1',
          ticket_id: 'ticket-1',
          file_name: 'doc.txt',
          file_size: 5,
          mime_type: 'text/plain',
          storage_path: 'org-1/ticket-1/123-doc.txt',
          storage_bucket: 'attachments',
          uploaded_by: 'user-1',
          created_at: '2026-01-01',
        },
        error: null,
      },
    ]
    mockUpload.mockResolvedValue({ error: null })

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBeUndefined()
    expect(result.attachment?.id).toBe('att-new')
    expect(mockUpload).toHaveBeenCalled()
  })

  it('cleans up storage when DB insert fails', async () => {
    fromResults = [
      // tickets lookup
      { data: { org_id: 'org-1' }, error: null },
      // file_attachments insert fails
      { data: null, error: { message: 'Insert failed' } },
    ]
    mockUpload.mockResolvedValue({ error: null })
    mockRemove.mockResolvedValue({ error: null })

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadAttachment('ticket-1', formData)
    expect(result.error).toBe('Failed to save attachment. Please try again.')
    expect(mockRemove).toHaveBeenCalled()
  })
})

/* ============================================================
   deleteAttachment
   ============================================================ */

describe('deleteAttachment', () => {
  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await deleteAttachment('att-1')
    expect(result.error).toBe('You must be signed in')
  })

  it('returns error when attachment is not found', async () => {
    fromResults = [{ data: null, error: null }]
    const result = await deleteAttachment('att-1')
    expect(result.error).toBe('Attachment not found')
  })

  it('allows uploader to delete their own attachment', async () => {
    fromResults = [
      // file_attachments select
      {
        data: {
          id: 'att-1',
          org_id: 'org-1',
          ticket_id: 'ticket-1',
          uploaded_by: 'user-1',
          storage_path: 'org-1/ticket-1/doc.txt',
          storage_bucket: 'attachments',
        },
        error: null,
      },
      // file_attachments delete
      { data: null, error: null },
    ]
    mockRemove.mockResolvedValue({ error: null })

    const result = await deleteAttachment('att-1')
    expect(result.error).toBeUndefined()
    expect(mockRemove).toHaveBeenCalledWith(['org-1/ticket-1/doc.txt'])
  })

  it('blocks non-uploader non-admin from deleting', async () => {
    const { requirePermission } = await import('@/lib/permissions')
    vi.mocked(requirePermission).mockRejectedValueOnce(new Error('Forbidden'))

    fromResults = [
      // file_attachments select
      {
        data: {
          id: 'att-1',
          org_id: 'org-1',
          ticket_id: 'ticket-1',
          uploaded_by: 'user-other',
          storage_path: 'org-1/ticket-1/doc.txt',
          storage_bucket: 'attachments',
        },
        error: null,
      },
    ]

    const result = await deleteAttachment('att-1')
    expect(result.error).toBe('You can only delete your own attachments')
  })
})

/* ============================================================
   getAttachmentUrl
   ============================================================ */

/* ============================================================
   getCommentAttachments
   ============================================================ */

describe('getCommentAttachments', () => {
  it('returns attachments for a comment', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'att-c1',
            file_name: 'screenshot.png',
            file_size: 2048,
            mime_type: 'image/png',
            uploaded_by: 'user-1',
            comment_id: 'comment-1',
            created_at: '2026-01-01',
            uploader: { id: 'user-1', display_name: 'Marc', avatar_url: null },
          },
        ],
        error: null,
      },
    ]

    const result = await getCommentAttachments('comment-1')
    expect(result).toHaveLength(1)
    expect(result[0].file_name).toBe('screenshot.png')
  })

  it('returns empty array on error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]
    const result = await getCommentAttachments('comment-1')
    expect(result).toEqual([])
  })
})

/* ============================================================
   getTicketCommentAttachments
   ============================================================ */

describe('getTicketCommentAttachments', () => {
  it('returns all comment attachments for a ticket', async () => {
    fromResults = [
      {
        data: [
          { id: 'att-c1', comment_id: 'c1', file_name: 'a.png' },
          { id: 'att-c2', comment_id: 'c2', file_name: 'b.pdf' },
        ],
        error: null,
      },
    ]

    const result = await getTicketCommentAttachments('ticket-1')
    expect(result).toHaveLength(2)
  })

  it('returns empty array on error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]
    const result = await getTicketCommentAttachments('ticket-1')
    expect(result).toEqual([])
  })
})

/* ============================================================
   uploadCommentAttachment
   ============================================================ */

describe('uploadCommentAttachment', () => {
  it('returns error when no file is provided', async () => {
    const formData = new FormData()
    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBe('No file provided')
  })

  it('returns error when file is too large', async () => {
    const formData = new FormData()
    const file = new File(['x'], 'big.zip', { type: 'application/zip' })
    Object.defineProperty(file, 'size', { value: 60 * 1024 * 1024 })
    formData.append('file', file)

    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBe('File must be 50 MB or smaller')
  })

  it('blocks dangerous file extensions', async () => {
    const formData = new FormData()
    const file = new File(['MZ'], 'malware.exe', { type: 'application/octet-stream' })
    formData.append('file', file)

    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBe('This file type is not allowed for security reasons')
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBe('You must be signed in to upload files')
  })

  it('returns error when comment is not found', async () => {
    fromResults = [{ data: null, error: null }]

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBe('Comment not found')
  })

  it('uploads file and creates comment attachment record', async () => {
    fromResults = [
      // comments lookup
      { data: { org_id: 'org-1', ticket_id: 'ticket-1' }, error: null },
      // file_attachments insert
      {
        data: {
          id: 'att-c-new',
          org_id: 'org-1',
          ticket_id: 'ticket-1',
          comment_id: 'comment-1',
          file_name: 'doc.txt',
          file_size: 5,
          mime_type: 'text/plain',
          storage_path: 'org-1/ticket-1/comments/comment-1/123-doc.txt',
          storage_bucket: 'attachments',
          uploaded_by: 'user-1',
          created_at: '2026-01-01',
        },
        error: null,
      },
    ]
    mockUpload.mockResolvedValue({ error: null })

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBeUndefined()
    expect(result.attachment?.id).toBe('att-c-new')
    expect(result.attachment?.comment_id).toBe('comment-1')
    expect(mockUpload).toHaveBeenCalled()
  })

  it('cleans up storage when DB insert fails', async () => {
    fromResults = [
      // comments lookup
      { data: { org_id: 'org-1', ticket_id: 'ticket-1' }, error: null },
      // file_attachments insert fails
      { data: null, error: { message: 'Insert failed' } },
    ]
    mockUpload.mockResolvedValue({ error: null })
    mockRemove.mockResolvedValue({ error: null })

    const formData = new FormData()
    const file = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    formData.append('file', file)

    const result = await uploadCommentAttachment('comment-1', 'ticket-1', formData)
    expect(result.error).toBe('Failed to save attachment. Please try again.')
    expect(mockRemove).toHaveBeenCalled()
  })
})

/* ============================================================
   getAttachmentUrl
   ============================================================ */

describe('getAttachmentUrl', () => {
  it('returns error when attachment is not found', async () => {
    fromResults = [{ data: null, error: null }]
    const result = await getAttachmentUrl('att-1')
    expect(result.error).toBe('Attachment not found')
  })

  it('returns a signed URL for the attachment', async () => {
    fromResults = [
      {
        data: {
          storage_path: 'org-1/ticket-1/doc.txt',
          storage_bucket: 'attachments',
          file_name: 'doc.txt',
        },
        error: null,
      },
    ]
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://example.com/signed-url' },
      error: null,
    })

    const result = await getAttachmentUrl('att-1')
    expect(result.url).toBe('https://example.com/signed-url')
    expect(result.error).toBeUndefined()
  })

  it('returns error when signed URL creation fails', async () => {
    fromResults = [
      {
        data: {
          storage_path: 'org-1/ticket-1/doc.txt',
          storage_bucket: 'attachments',
          file_name: 'doc.txt',
        },
        error: null,
      },
    ]
    mockCreateSignedUrl.mockResolvedValue({
      data: null,
      error: { message: 'Storage error' },
    })

    const result = await getAttachmentUrl('att-1')
    expect(result.error).toBe('Failed to generate download link')
  })
})
