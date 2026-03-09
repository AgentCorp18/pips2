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

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
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

import {
  getContentByPillar,
  getContentBySlug,
  getContentChildren,
  searchContent,
  getContentForContext,
  getUserBookmarks,
  getUserBookmarksWithContent,
  toggleBookmark,
  recordReadHistory,
  updateReadingSession,
  getReadingSession,
  getAllReadingSessions,
  getContentByTool,
  getGuideContentForStep,
  getRecentReadHistory,
  getRecentReadHistoryWithContent,
} from '../actions'

/* ============================================================
   Sample data
   ============================================================ */

const sampleNode = {
  id: 'node-1',
  pillar: 'methodology',
  title: 'Introduction to PIPS',
  slug: 'intro-to-pips',
  parent_id: null,
  summary: 'Learn about PIPS methodology',
  body_md: '# Introduction\n\nWelcome to PIPS.',
  estimated_read_minutes: 5,
  sort_order: 1,
  access_level: 'public',
  tags: { steps: ['step-1'], tools: ['swot'] },
  related_nodes: [],
}

const sampleChildNode = {
  ...sampleNode,
  id: 'node-2',
  parent_id: 'node-1',
  title: 'Sub-section A',
  slug: 'sub-section-a',
  sort_order: 1,
}

const sampleBookmark = {
  id: 'bm-1',
  content_node_id: 'node-1',
  note: 'Important reference',
  created_at: '2026-01-15T10:00:00Z',
}

const sampleReadHistory = {
  content_node_id: 'node-1',
  last_read_at: '2026-02-01T12:00:00Z',
  read_count: 3,
}

/* ============================================================
   getContentByPillar
   ============================================================ */

describe('getContentByPillar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns content nodes for a given pillar', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await getContentByPillar('methodology')
    expect(result).toEqual([sampleNode])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getContentByPillar('methodology')
    expect(result).toEqual([])
  })

  it('returns empty array when data is null', async () => {
    fromResults = [{ data: null, error: null }]

    const result = await getContentByPillar('nonexistent')
    expect(result).toEqual([])
  })
})

/* ============================================================
   getContentBySlug
   ============================================================ */

describe('getContentBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns a single content node by pillar and slug', async () => {
    fromResults = [{ data: sampleNode, error: null }]

    const result = await getContentBySlug('methodology', 'intro-to-pips')
    expect(result).toEqual(sampleNode)
  })

  it('returns null on db error', async () => {
    fromResults = [{ data: null, error: { message: 'Not found' } }]

    const result = await getContentBySlug('methodology', 'nonexistent')
    expect(result).toBeNull()
  })

  it('returns null when no matching node exists', async () => {
    fromResults = [{ data: null, error: { code: 'PGRST116', message: 'No rows' } }]

    const result = await getContentBySlug('methodology', 'missing-slug')
    expect(result).toBeNull()
  })
})

/* ============================================================
   getContentChildren
   ============================================================ */

describe('getContentChildren', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns child content nodes for a parent', async () => {
    fromResults = [{ data: [sampleChildNode], error: null }]

    const result = await getContentChildren('node-1')
    expect(result).toEqual([sampleChildNode])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getContentChildren('node-1')
    expect(result).toEqual([])
  })

  it('returns empty array when no children exist', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await getContentChildren('node-leaf')
    expect(result).toEqual([])
  })
})

/* ============================================================
   searchContent
   ============================================================ */

describe('searchContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns search results for a query', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await searchContent('introduction')
    expect(result).toEqual([sampleNode])
  })

  it('returns search results filtered by pillar', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await searchContent('PIPS', 'methodology')
    expect(result).toEqual([sampleNode])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'Search error' } }]

    const result = await searchContent('test query')
    expect(result).toEqual([])
  })

  it('returns empty array when no results found', async () => {
    fromResults = [{ data: [], error: null }]

    const result = await searchContent('zzzznonexistent')
    expect(result).toEqual([])
  })

  it('handles multi-word queries', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await searchContent('PIPS methodology introduction')
    expect(result).toEqual([sampleNode])
  })
})

/* ============================================================
   getContentForContext
   ============================================================ */

