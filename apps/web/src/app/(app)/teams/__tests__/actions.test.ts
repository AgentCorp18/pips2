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

const mockGetUserOrg = vi.fn()
const mockRequirePermission = vi.fn()

vi.mock('@/lib/permissions', () => ({
  getUserOrg: (...args: unknown[]) => mockGetUserOrg(...args),
  requirePermission: (...args: unknown[]) => mockRequirePermission(...args),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getTeams, createTeam, deleteTeam, addTeamMember, removeTeamMember } from '../actions'
import { revalidatePath } from 'next/cache'

/* ============================================================
   getTeams
   ============================================================ */

describe('getTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns teams when user has org membership', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })

    fromResults = [
      {
        data: [
          {
            id: 'team-1',
            name: 'Engineering',
            description: 'Eng team',
            color: '#4F46E5',
            created_at: '2026-01-01',
            team_members: [{ id: 'tm-1' }, { id: 'tm-2' }],
          },
        ],
      },
    ]

    const result = await getTeams()
    expect(result).toEqual([
      {
        id: 'team-1',
        name: 'Engineering',
        description: 'Eng team',
        color: '#4F46E5',
        created_at: '2026-01-01',
        member_count: 2,
      },
    ])
  })

  it('returns empty array when no membership', async () => {
    mockGetUserOrg.mockResolvedValue(null)

    const result = await getTeams()
    expect(result).toEqual([])
  })
})

/* ============================================================
   createTeam
   ============================================================ */

describe('createTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('creates a team successfully', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // from('teams').insert(...)
    fromResults = [{ data: null, error: null }]

    const result = await createTeam('Engineering', 'Eng team')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/teams')
  })

  it('returns error when name is empty', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const result = await createTeam('   ')
    expect(result).toEqual({ success: false, error: 'Team name is required' })
  })

  it('returns error for duplicate team name (23505)', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    // from('teams').insert(...) returns duplicate key error
    fromResults = [{ data: null, error: { code: '23505', message: 'duplicate key' } }]

    const result = await createTeam('Engineering')
    expect(result).toEqual({ success: false, error: 'A team with that name already exists' })
  })

  it('returns error when not authenticated (no membership)', async () => {
    mockGetUserOrg.mockResolvedValue(null)

    const result = await createTeam('Engineering')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })

  it('returns error when user is null from getUser', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await createTeam('Engineering')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })
})

/* ============================================================
   deleteTeam
   ============================================================ */

describe('deleteTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('deletes a team successfully', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // from('teams').select(...).eq(...).eq(...).single() — verify team
      { data: { id: 'team-1', org_id: 'org-1' } },
      // from('teams').delete().eq(...)
      { data: null, error: null },
    ]

    const result = await deleteTeam('team-1')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/teams')
  })

  it('returns error when team not found', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // team lookup returns null
      { data: null },
    ]

    const result = await deleteTeam('nonexistent')
    expect(result).toEqual({ success: false, error: 'Team not found' })
  })

  it('returns error when not authenticated', async () => {
    mockGetUserOrg.mockResolvedValue(null)

    const result = await deleteTeam('team-1')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })
})

/* ============================================================
   addTeamMember
   ============================================================ */

describe('addTeamMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('adds a team member successfully', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // from('teams').select('id').eq(...).eq(...).single() — verify team
      { data: { id: 'team-1' } },
      // from('org_members').select('id').eq(...).eq(...).single() — verify org member
      { data: { id: 'om-1' } },
      // from('team_members').insert(...)
      { data: null, error: null },
    ]

    const result = await addTeamMember('team-1', 'user-2')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/teams/team-1')
  })

  it('returns error when user is not in the org', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // team verified
      { data: { id: 'team-1' } },
      // org_members lookup — user not found
      { data: null },
    ]

    const result = await addTeamMember('team-1', 'user-external')
    expect(result).toEqual({
      success: false,
      error: 'User is not a member of this organization',
    })
  })

  it('returns error for duplicate member (23505)', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // team verified
      { data: { id: 'team-1' } },
      // org member verified
      { data: { id: 'om-1' } },
      // insert returns duplicate key error
      { data: null, error: { code: '23505', message: 'duplicate key' } },
    ]

    const result = await addTeamMember('team-1', 'user-2')
    expect(result).toEqual({
      success: false,
      error: 'User is already a member of this team',
    })
  })

  it('returns error when not authenticated', async () => {
    mockGetUserOrg.mockResolvedValue(null)

    const result = await addTeamMember('team-1', 'user-2')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })
})

/* ============================================================
   removeTeamMember
   ============================================================ */

describe('removeTeamMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('removes a team member successfully', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // from('teams').select('id').eq(...).eq(...).single() — verify team
      { data: { id: 'team-1' } },
      // from('team_members').delete().eq(...).eq(...)
      { data: null, error: null },
    ]

    const result = await removeTeamMember('team-1', 'user-2')
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/teams/team-1')
  })

  it('returns error when team not found', async () => {
    mockGetUserOrg.mockResolvedValue({ org_id: 'org-1', role: 'admin' })
    mockRequirePermission.mockResolvedValue('admin')

    fromResults = [
      // team lookup returns null
      { data: null },
    ]

    const result = await removeTeamMember('nonexistent', 'user-2')
    expect(result).toEqual({ success: false, error: 'Team not found' })
  })

  it('returns error when not authenticated', async () => {
    mockGetUserOrg.mockResolvedValue(null)

    const result = await removeTeamMember('team-1', 'user-2')
    expect(result).toEqual({ success: false, error: 'Not authenticated' })
  })
})
