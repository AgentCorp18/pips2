import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; count?: number | null; error?: unknown }> = []

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

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('owner'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email/invitation', () => ({
  invitationTemplate: vi.fn().mockReturnValue('<html>Invite</html>'),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { changeMemberRole, removeMember, inviteMember } from '../actions'
import { requirePermission } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

/* ============================================================
   changeMemberRole
   ============================================================ */

describe('changeMemberRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when permission check fails', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await changeMemberRole('org-1', 'member-1', 'admin')
    expect(result).toEqual({ success: false, error: 'No permission' })
  })

  it('returns error when target member is not found', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    fromResults = [{ data: null }]

    const result = await changeMemberRole('org-1', 'member-1', 'admin')
    expect(result).toEqual({ success: false, error: 'Member not found' })
  })

  it('returns error when trying to change role of higher-level member', async () => {
    vi.mocked(requirePermission).mockResolvedValue('admin')
    // Target is an owner
    fromResults = [{ data: { role: 'owner', user_id: 'user-2' } }]

    const result = await changeMemberRole('org-1', 'member-1', 'member')
    expect(result).toEqual({ success: false, error: 'Cannot change role of this member' })
  })

  it('returns error when trying to promote to equal or higher role', async () => {
    vi.mocked(requirePermission).mockResolvedValue('admin')
    // Target is a member (lower than admin)
    fromResults = [{ data: { role: 'member', user_id: 'user-2' } }]

    // Trying to promote to admin (same level as actor)
    const result = await changeMemberRole('org-1', 'member-1', 'admin')
    expect(result).toEqual({ success: false, error: 'Cannot assign a role at or above your own' })
  })

  it('returns error when owner tries to change another owner role', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    // Target is also an owner
    fromResults = [{ data: { role: 'owner', user_id: 'user-2' } }]

    const result = await changeMemberRole('org-1', 'member-1', 'admin')
    expect(result).toEqual({ success: false, error: 'Cannot change role of this member' })
  })

  it('changes role successfully', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    fromResults = [
      // Target is member (lower than owner)
      { data: { role: 'member', user_id: 'user-2' } },
      // from('org_members').update().eq().eq() -> success
      { error: null },
    ]

    const result = await changeMemberRole('org-1', 'member-1', 'admin')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/settings/members')
  })

  it('returns error when update fails', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    fromResults = [
      { data: { role: 'member', user_id: 'user-2' } },
      { error: { message: 'DB error' } },
    ]

    const result = await changeMemberRole('org-1', 'member-1', 'admin')
    expect(result).toEqual({
      success: false,
      error: 'Failed to change member role. Please try again.',
    })
  })
})

/* ============================================================
   removeMember
   ============================================================ */

describe('removeMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when permission check fails', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: false, error: 'No permission' })
  })

  it('returns error when target member is not found', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    fromResults = [{ data: null }]

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: false, error: 'Member not found' })
  })

  it('returns error when trying to remove higher-level member', async () => {
    vi.mocked(requirePermission).mockResolvedValue('admin')
    fromResults = [{ data: { role: 'owner', user_id: 'user-2' } }]

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: false, error: 'Cannot remove this member' })
  })

  it('returns error when owner tries to remove another owner', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    // Target is also an owner
    fromResults = [{ data: { role: 'owner', user_id: 'user-2' } }]

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: false, error: 'Cannot remove this member' })
  })

  it('returns error when trying to remove yourself', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-self' } } })
    fromResults = [{ data: { role: 'member', user_id: 'user-self' } }]

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: false, error: 'Cannot remove yourself' })
  })

  it('removes member successfully', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-actor' } } })
    fromResults = [
      // Target member
      { data: { role: 'member', user_id: 'user-target' } },
      // from('org_members').delete().eq().eq() -> success
      { error: null },
    ]

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/settings/members')
  })

  it('returns error when delete fails', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-actor' } } })
    fromResults = [
      { data: { role: 'member', user_id: 'user-target' } },
      { error: { message: 'FK constraint' } },
    ]

    const result = await removeMember('org-1', 'member-1')
    expect(result).toEqual({ success: false, error: 'Failed to remove member. Please try again.' })
  })
})

/* ============================================================
   inviteMember
   ============================================================ */

describe('inviteMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when permission check fails', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('No permission'))

    const result = await inviteMember('org-1', 'new@example.com', 'member')
    expect(result).toEqual({ success: false, error: 'No permission' })
  })

  it('returns error when trying to invite at or above own role', async () => {
    vi.mocked(requirePermission).mockResolvedValue('admin')

    const result = await inviteMember('org-1', 'new@example.com', 'admin')
    expect(result).toEqual({
      success: false,
      error: 'Cannot invite a member with a role at or above your own',
    })
  })

  it('returns error when user is already a member', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    fromResults = [
      // from('profiles').select().eq().single() -> profile found
      { data: { id: 'existing-user' } },
      // from('org_members').select().eq().eq().single() -> already member
      { data: { id: 'member-existing' } },
    ]

    const result = await inviteMember('org-1', 'existing@example.com', 'member')
    expect(result).toEqual({
      success: false,
      error: 'User is already a member of this organization',
    })
  })

  it('returns error when pending invitation already exists', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    fromResults = [
      // from('profiles') -> no existing profile
      { data: null },
      // from('org_invitations') -> pending invitation exists
      { data: { id: 'invite-1' } },
    ]

    const result = await inviteMember('org-1', 'pending@example.com', 'member')
    expect(result).toEqual({
      success: false,
      error: 'An invitation is already pending for this email',
    })
  })

  it('returns error when user is not authenticated', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    mockGetUser.mockResolvedValue({ data: { user: null } })
    fromResults = [{ data: null }, { data: null }]

    const result = await inviteMember('org-1', 'new@example.com', 'member')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns error when invitation insert fails', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // profiles lookup -> not found
      { data: null },
      // pending invite -> none
      { data: null },
      // inviter profile
      { data: { full_name: 'Admin User' } },
      // org name
      { data: { name: 'Test Org' } },
      // invitation insert -> error
      { data: null, error: { message: 'Insert failed' } },
    ]

    const result = await inviteMember('org-1', 'new@example.com', 'member')
    expect(result).toEqual({
      success: false,
      error: 'Failed to send invitation. Please try again.',
    })
  })

  it('invites member successfully', async () => {
    vi.mocked(requirePermission).mockResolvedValue('owner')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: null },
      { data: null },
      { data: { full_name: 'Admin User' } },
      { data: { name: 'Test Org' } },
      { data: { token: 'invite-token-123' } },
    ]

    const result = await inviteMember('org-1', 'new@example.com', 'member')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/settings/members')
  })
})