describe('getContentForContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns nodes matching step tags', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await getContentForContext(['step-1'], [])
    expect(result).toEqual([sampleNode])
  })

  it('returns nodes matching tool tags', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await getContentForContext([], ['swot'])
    expect(result).toEqual([sampleNode])
  })

  it('filters out nodes that do not match any tags', async () => {
    const unmatchedNode = {
      ...sampleNode,
      id: 'node-unmatched',
      tags: { steps: ['step-5'], tools: ['gantt'] },
    }
    fromResults = [{ data: [sampleNode, unmatchedNode], error: null }]

    const result = await getContentForContext(['step-1'], ['swot'])
    expect(result).toEqual([sampleNode])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getContentForContext(['step-1'], ['swot'])
    expect(result).toEqual([])
  })

  it('returns empty array when no nodes match', async () => {
    const noMatchNode = {
      ...sampleNode,
      tags: { steps: ['step-6'], tools: ['other-tool'] },
    }
    fromResults = [{ data: [noMatchNode], error: null }]

    const result = await getContentForContext(['step-1'], ['swot'])
    expect(result).toEqual([])
  })

  it('handles nodes with empty tags gracefully', async () => {
    const emptyTagsNode = { ...sampleNode, tags: {} }
    fromResults = [{ data: [emptyTagsNode], error: null }]

    const result = await getContentForContext(['step-1'], ['swot'])
    expect(result).toEqual([])
  })
})

/* ============================================================
   getUserBookmarks
   ============================================================ */

describe('getUserBookmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns bookmarks for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [sampleBookmark], error: null }]

    const result = await getUserBookmarks()
    expect(result).toEqual([sampleBookmark])
  })

  it('returns empty array when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getUserBookmarks()
    expect(result).toEqual([])
  })

  it('returns empty array on db error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getUserBookmarks()
    expect(result).toEqual([])
  })

  it('returns empty array when no bookmarks exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], error: null }]

    const result = await getUserBookmarks()
    expect(result).toEqual([])
  })
})

/* ============================================================
   getUserBookmarksWithContent
   ============================================================ */

describe('getUserBookmarksWithContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns bookmarks with content details', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('content_bookmarks') -> bookmarks
      { data: [sampleBookmark], error: null },
      // from('content_nodes') -> nodes
      {
        data: [
          {
            id: 'node-1',
            title: 'Introduction to PIPS',
            pillar: 'methodology',
            slug: 'intro-to-pips',
            access_level: 'public',
          },
        ],
        error: null,
      },
    ]

    const result = await getUserBookmarksWithContent()
    expect(result).toEqual([
      {
        ...sampleBookmark,
        title: 'Introduction to PIPS',
        pillar: 'methodology',
        slug: 'intro-to-pips',
        access_level: 'public',
      },
    ])
  })

  it('returns empty array when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getUserBookmarksWithContent()
    expect(result).toEqual([])
  })

  it('returns empty array on bookmark query error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getUserBookmarksWithContent()
    expect(result).toEqual([])
  })

  it('returns empty array when no bookmarks exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], error: null }]

    const result = await getUserBookmarksWithContent()
    expect(result).toEqual([])
  })

  it('filters out bookmarks whose content node was not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: [sampleBookmark, { ...sampleBookmark, id: 'bm-2', content_node_id: 'node-deleted' }],
        error: null,
      },
      // Only node-1 exists, node-deleted does not
      {
        data: [
          {
            id: 'node-1',
            title: 'Introduction to PIPS',
            pillar: 'methodology',
            slug: 'intro-to-pips',
            access_level: 'public',
          },
        ],
        error: null,
      },
    ]

    const result = await getUserBookmarksWithContent()
    expect(result).toHaveLength(1)
    expect(result[0].content_node_id).toBe('node-1')
  })
})

/* ============================================================
   toggleBookmark
   ============================================================ */

describe('toggleBookmark', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('creates a bookmark when none exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('content_bookmarks').select().eq().eq().single() -> no existing
      { data: null, error: { code: 'PGRST116' } },
      // from('content_bookmarks').insert() -> success
      { data: null, error: null },
    ]

    const result = await toggleBookmark('node-1', 'My note')
    expect(result).toEqual({ bookmarked: true })
  })

  it('removes a bookmark when one already exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('content_bookmarks').select().eq().eq().single() -> existing found
      { data: { id: 'bm-1' }, error: null },
      // from('content_bookmarks').delete().eq() -> success
      { data: null, error: null },
    ]

    const result = await toggleBookmark('node-1')
    expect(result).toEqual({ bookmarked: false })
  })

  it('returns bookmarked false when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await toggleBookmark('node-1')
    expect(result).toEqual({ bookmarked: false })
  })
})

/* ============================================================
   recordReadHistory
   ============================================================ */

