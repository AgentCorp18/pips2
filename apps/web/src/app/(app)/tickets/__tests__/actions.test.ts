import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

// Track results for each from() call in sequence
let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; count?: number | null; error?: unknown }> = []

/**
 * Each .from() call creates a fresh chain that resolves
 * to fromResults[fromCallIndex++] at terminal positions.
 */
const createChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = fromResults[idx] ?? { data: null, error: null }
    return Promise.resolve(result)
  }

  const chain: Record<string, unknown> = {}
  const proxy = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') {
        // Make the chain thenable at any point
        const p = terminal()
        return p.then.bind(p)
      }
      // Every method returns the proxy itself for chaining
      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

const mockGetUser = vi.fn()

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: vi.fn().mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' }),
  ORG_COOKIE_NAME: 'pips-org-id',
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const mockSupabase = {
  auth: { getUser: () => mockGetUser() },
  from: () => {
    const idx = fromCallIndex++
    return createChainForIndex(idx)
  },
}

vi.mock('@/lib/auth-context', () => ({
  getAuthContext: vi.fn(async () => {
    const result = await mockGetUser()
    return {
      supabase: mockSupabase,
      user: result?.data?.user ?? null,
      orgId: 'org-1',
    }
  }),
}))

// Some ticket functions still use createClient directly
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import {
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  getTickets,
  getTicket,
  getTicketsForBoard,
  bulkUpdateTickets,
  bulkDeleteTickets,
  getChildTickets,
  getParentTicket,
  setParentTicket,
  removeParentTicket,
} from '../actions'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth-context'

/* ============================================================
   Helpers
   ============================================================ */

const makeFormData = (fields: Record<string, string>): FormData => {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const validTicketFields = {
  title: 'Fix login bug',
  description: 'Users cannot log in',
  type: 'bug',
  status: 'todo',
  priority: 'high',
  assignee_id: '',
  project_id: '',
  parent_id: '',
  due_date: '',
  tags: '',
}

/* ============================================================
   createTicket
   ============================================================ */

describe('createTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns fieldErrors when title is missing', async () => {
    const fd = makeFormData({ ...validTicketFields, title: '' })
    const result = await createTicket({}, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns fieldErrors when title is too long', async () => {
    const fd = makeFormData({ ...validTicketFields, title: 'x'.repeat(501) })
    const result = await createTicket({}, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const fd = makeFormData(validTicketFields)
    const result = await createTicket({}, fd)
    expect(result).toEqual({ error: 'You must be signed in to create a ticket' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const fd = makeFormData(validTicketFields)
    const result = await createTicket({}, fd)
    expect(result).toEqual({ error: 'You must belong to an organization' })
  })

  it('checks ticket.create permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').insert() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData(validTicketFields)
    const result = await createTicket({}, fd)
    expect(result).toEqual({ success: true, redirectTo: '/tickets' })
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'ticket.create', expect.any(Object))
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const fd = makeFormData(validTicketFields)
    const result = await createTicket({}, fd)
    expect(result).toEqual({ error: 'You do not have permission to create tickets' })
  })

  it('returns error when assignee is not in same org', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> assignee not found
      { data: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData({
      ...validTicketFields,
      assignee_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    })
    const result = await createTicket({}, fd)
    expect(result).toEqual({ error: 'Assignee is not an active member of this organization' })
  })

  it('creates ticket successfully with all fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> assignee found
      { data: { user_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d' } },
      // from('projects') -> cross-org validation: project belongs to org-1
      { data: { org_id: 'org-1' } },
      // from('tickets').insert() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData({
      title: 'Full ticket',
      description: 'A full description',
      type: 'feature',
      status: 'todo',
      priority: 'critical',
      assignee_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      project_id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      parent_id: 'c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f',
      due_date: '2026-12-31',
      tags: 'urgent, frontend, regression',
    })

    const result = await createTicket({}, fd)
    expect(result).toEqual({ success: true, redirectTo: '/tickets' })
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
  })

  it('creates ticket successfully with optional fields empty', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData({
      title: 'Minimal ticket',
      description: '',
      type: 'general',
      status: 'backlog',
      priority: 'medium',
      assignee_id: '',
      project_id: '',
      parent_id: '',
      due_date: '',
      tags: '',
    })

    const result = await createTicket({}, fd)
    expect(result).toEqual({ success: true, redirectTo: '/tickets' })
  })

  it('returns error when insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB constraint violation' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const fd = makeFormData(validTicketFields)
    const result = await createTicket({}, fd)
    expect(result).toEqual({ error: 'Failed to create ticket. Please try again.' })
  })
})

