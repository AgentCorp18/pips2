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

const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: { id: 'user-1' } },
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  getUserOrg: vi.fn(async () => ({
    org_id: 'org-1',
    role: 'owner',
    organizations: { id: 'org-1', name: 'Test Org', slug: 'test-org' },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import {
  getOrgSessions,
  getSession,
  createSession,
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  setCurrentModule,
  updateTimerState,
  updateParticipantCount,
} from '../actions'

/* ============================================================
   getOrgSessions
   ============================================================ */

describe('getOrgSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns sessions for the org', async () => {
    const sessions = [
      { id: 's1', title: 'Session 1', status: 'draft' },
      { id: 's2', title: 'Session 2', status: 'active' },
    ]
    fromResults = [{ data: sessions, error: null }]

    const result = await getOrgSessions()
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toBe('s1')
  })

  it('returns empty array on error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getOrgSessions()
    expect(result).toEqual([])
  })
})

/* ============================================================
   getSession
   ============================================================ */

describe('getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns session by ID', async () => {
    const session = { id: 's1', title: 'Test', status: 'draft' }
    fromResults = [{ data: session, error: null }]

    const result = await getSession('s1')
    expect(result).not.toBeNull()
    expect(result!.id).toBe('s1')
  })

  it('returns null on error', async () => {
    fromResults = [{ data: null, error: { message: 'Not found' } }]

    const result = await getSession('nonexistent')
    expect(result).toBeNull()
  })
})

/* ============================================================
   createSession
   ============================================================ */

describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('creates session with title and modules', async () => {
    const newSession = {
      id: 'new-1',
      title: 'My Workshop',
      status: 'draft',
      modules: [{ title: 'Intro', duration: '5 min', notes: '' }],
    }
    fromResults = [{ data: newSession, error: null }]

    const result = await createSession('My Workshop', [
      { title: 'Intro', duration: '5 min', notes: '' },
    ])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('My Workshop')
    }
  })

  it('returns error on DB failure', async () => {
    fromResults = [{ data: null, error: { message: 'Insert failed' } }]

    const result = await createSession('Fail', [])
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Insert failed')
    }
  })
})

/* ============================================================
   startSession
   ============================================================ */

describe('startSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('starts a draft session', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await startSession('s1')
    expect(result.success).toBe(true)
  })

  it('returns error on failure', async () => {
    fromResults = [{ data: null, error: { message: 'Not in draft' } }]

    const result = await startSession('s1')
    expect(result.success).toBe(false)
  })
})

/* ============================================================
   pauseSession
   ============================================================ */

describe('pauseSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('pauses an active session', async () => {
    // First call: fetch current timer_state
    fromResults = [
      {
        data: {
          timer_state: { mode: 'countup', running: true, startedAt: new Date().toISOString() },
        },
        error: null,
      },
      // Second call: update
      { data: null, error: null },
    ]

    const result = await pauseSession('s1')
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   resumeSession
   ============================================================ */

describe('resumeSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('resumes a paused session', async () => {
    fromResults = [
      { data: { timer_state: { mode: 'countup', running: false } }, error: null },
      { data: null, error: null },
    ]

    const result = await resumeSession('s1')
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   completeSession
   ============================================================ */

describe('completeSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('completes an active session', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await completeSession('s1')
    expect(result.success).toBe(true)
  })

  it('returns error on failure', async () => {
    fromResults = [{ data: null, error: { message: 'Already completed' } }]

    const result = await completeSession('s1')
    expect(result.success).toBe(false)
  })
})

/* ============================================================
   setCurrentModule
   ============================================================ */

describe('setCurrentModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('advances to a specific module', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await setCurrentModule('s1', 3)
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   updateTimerState
   ============================================================ */

describe('updateTimerState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('sets countdown timer', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await updateTimerState('s1', {
      mode: 'countdown',
      duration: 300,
      remaining: 300,
      running: true,
      startedAt: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
  })

  it('resets timer', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await updateTimerState('s1', {})
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   updateParticipantCount
   ============================================================ */

describe('updateParticipantCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('updates count', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await updateParticipantCount('s1', 5)
    expect(result.success).toBe(true)
  })
})
