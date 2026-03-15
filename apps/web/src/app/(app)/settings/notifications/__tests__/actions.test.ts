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

const { mockGetCurrentOrg } = vi.hoisted(() => ({
  mockGetCurrentOrg: vi
    .fn()
    .mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' }),
}))

const mockSupabase = {
  auth: {
    getUser: () => mockGetUser(),
  },
  from: () => {
    const idx = fromCallIndex++
    return createChainForIndex(idx)
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

vi.mock('@/lib/auth-context', () => ({
  getAuthContext: vi.fn(async () => {
    const result = await mockGetUser()
    const user = result?.data?.user ?? null
    const org = user ? await mockGetCurrentOrg() : null
    return {
      supabase: mockSupabase,
      user,
      orgId: org?.orgId ?? null,
    }
  }),
}))

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: mockGetCurrentOrg,
  ORG_COOKIE_NAME: 'pips-org-id',
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getNotificationPreferences, updateNotificationPreferences } from '../actions'
import { getCurrentOrg } from '@/lib/get-current-org'

/* ============================================================
   getNotificationPreferences
   ============================================================ */

describe('getNotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getNotificationPreferences()
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns error when user has no org membership', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    vi.mocked(getCurrentOrg).mockResolvedValueOnce(null)

    const result = await getNotificationPreferences()
    expect(result).toEqual({ error: 'You are not a member of any organization' })
  })

  it('returns existing preferences when found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const prefsData = {
      id: 'prefs-1',
      user_id: 'user-1',
      org_id: 'org-1',
      ticket_assigned: true,
      mention: true,
      project_updated: false,
      ticket_updated: true,
      ticket_commented: true,
      email_enabled: false,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    }
    fromResults = [
      // notification_preferences -> existing
      { data: prefsData },
    ]

    const result = await getNotificationPreferences()
    expect(result).toEqual({ preferences: prefsData })
  })

  it('creates default preferences when none exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const defaultPrefs = {
      id: 'prefs-new',
      user_id: 'user-1',
      org_id: 'org-1',
      ticket_assigned: true,
      mention: true,
      project_updated: true,
      ticket_updated: true,
      ticket_commented: true,
      email_enabled: true,
      created_at: '2026-03-01',
      updated_at: '2026-03-01',
    }
    fromResults = [
      // notification_preferences -> not found
      { data: null },
      // notification_preferences insert -> created
      { data: defaultPrefs },
    ]

    const result = await getNotificationPreferences()
    expect(result).toEqual({ preferences: defaultPrefs })
  })

  it('returns error when creating default preferences fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }, { data: null, error: { message: 'Insert error' } }]

    const result = await getNotificationPreferences()
    expect(result).toEqual({ error: 'Failed to create notification preferences' })
  })
})

/* ============================================================
   updateNotificationPreferences
   ============================================================ */

describe('updateNotificationPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error for invalid preference key', async () => {
    // Cast to bypass TS type check for testing runtime validation
    const result = await updateNotificationPreferences(
      'prefs-1',
      'invalid_key' as 'ticket_assigned',
      true,
    )
    expect(result).toEqual({ error: 'Invalid preference key' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateNotificationPreferences('prefs-1', 'ticket_assigned', false)
    expect(result).toEqual({ error: 'You must be signed in' })
  })

  it('returns updated preferences on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const updatedPrefs = {
      id: 'prefs-1',
      user_id: 'user-1',
      org_id: 'org-1',
      ticket_assigned: false,
      mention: true,
      project_updated: true,
      ticket_updated: true,
      ticket_commented: true,
      email_enabled: true,
    }
    fromResults = [{ data: updatedPrefs }]

    const result = await updateNotificationPreferences('prefs-1', 'ticket_assigned', false)
    expect(result).toEqual({ preferences: updatedPrefs })
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await updateNotificationPreferences('prefs-1', 'email_enabled', true)
    expect(result).toEqual({ error: 'Failed to update preferences' })
  })

  it('accepts all valid preference keys', async () => {
    const validKeys = [
      'ticket_assigned',
      'mention',
      'project_updated',
      'ticket_updated',
      'ticket_commented',
      'email_enabled',
    ] as const

    for (const key of validKeys) {
      vi.clearAllMocks()
      fromCallIndex = 0
      fromResults = []
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
      fromResults = [{ data: { id: 'prefs-1', [key]: true } }]

      const result = await updateNotificationPreferences('prefs-1', key, true)
      expect(result.error).toBeUndefined()
    }
  })
})