/* ============================================================
   updateTicket
   ============================================================ */

describe('updateTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns fieldErrors for invalid data', async () => {
    const result = await updateTicket('ticket-1', { title: '' })
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await updateTicket('ticket-1', { status: 'done' })
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when ticket is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('tickets').select().eq().single() -> null
    fromResults = [{ data: null }]

    const result = await updateTicket('non-existent', { status: 'done' })
    expect(result).toEqual({ error: 'Ticket not found' })
  })

  it('checks ticket.update permission with ticket org_id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').select().eq().single() -> ticket found
      { data: { org_id: 'org-99', started_at: null, status: 'todo' } },
      // from('tickets').update().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await updateTicket('ticket-1', { status: 'done' })
    expect(requirePermission).toHaveBeenCalledWith('org-99', 'ticket.update')
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', started_at: null, status: 'todo' } }]
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await updateTicket('ticket-1', { status: 'done' })
    expect(result).toEqual({ error: 'You do not have permission to update tickets' })
  })

  it('updates ticket successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', started_at: null, status: 'todo' } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateTicket('ticket-1', { title: 'Updated title', priority: 'high' })
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
    expect(revalidatePath).toHaveBeenCalledWith('/tickets/ticket-1')
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', started_at: null, status: 'todo' } },
      { error: { message: 'DB error' } },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateTicket('ticket-1', { status: 'todo' })
    expect(result).toEqual({ error: 'Failed to update ticket. Please try again.' })
  })

  it('returns error when assignee is not in same org', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').select() -> ticket found
      { data: { org_id: 'org-1', started_at: null, status: 'todo' } },
      // from('org_members') -> assignee not found
      { data: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateTicket('ticket-1', {
      assignee_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    })
    expect(result).toEqual({ error: 'Assignee is not an active member of this organization' })
  })

  it('does not overwrite started_at when already set', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // ticket already has started_at set
      { data: { org_id: 'org-1', started_at: '2026-01-01T00:00:00.000Z', status: 'in_progress' } },
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateTicket('ticket-1', { status: 'in_review' })
    expect(result).toEqual({})
  })

  it('clears resolved_at when transitioning away from done', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', started_at: '2026-01-01T00:00:00.000Z', status: 'done' } },
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateTicket('ticket-1', { status: 'in_progress' })
    expect(result).toEqual({})
  })

  it('does not override explicit priority when setting type to ceo_request', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', started_at: null, status: 'todo' } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    // User explicitly sets priority to 'high' alongside type change
    const result = await updateTicket('ticket-1', { type: 'ceo_request', priority: 'high' })
    expect(result).toEqual({})
  })

  it('auto-escalates to critical when type changed to ceo_request without explicit priority', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', started_at: null, status: 'todo' } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    // Only type change, no explicit priority — should auto-escalate
    const result = await updateTicket('ticket-1', { type: 'ceo_request' })
    expect(result).toEqual({})
  })
})

/* ============================================================
   updateTicketStatus
   ============================================================ */

describe('updateTicketStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('delegates to updateTicket with status', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', started_at: null, status: 'todo' } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await updateTicketStatus('ticket-1', 'in_progress')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateTicketStatus('ticket-1', 'done')
    expect(result).toEqual({ error: 'You must be signed in' })
  })
})

/* ============================================================
   deleteTicket
   ============================================================ */

describe('deleteTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await deleteTicket('ticket-1')
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when ticket is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const result = await deleteTicket('non-existent')
    expect(result).toEqual({ error: 'Ticket not found' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1' } }]
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await deleteTicket('ticket-1')
    expect(result).toEqual({ error: 'You do not have permission to delete tickets' })
  })

  it('deletes ticket successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').select().eq().single() -> ticket found
      { data: { org_id: 'org-1' } },
      // from('tickets').delete().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await deleteTicket('ticket-1')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
  })

  it('returns error when delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1' } }, { error: { message: 'FK constraint' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await deleteTicket('ticket-1')
    expect(result).toEqual({ error: 'Failed to delete ticket. Please try again.' })
  })
})

