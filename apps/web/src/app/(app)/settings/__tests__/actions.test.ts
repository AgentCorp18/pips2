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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: vi.fn().mockReturnValue(undefined) })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getOrgWithSettings, updateOrgSettings } from '../actions'

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

const validSettingsFields = {
  name: 'My Organization',
  timezone: 'America/Chicago',
  date_format: 'MM/dd/yyyy',
  week_start: 'monday',
  default_ticket_priority: 'medium',
  ticket_prefix: 'PIPS',
}

const emptyState = {}

/* ============================================================
   getOrgWithSettings
   ============================================================ */

describe('getOrgWithSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns null when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getOrgWithSettings()
    expect(result).toBeNull()
  })

  it('returns null when user has no org membership', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // from('org_members').select().eq().limit().maybeSingle() -> null
    fromResults = [{ data: null }]

    const result = await getOrgWithSettings()
    expect(result).toBeNull()
  })

  it('returns null when organization is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('org_members') -> membership
      { data: { org_id: 'org-1', role: 'admin' } },
      // from('organizations') -> null
      { data: null },
    ]

    const result = await getOrgWithSettings()
    expect(result).toBeNull()
  })

  it('returns org with settings when everything is found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const orgData = {
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
      logo_url: null,
      plan: 'free',
    }
    const settingsData = {
      timezone: 'UTC',
      date_format: 'yyyy-MM-dd',
      week_start: 'monday',
      default_ticket_priority: 'high',
      ticket_prefix: 'TEST',
      notification_settings: { email_digest: 'daily', in_app: true },
      branding: {},
    }

    fromResults = [
      { data: { org_id: 'org-1', role: 'owner' } },
      { data: orgData },
      { data: settingsData },
    ]

    const result = await getOrgWithSettings()
    expect(result).toEqual({
      org: orgData,
      role: 'owner',
      settings: settingsData,
    })
  })

  it('returns default settings when org_settings is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const orgData = {
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
      logo_url: null,
      plan: 'free',
    }

    fromResults = [{ data: { org_id: 'org-1', role: 'admin' } }, { data: orgData }, { data: null }]

    const result = await getOrgWithSettings()
    expect(result).not.toBeNull()
    expect(result!.settings).toEqual({
      timezone: 'America/Chicago',
      date_format: 'MM/dd/yyyy',
      week_start: 'monday',
      default_ticket_priority: 'medium',
      ticket_prefix: 'PIPS',
      notification_settings: { email_digest: 'daily', in_app: true },
      branding: {},
    })
  })
})

/* ============================================================
   updateOrgSettings
   ============================================================ */

describe('updateOrgSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  /* ---------- Validation errors ---------- */

  it('returns fieldErrors when name is too short', async () => {
    const fd = makeFormData({ ...validSettingsFields, name: 'A' })
    const result = await updateOrgSettings(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('returns fieldErrors when timezone is missing', async () => {
    const fd = makeFormData({ ...validSettingsFields, timezone: '' })
    const result = await updateOrgSettings(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.timezone).toBeDefined()
  })

  it('returns fieldErrors when date_format is invalid', async () => {
    const fd = makeFormData({ ...validSettingsFields, date_format: 'invalid' })
    const result = await updateOrgSettings(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.date_format).toBeDefined()
  })

  it('returns fieldErrors when ticket_prefix has lowercase', async () => {
    const fd = makeFormData({ ...validSettingsFields, ticket_prefix: 'pips' })
    const result = await updateOrgSettings(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.ticket_prefix).toBeDefined()
  })

  it('returns fieldErrors when ticket_prefix is too short', async () => {
    const fd = makeFormData({ ...validSettingsFields, ticket_prefix: 'P' })
    const result = await updateOrgSettings(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.ticket_prefix).toBeDefined()
  })

  /* ---------- Auth errors ---------- */

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ error: 'You must be signed in to update settings' })
  })

  it('returns error when user has no org membership', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ error: 'You are not a member of any organization' })
  })

  it('returns error when user is not owner or admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', role: 'member' } }]

    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ error: 'Only owners and admins can update organization settings' })
  })

  /* ---------- DB error paths ---------- */

  it('returns error when org name update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', role: 'owner' } },
      // from('organizations').update().eq() -> error
      { error: { message: 'DB error' } },
    ]

    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to update organization name' })
  })

  it('returns error when settings update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: { org_id: 'org-1', role: 'admin' } },
      // from('organizations').update().eq() -> success
      { error: null },
      // from('org_settings').update().eq() -> error
      { error: { message: 'Settings DB error' } },
    ]

    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to update organization settings' })
  })

  /* ---------- Success path ---------- */

  it('returns success when settings are updated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', role: 'owner' } }, { error: null }, { error: null }]

    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ success: 'Settings updated successfully' })
  })

  it('allows admin role to update settings', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { org_id: 'org-1', role: 'admin' } }, { error: null }, { error: null }]

    const fd = makeFormData(validSettingsFields)
    const result = await updateOrgSettings(emptyState, fd)
    expect(result).toEqual({ success: 'Settings updated successfully' })
  })
})