describe('recordReadHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('creates new read history entry when none exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('content_read_history').select().eq().eq().single() -> no existing
      { data: null, error: { code: 'PGRST116' } },
      // from('content_read_history').insert() -> success
      { data: null, error: null },
    ]

    const result = await recordReadHistory('node-1')
    expect(result).toBeUndefined()
  })

  it('updates existing read history entry', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('content_read_history').select().eq().eq().single() -> existing found
      { data: { id: 'rh-1', read_count: 3 }, error: null },
      // from('content_read_history').update().eq() -> success
      { data: null, error: null },
    ]

    const result = await recordReadHistory('node-1')
    expect(result).toBeUndefined()
  })

  it('returns early when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await recordReadHistory('node-1')
    expect(result).toBeUndefined()
    expect(fromCallIndex).toBe(0)
  })
})

/* ============================================================
   updateReadingSession
   ============================================================ */

describe('updateReadingSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('upserts reading session for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: null }]

    const result = await updateReadingSession('node-1', 'methodology', 250)
    expect(result).toBeUndefined()
  })

  it('returns early when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateReadingSession('node-1', 'methodology', 250)
    expect(result).toBeUndefined()
    expect(fromCallIndex).toBe(0)
  })
})

/* ============================================================
   getReadingSession
   ============================================================ */

describe('getReadingSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns reading session data for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: { content_node_id: 'node-1', scroll_position: 500 },
        error: null,
      },
    ]

    const result = await getReadingSession('methodology')
    expect(result).toEqual({ contentNodeId: 'node-1', scrollPosition: 500 })
  })

  it('returns null when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getReadingSession('methodology')
    expect(result).toBeNull()
  })

  it('returns null on db error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'Not found' } }]

    const result = await getReadingSession('methodology')
    expect(result).toBeNull()
  })

  it('returns null when no session exists for pillar', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { code: 'PGRST116' } }]

    const result = await getReadingSession('nonexistent')
    expect(result).toBeNull()
  })
})

/* ============================================================
   getAllReadingSessions
   ============================================================ */

describe('getAllReadingSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns reading sessions with content details', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('reading_sessions') -> sessions
      {
        data: [
          {
            pillar: 'methodology',
            content_node_id: 'node-1',
            scroll_position: 500,
            last_accessed_at: '2026-02-01T12:00:00Z',
          },
        ],
        error: null,
      },
      // from('content_nodes') -> nodes
      {
        data: [{ id: 'node-1', title: 'Introduction to PIPS', slug: 'intro-to-pips' }],
        error: null,
      },
    ]

    const result = await getAllReadingSessions()
    expect(result).toEqual([
      {
        pillar: 'methodology',
        contentNodeId: 'node-1',
        scrollPosition: 500,
        lastAccessedAt: '2026-02-01T12:00:00Z',
        title: 'Introduction to PIPS',
        slug: 'intro-to-pips',
      },
    ])
  })

  it('returns empty array when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getAllReadingSessions()
    expect(result).toEqual([])
  })

  it('returns empty array on sessions query error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getAllReadingSessions()
    expect(result).toEqual([])
  })

  it('returns empty array when no sessions exist', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], error: null }]

    const result = await getAllReadingSessions()
    expect(result).toEqual([])
  })

  it('filters out sessions whose content node was not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: [
          {
            pillar: 'methodology',
            content_node_id: 'node-1',
            scroll_position: 500,
            last_accessed_at: '2026-02-01T12:00:00Z',
          },
          {
            pillar: 'tools',
            content_node_id: 'node-deleted',
            scroll_position: 100,
            last_accessed_at: '2026-01-15T10:00:00Z',
          },
        ],
        error: null,
      },
      // Only node-1 found
      {
        data: [{ id: 'node-1', title: 'Introduction to PIPS', slug: 'intro-to-pips' }],
        error: null,
      },
    ]

    const result = await getAllReadingSessions()
    expect(result).toHaveLength(1)
    expect(result[0].pillar).toBe('methodology')
  })
})

/* ============================================================
   getContentByTool
   ============================================================ */