/* ============================================================
   getTickets
   ============================================================ */

describe('getTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns tickets with default filters', async () => {
    const ticketData = [
      { id: 'tkt-1', title: 'Ticket 1', status: 'todo' },
      { id: 'tkt-2', title: 'Ticket 2', status: 'in_progress' },
    ]
    fromResults = [{ data: ticketData, count: 2, error: null }]

    const result = await getTickets('org-1')
    expect(result).toEqual({ tickets: ticketData, total: 2 })
  })

  it('returns tickets with status filter', async () => {
    const ticketData = [{ id: 'tkt-1', title: 'Ticket 1', status: 'todo' }]
    fromResults = [{ data: ticketData, count: 1, error: null }]

    const result = await getTickets('org-1', { status: ['todo'] })
    expect(result).toEqual({ tickets: ticketData, total: 1 })
  })

  it('returns tickets with priority filter', async () => {
    fromResults = [{ data: [], count: 0, error: null }]

    const result = await getTickets('org-1', { priority: ['critical', 'high'] })
    expect(result).toEqual({ tickets: [], total: 0 })
  })

  it('returns empty result when no tickets match', async () => {
    fromResults = [{ data: [], count: 0, error: null }]

    const result = await getTickets('org-1', { search: 'nonexistent' })
    expect(result).toEqual({ tickets: [], total: 0 })
  })

  it('returns empty result with defaults on error', async () => {
    fromResults = [{ data: null, count: null, error: { message: 'DB error' } }]

    const result = await getTickets('org-1')
    expect(result).toEqual({ tickets: [], total: 0 })
  })

  it('handles pagination parameters', async () => {
    const ticketData = [{ id: 'tkt-3', title: 'Ticket 3' }]
    fromResults = [{ data: ticketData, count: 50, error: null }]

    const result = await getTickets('org-1', { page: 2, per_page: 10 })
    expect(result).toEqual({ tickets: ticketData, total: 50 })
  })

  it('handles null data as empty array', async () => {
    fromResults = [{ data: null, count: null, error: null }]

    const result = await getTickets('org-1')
    expect(result).toEqual({ tickets: [], total: 0 })
  })

  it('sorts by priority ordinal in JS when sort_by is priority', async () => {
    const ticketData = [
      { id: 'tkt-1', priority: 'low' },
      { id: 'tkt-2', priority: 'critical' },
      { id: 'tkt-3', priority: 'medium' },
      { id: 'tkt-4', priority: 'high' },
    ]
    fromResults = [{ data: ticketData, count: 4, error: null }]

    const result = await getTickets('org-1', { sort_by: 'priority', sort_order: 'asc' })
    expect(result.total).toBe(4)
    // Should be sorted critical < high < medium < low
    expect(result.tickets.map((t) => (t as Record<string, unknown>).priority)).toEqual([
      'critical',
      'high',
      'medium',
      'low',
    ])
  })
})

/* ============================================================
   getTicket
   ============================================================ */

describe('getTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns ticket when found', async () => {
    const ticketData = {
      id: 'tkt-1',
      title: 'Login bug',
      status: 'todo',
      assignee: { id: 'u-1', display_name: 'Alice', avatar_url: null },
      reporter: { id: 'u-2', display_name: 'Bob', avatar_url: null },
      project: { id: 'proj-1', name: 'Auth' },
    }
    fromResults = [{ data: ticketData, error: null }]

    const result = await getTicket('tkt-1')
    expect(result).toEqual(ticketData)
  })

  it('returns null when ticket is not found', async () => {
    fromResults = [{ data: null, error: { message: 'not found' } }]

    const result = await getTicket('non-existent')
    expect(result).toBeNull()
  })

  it('returns null on query error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getTicket('tkt-1')
    expect(result).toBeNull()
  })
})

/* ============================================================
   getTicketsForBoard
   ============================================================ */

