import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

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
        const p = terminal()
        return p.then.bind(p)
      }
      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

vi.mock('@/lib/permissions', () => ({
  getUserOrg: vi.fn(),
}))

vi.mock('@pips/shared', () => ({
  hasPermission: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getAdminData } from '../actions'
import { getUserOrg } from '@/lib/permissions'
import { hasPermission } from '@pips/shared'

/* ============================================================
   Shared fixtures
   ============================================================ */

const mockMembership = {
  org_id: 'org-1',
  role: 'owner',
  organizations: { id: 'org-1', name: 'Test Org', slug: 'test-org' },
}

/** Minimal valid dataset for the happy-path scenario.
 *  fromResults index map (Promise.all order + sequential follow-ups):
 *  0  org_members (members)
 *  1  teams
 *  2  projects
 *  3  tickets count
 *  4  open tickets count
 *  5  project_forms count
 *  6  team_members (for team member counts)
 *  7  project_members (for project member counts)
 *  8  team_members again (for per-user team counts)
 */
const buildHappyPathResults = () => [
  {
    data: [
      {
        id: 'mem-1',
        user_id: 'user-1',
        role: 'owner',
        joined_at: '2024-01-01T00:00:00Z',
        profiles: { full_name: 'Alice', email: 'alice@example.com' },
      },
    ],
  },
  { data: [{ id: 'team-1', name: 'Dev Team' }] },
  {
    data: [
      {
        id: 'proj-1',
        title: 'My Project',
        status: 'active',
        current_step: 'identify',
        owner_id: 'user-1',
        profiles: { full_name: 'Alice' },
      },
    ],
  },
  { count: 10 },
  { count: 5 },
  { count: 3 },
  { data: [{ team_id: 'team-1' }, { team_id: 'team-1' }] },
  { data: [{ project_id: 'proj-1', user_id: 'user-1' }] },
  { data: [{ user_id: 'user-1' }] },
]

/* ============================================================
   getAdminData
   ============================================================ */

describe('getAdminData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    vi.mocked(getUserOrg).mockResolvedValue(
      mockMembership as unknown as Awaited<ReturnType<typeof getUserOrg>>,
    )
    vi.mocked(hasPermission).mockReturnValue(true)
  })

  /* ---------- Auth / permission guards ---------- */

  it('returns null when getUserOrg returns null (unauthenticated)', async () => {
    vi.mocked(getUserOrg).mockResolvedValue(null)

    const result = await getAdminData()
    expect(result).toBeNull()
  })

  it('returns null when user lacks org.members.manage permission', async () => {
    vi.mocked(hasPermission).mockReturnValue(false)

    const result = await getAdminData()
    expect(result).toBeNull()
  })

  /* ---------- Happy path ---------- */

  it('returns full admin data on happy path', async () => {
    fromResults = buildHappyPathResults()

    const result = await getAdminData()

    expect(result).not.toBeNull()
    expect(result!.role).toBe('owner')
    expect(result!.orgId).toBe('org-1')
  })

  it('returns correct stats from happy-path data', async () => {
    fromResults = buildHappyPathResults()

    const result = await getAdminData()

    expect(result!.stats).toEqual({
      memberCount: 1,
      teamCount: 1,
      projectCount: 1,
      activeProjectCount: 1,
      ticketCount: 10,
      openTicketCount: 5,
      formCount: 3,
    })
  })

  it('maps members with full_name and email from profiles', async () => {
    fromResults = buildHappyPathResults()

    const result = await getAdminData()

    expect(result!.members).toHaveLength(1)
    expect(result!.members[0]).toMatchObject({
      id: 'mem-1',
      user_id: 'user-1',
      role: 'owner',
      full_name: 'Alice',
      email: 'alice@example.com',
    })
  })

  it('maps teams with member_count', async () => {
    fromResults = buildHappyPathResults()

    const result = await getAdminData()

    expect(result!.teams).toHaveLength(1)
    expect(result!.teams[0]).toMatchObject({
      id: 'team-1',
      name: 'Dev Team',
      member_count: 2,
    })
  })

  it('maps projects with owner_name and member_count', async () => {
    fromResults = buildHappyPathResults()

    const result = await getAdminData()

    expect(result!.projects).toHaveLength(1)
    expect(result!.projects[0]).toMatchObject({
      id: 'proj-1',
      title: 'My Project',
      status: 'active',
      current_step: 'identify',
      owner_name: 'Alice',
      member_count: 1,
    })
  })

  /* ---------- Edge: empty datasets ---------- */

  it('handles no teams gracefully (skips team_members queries)', async () => {
    fromResults = [
      // members
      {
        data: [
          {
            id: 'mem-1',
            user_id: 'user-1',
            role: 'admin',
            joined_at: '2024-01-01T00:00:00Z',
            profiles: { full_name: 'Bob', email: 'bob@example.com' },
          },
        ],
      },
      // teams (empty)
      { data: [] },
      // projects (empty)
      { data: [] },
      // tickets count
      { count: 0 },
      // open tickets count
      { count: 0 },
      // forms count
      { count: 0 },
      // project_members (skipped, projects empty → no query)
    ]

    const result = await getAdminData()

    expect(result).not.toBeNull()
    expect(result!.stats.teamCount).toBe(0)
    expect(result!.stats.projectCount).toBe(0)
    expect(result!.teams).toEqual([])
    expect(result!.projects).toEqual([])
  })

  it('uses Unknown as owner_name when project profile is null', async () => {
    fromResults = [
      // members
      { data: [] },
      // teams
      { data: [] },
      // projects with null profile
      {
        data: [
          {
            id: 'proj-2',
            title: 'Orphan Project',
            status: 'active',
            current_step: 'analyze',
            owner_id: 'user-99',
            profiles: null,
          },
        ],
      },
      { count: 0 },
      { count: 0 },
      { count: 0 },
    ]

    const result = await getAdminData()

    expect(result!.projects[0]!.owner_name).toBe('Unknown')
  })

  it('uses null as full_name when member profile is missing', async () => {
    fromResults = [
      {
        data: [
          {
            id: 'mem-2',
            user_id: 'user-2',
            role: 'member',
            joined_at: '2024-06-01T00:00:00Z',
            profiles: null,
          },
        ],
      },
      { data: [] },
      { data: [] },
      { count: 0 },
      { count: 0 },
      { count: 0 },
    ]

    const result = await getAdminData()

    expect(result!.members[0]!.full_name).toBeNull()
    expect(result!.members[0]!.email).toBe('')
  })

  it('counts inactive projects separately from active', async () => {
    fromResults = [
      { data: [] },
      { data: [] },
      {
        data: [
          {
            id: 'p1',
            title: 'Active',
            status: 'active',
            current_step: 'identify',
            owner_id: 'u1',
            profiles: null,
          },
          {
            id: 'p2',
            title: 'Archived',
            status: 'archived',
            current_step: 'evaluate',
            owner_id: 'u2',
            profiles: null,
          },
        ],
      },
      { count: 5 },
      { count: 2 },
      { count: 1 },
    ]

    const result = await getAdminData()

    expect(result!.stats.projectCount).toBe(2)
    expect(result!.stats.activeProjectCount).toBe(1)
  })
})