describe('getContentByTool', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns nodes that match the tool slug', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await getContentByTool('swot')
    expect(result).toEqual([sampleNode])
  })

  it('filters out nodes that do not match the tool slug', async () => {
    const noMatchNode = {
      ...sampleNode,
      id: 'node-no-match',
      tags: { tools: ['gantt'] },
    }
    fromResults = [{ data: [sampleNode, noMatchNode], error: null }]

    const result = await getContentByTool('swot')
    expect(result).toEqual([sampleNode])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getContentByTool('swot')
    expect(result).toEqual([])
  })

  it('handles nodes with no tools tag', async () => {
    const noToolsNode = { ...sampleNode, tags: {} }
    fromResults = [{ data: [noToolsNode], error: null }]

    const result = await getContentByTool('swot')
    expect(result).toEqual([])
  })
})

/* ============================================================
   getGuideContentForStep
   ============================================================ */

describe('getGuideContentForStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns nodes matching the step number tag', async () => {
    fromResults = [{ data: [sampleNode], error: null }]

    const result = await getGuideContentForStep(1)
    expect(result).toEqual([sampleNode])
  })

  it('filters out nodes that do not match the step', async () => {
    const noMatchNode = {
      ...sampleNode,
      id: 'node-step5',
      tags: { steps: ['step-5'] },
    }
    fromResults = [{ data: [sampleNode, noMatchNode], error: null }]

    const result = await getGuideContentForStep(1)
    expect(result).toEqual([sampleNode])
  })

  it('returns empty array on db error', async () => {
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getGuideContentForStep(1)
    expect(result).toEqual([])
  })

  it('handles nodes with no steps tag', async () => {
    const noStepsNode = { ...sampleNode, tags: {} }
    fromResults = [{ data: [noStepsNode], error: null }]

    const result = await getGuideContentForStep(1)
    expect(result).toEqual([])
  })
})

/* ============================================================
   getRecentReadHistory
   ============================================================ */

describe('getRecentReadHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns recent read history for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [sampleReadHistory], error: null }]

    const result = await getRecentReadHistory()
    expect(result).toEqual([sampleReadHistory])
  })

  it('returns empty array when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getRecentReadHistory()
    expect(result).toEqual([])
  })

  it('returns empty array on db error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getRecentReadHistory()
    expect(result).toEqual([])
  })

  it('returns empty array when no read history exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], error: null }]

    const result = await getRecentReadHistory()
    expect(result).toEqual([])
  })

  it('accepts a custom limit parameter', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [sampleReadHistory], error: null }]

    const result = await getRecentReadHistory(5)
    expect(result).toEqual([sampleReadHistory])
  })
})

/* ============================================================
   getRecentReadHistoryWithContent
   ============================================================ */

describe('getRecentReadHistoryWithContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns read history with content details', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('content_read_history') -> history
      { data: [sampleReadHistory], error: null },
      // from('content_nodes') -> nodes
      {
        data: [
          {
            id: 'node-1',
            title: 'Introduction to PIPS',
            pillar: 'methodology',
            slug: 'intro-to-pips',
          },
        ],
        error: null,
      },
    ]

    const result = await getRecentReadHistoryWithContent()
    expect(result).toEqual([
      {
        ...sampleReadHistory,
        title: 'Introduction to PIPS',
        pillar: 'methodology',
        slug: 'intro-to-pips',
      },
    ])
  })

  it('returns empty array when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getRecentReadHistoryWithContent()
    expect(result).toEqual([])
  })

  it('returns empty array on history query error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null, error: { message: 'DB error' } }]

    const result = await getRecentReadHistoryWithContent()
    expect(result).toEqual([])
  })

  it('returns empty array when no history exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: [], error: null }]

    const result = await getRecentReadHistoryWithContent()
    expect(result).toEqual([])
  })

  it('filters out history entries whose content node was not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      {
        data: [
          sampleReadHistory,
          { content_node_id: 'node-deleted', last_read_at: '2026-01-01T00:00:00Z', read_count: 1 },
        ],
        error: null,
      },
      // Only node-1 found
      {
        data: [
          {
            id: 'node-1',
            title: 'Introduction to PIPS',
            pillar: 'methodology',
            slug: 'intro-to-pips',
          },
        ],
        error: null,
      },
    ]

    const result = await getRecentReadHistoryWithContent()
    expect(result).toHaveLength(1)
    expect(result[0].content_node_id).toBe('node-1')
  })

  it('accepts a custom limit parameter', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      { data: [sampleReadHistory], error: null },
      {
        data: [
          {
            id: 'node-1',
            title: 'Introduction to PIPS',
            pillar: 'methodology',
            slug: 'intro-to-pips',
          },
        ],
        error: null,
      },
    ]

    const result = await getRecentReadHistoryWithContent(5)
    expect(result).toHaveLength(1)
  })
})