describe('getTicketsForBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns board tickets without filters', async () => {
    const ticketData = [
      { id: 'tkt-1', title: 'Ticket 1', status: 'todo' },
      { id: 'tkt-2', title: 'Ticket 2', status: 'in_progress' },
    ]
    fromResults = [{ data: ticketData, error: null }]

    const result = await getTicketsForBoard('org-1')
    expect(result).toEqual(ticketData)
  })

  it('returns board tickets with priority filter', async () => {
    const ticketData = [{ id: 'tkt-1', title: 'Critical bug', status: 'todo' }]
    fromResults = [{ data: ticketData, error: null }]

    const result = await getTicketsForBoard('org-1', { priority: ['critical'] })
    expect(result).toEqual(ticketData)
  })

  it('returns board tickets with assignee filter', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getTicketsForBoard('org-1', { assignee_id: 'user-1' })
    expect(result).toEqual([])
  })

  it('returns board tickets with unassigned filter', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getTicketsForBoard('org-1', { unassigned: true })
    expect(result).toEqual([])
  })

  it('returns board tickets with type filter', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getTicketsForBoard('org-1', { type: ['bug', 'feature'] })
    expect(result).toEqual([])
  })

  it('returns empty array on error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getTicketsForBoard('org-1')
    expect(result).toEqual([])
  })

  it('handles null data as empty array', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await getTicketsForBoard('org-1')
    expect(result).toEqual([])
  })
})

/* ============================================================
   bulkUpdateTickets
   ============================================================ */

describe('bulkUpdateTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when ticketIds is empty', async () => {
    const result = await bulkUpdateTickets([], { status: 'done' })
    expect(result).toEqual({ error: 'No tickets selected' })
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await bulkUpdateTickets(['tkt-1'], { status: 'done' })
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const result = await bulkUpdateTickets(['tkt-1'], { status: 'done' })
    expect(result).toEqual({ error: 'You must belong to an organization' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await bulkUpdateTickets(['tkt-1'], { status: 'done' })
    expect(result).toEqual({ error: 'You do not have permission to update tickets' })
  })

  it('returns error when no fields to update', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await bulkUpdateTickets(['tkt-1'], {})
    expect(result).toEqual({ error: 'No fields to update' })
  })

  it('bulk updates tickets successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').update().in().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await bulkUpdateTickets(['tkt-1', 'tkt-2'], { status: 'done', priority: 'high' })
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
  })

  it('returns error when bulk update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB error' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await bulkUpdateTickets(['tkt-1'], { priority: 'low' })
    expect(result).toEqual({ error: 'Failed to update tickets. Please try again.' })
  })
})

/* ============================================================
   bulkDeleteTickets
   ============================================================ */

describe('bulkDeleteTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when ticketIds is empty', async () => {
    const result = await bulkDeleteTickets([])
    expect(result).toEqual({ error: 'No tickets selected' })
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await bulkDeleteTickets(['tkt-1'])
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getAuthContext).mockResolvedValueOnce({
      supabase: mockSupabase as never,
      user: { id: 'user-1' } as never,
      orgId: null,
    })

    const result = await bulkDeleteTickets(['tkt-1'])
    expect(result).toEqual({ error: 'You must belong to an organization' })
  })

  it('returns error when permission is denied', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await bulkDeleteTickets(['tkt-1'])
    expect(result).toEqual({ error: 'You do not have permission to delete tickets' })
  })

  it('deletes tickets successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').delete().in().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await bulkDeleteTickets(['tkt-1', 'tkt-2', 'tkt-3'])
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
  })

  it('returns error when bulk delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'FK constraint' } }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await bulkDeleteTickets(['tkt-1'])
    expect(result).toEqual({ error: 'Failed to delete tickets. Please try again.' })
  })
})

/* ============================================================
   getChildTickets
   ============================================================ */

describe('getChildTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns child tickets', async () => {
    const children = [
      { id: 'child-1', title: 'Sub-task 1', status: 'todo', priority: 'medium', assignee: null },
      {
        id: 'child-2',
        title: 'Sub-task 2',
        status: 'done',
        priority: 'low',
        assignee: { id: 'u-1', display_name: 'Alice', avatar_url: null },
      },
    ]
    fromResults = [{ data: children, error: null }]

    const result = await getChildTickets('parent-1')
    expect(result).toEqual(children)
  })

  it('returns empty array when no children exist', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getChildTickets('parent-1')
    expect(result).toEqual([])
  })

  it('returns empty array on error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getChildTickets('parent-1')
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await getChildTickets('parent-1')
    expect(result).toEqual([])
  })
})

/* ============================================================
   getParentTicket
   ============================================================ */

describe('getParentTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns parent ticket when found', async () => {
    const parent = { id: 'parent-1', title: 'Epic ticket', sequence_number: 1, org_id: 'org-1' }
    fromResults = [{ data: parent, error: null }]

    const result = await getParentTicket('parent-1')
    expect(result).toEqual(parent)
  })

  it('returns null when parent ticket is not found', async () => {
    fromResults = [{ data: null, error: { message: 'not found' } }]

    const result = await getParentTicket('non-existent')
    expect(result).toBeNull()
  })

  it('returns null on query error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getParentTicket('parent-1')
    expect(result).toBeNull()
  })
})

/* ============================================================
   setParentTicket
   ============================================================ */

describe('setParentTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error for self-reference', async () => {
    const result = await setParentTicket('tkt-1', 'tkt-1')
    expect(result).toEqual({ error: 'A ticket cannot be its own parent' })
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await setParentTicket('tkt-1', 'tkt-2')
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when ticket is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('tickets').select().eq().single() -> null (ticket)
    fromResults = [{ data: null }]

    const result = await setParentTicket('tkt-1', 'tkt-2')
    expect(result).toEqual({ error: 'Ticket not found' })
  })

  it('returns error when parent ticket is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').select().eq().single() -> ticket found
      { data: { org_id: 'org-1', parent_id: null } },
      // from('tickets').select().eq().single() -> parent not found
      { data: null },
    ]

    const result = await setParentTicket('tkt-1', 'tkt-2')
    expect(result).toEqual({ error: 'Parent ticket not found' })
  })

  it('returns error when tickets belong to different orgs', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', parent_id: null } },
      { data: { org_id: 'org-2', parent_id: null } },
    ]

    const result = await setParentTicket('tkt-1', 'tkt-2')
    expect(result).toEqual({ error: 'Tickets must belong to the same organization' })
  })

  it('returns error for circular reference', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // ticket lookup
      { data: { org_id: 'org-1', parent_id: null } },
      // parent lookup
      { data: { org_id: 'org-1', parent_id: null } },
      // fetchParentId for parentTicketId (tkt-2) -> parent_id is tkt-1
      // This means tkt-2's parent is tkt-1, creating a circular reference
      { data: { parent_id: 'tkt-1' } },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await setParentTicket('tkt-1', 'tkt-2')
    expect(result).toEqual({ error: 'This would create a circular reference' })
  })

  it('returns error when depth exceeds safety limit', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // Build a chain of 11+ ancestors to trigger depth > 10
    const results: Array<{ data?: unknown; error?: unknown }> = [
      // ticket lookup
      { data: { org_id: 'org-1', parent_id: null } },
      // parent lookup
      { data: { org_id: 'org-1', parent_id: 'ancestor-0' } },
    ]
    // Each fetchParentId walks up the chain
    for (let i = 0; i < 11; i++) {
      results.push({ data: { parent_id: `ancestor-${i + 1}` } })
    }
    fromResults = results
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await setParentTicket('tkt-child', 'tkt-parent')
    expect(result).toEqual({ error: 'Hierarchy depth exceeds safety limit' })
  })

  it('returns error when max nesting depth of 3 would be exceeded', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // ticket lookup
      { data: { org_id: 'org-1', parent_id: null } },
      // parent lookup (has 2 ancestors already -> depth=3)
      { data: { org_id: 'org-1', parent_id: 'grandparent' } },
      // fetchParentId for 'tkt-parent' -> has parent 'grandparent'
      { data: { parent_id: 'great-grandparent' } },
      // fetchParentId for 'grandparent' -> has parent 'great-grandparent'
      { data: { parent_id: 'gg-parent' } },
      // fetchParentId for 'great-grandparent' -> no parent (root)
      { data: { parent_id: null } },
      // from('tickets').select('id').eq('parent_id', ticketId) -> has children
      { data: [{ id: 'child-1' }] },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await setParentTicket('tkt-1', 'tkt-parent')
    // depth is 3 (tkt-parent -> grandparent -> great-grandparent -> gg-parent = depth 3 from while loop)
    // Actually let me trace through carefully:
    // visited = { tkt-1 }, depth=0, currentId='tkt-parent'
    // iteration 1: depth=1, visited={tkt-1, tkt-parent}, currentId = parent_id of tkt-parent = 'great-grandparent' (fromResults[2])
    // iteration 2: depth=2, visited={tkt-1, tkt-parent, great-grandparent}, currentId = parent_id of 'great-grandparent' = 'gg-parent' (fromResults[3])
    // iteration 3: depth=3, visited={...}, currentId = parent_id of 'gg-parent' = null (fromResults[4])
    // while exits. depth=3, 3 >= 3 -> "Maximum nesting depth of 3 levels would be exceeded"
    // But then checks children: has children && depth >= 2 -> also catches this
    // The first check triggers: depth >= 3
    expect(result).toEqual({ error: 'Maximum nesting depth of 3 levels would be exceeded' })
  })

  it('sets parent ticket successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // ticket lookup
      { data: { org_id: 'org-1', parent_id: null } },
      // parent lookup (root ticket, no parent)
      { data: { org_id: 'org-1', parent_id: null } },
      // fetchParentId for parentTicketId -> null (it's a root)
      { data: { parent_id: null } },
      // depth=1 (just the parent), which is < 3 and < 10
      // from('tickets').select('id').eq('parent_id', ticketId).limit(1) -> no children
      { data: [] },
      // from('tickets').update().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await setParentTicket('tkt-child', 'tkt-parent')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
    expect(revalidatePath).toHaveBeenCalledWith('/tickets/tkt-child')
    expect(revalidatePath).toHaveBeenCalledWith('/tickets/tkt-parent')
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', parent_id: null } },
      { data: { org_id: 'org-1', parent_id: null } },
      { data: { parent_id: null } },
      { data: [] },
      { error: { message: 'DB error' } },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await setParentTicket('tkt-child', 'tkt-parent')
    expect(result).toEqual({ error: 'Failed to set parent ticket. Please try again.' })
  })

  it('checks ticket.update permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', parent_id: null } },
      { data: { org_id: 'org-1', parent_id: null } },
      { data: { parent_id: null } },
      { data: [] },
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await setParentTicket('tkt-child', 'tkt-parent')
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'ticket.update')
  })
})

/* ============================================================
   removeParentTicket
   ============================================================ */

describe('removeParentTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const result = await removeParentTicket('tkt-1')
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when ticket is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const result = await removeParentTicket('non-existent')
    expect(result).toEqual({ error: 'Ticket not found' })
  })

  it('removes parent ticket successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('tickets').select().eq().single() -> ticket with parent
      { data: { org_id: 'org-1', parent_id: 'parent-1' } },
      // from('tickets').update().eq() -> success
      { error: null },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await removeParentTicket('tkt-1')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
    expect(revalidatePath).toHaveBeenCalledWith('/tickets/tkt-1')
    expect(revalidatePath).toHaveBeenCalledWith('/tickets/parent-1')
  })

  it('removes parent ticket when no previous parent', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', parent_id: null } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await removeParentTicket('tkt-1')
    expect(result).toEqual({})
    expect(revalidatePath).toHaveBeenCalledWith('/tickets')
    expect(revalidatePath).toHaveBeenCalledWith('/tickets/tkt-1')
    // Should NOT revalidate a null parent path
    expect(revalidatePath).not.toHaveBeenCalledWith('/tickets/null')
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', parent_id: 'parent-1' } },
      { error: { message: 'DB error' } },
    ]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await removeParentTicket('tkt-1')
    expect(result).toEqual({ error: 'Failed to remove parent ticket. Please try again.' })
  })

  it('checks ticket.update permission', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', parent_id: null } }, { error: null }]
    vi.mocked(requirePermission).mockResolvedValue('admin')

    await removeParentTicket('tkt-1')
    expect(requirePermission).toHaveBeenCalledWith('org-1', 'ticket.update')
  })
})
