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

const { mockGetCurrentOrg } = vi.hoisted(() => ({
  mockGetCurrentOrg: vi.fn(),
}))

vi.mock('@/lib/get-current-org', () => ({
  getCurrentOrg: (...args: unknown[]) => mockGetCurrentOrg(...args),
  ORG_COOKIE_NAME: 'pips-org-id',
}))

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

/* ============================================================
   Import after mocks
   ============================================================ */

import {
  getChannels,
  getChannel,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  createChannel,
  archiveChannel,
  markChannelRead,
  addMembers,
  getOrgMembers,
} from '../actions'

/* ============================================================
   getChannels
   ============================================================ */

describe('getChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getChannels()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when membership fetch fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channel_members
      { data: null, error: { message: 'DB error' } },
    ]

    const result = await getChannels()
    expect(result).toEqual({ error: 'Failed to load channels' })
  })

  it('returns empty array when user has no channel memberships', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channel_members — empty
      { data: [] },
    ]

    const result = await getChannels()
    expect(result).toEqual({ data: [] })
  })

  it('returns error when channel fetch fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channel_members
      { data: [{ channel_id: 'ch-1', last_read_at: null }] },
      // chat_channels
      { data: null, error: { message: 'DB error' } },
    ]

    const result = await getChannels()
    expect(result).toEqual({ error: 'Failed to load channels' })
  })

  it('returns channels with unread count 0 when no last_read_at', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const channel = {
      id: 'ch-1',
      org_id: 'org-1',
      type: 'org',
      name: 'General',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channel_members — no last_read_at
      { data: [{ channel_id: 'ch-1', last_read_at: null }] },
      // chat_channels
      { data: [channel], error: null },
      // No unread count query since last_read_at is null
    ]

    const result = await getChannels()
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0]).toMatchObject({ id: 'ch-1', unread_count: 0 })
  })

  it('returns channels with unread count when last_read_at is set', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const channel = {
      id: 'ch-1',
      org_id: 'org-1',
      type: 'org',
      name: 'General',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channel_members — with last_read_at
      { data: [{ channel_id: 'ch-1', last_read_at: '2026-01-01T10:00:00Z' }] },
      // chat_channels
      { data: [channel], error: null },
      // chat_messages count (unread)
      { count: 3, error: null },
    ]

    const result = await getChannels()
    expect(result.data?.[0]).toMatchObject({ id: 'ch-1', unread_count: 3 })
  })
})

/* ============================================================
   getChannel
   ============================================================ */

describe('getChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getChannel('ch-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when channel is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channels — not found
      { data: null, error: { message: 'not found' } },
    ]

    const result = await getChannel('invalid-ch')
    expect(result).toEqual({ error: 'Channel not found' })
  })

  it('returns channel details with empty member list when no members', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const channel = {
      id: 'ch-1',
      org_id: 'org-1',
      type: 'custom',
      name: 'Dev',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels
      { data: channel, error: null },
      // chat_channel_members
      { data: [], error: null },
    ]

    const result = await getChannel('ch-1')
    expect(result.data?.channel.id).toBe('ch-1')
    expect(result.data?.members).toEqual([])
  })

  it('returns channel with member profiles', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const channel = {
      id: 'ch-1',
      org_id: 'org-1',
      type: 'custom',
      name: 'Dev',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels
      { data: channel, error: null },
      // chat_channel_members
      { data: [{ user_id: 'user-2', joined_at: '2026-01-02', muted: false }], error: null },
      // profiles for user-2
      { data: { display_name: 'Alice', avatar_url: null }, error: null },
    ]

    const result = await getChannel('ch-1')
    expect(result.data?.members).toHaveLength(1)
    expect(result.data?.members[0]).toMatchObject({
      user_id: 'user-2',
      display_name: 'Alice',
      avatar_url: null,
      muted: false,
    })
  })

  it('uses Unknown display name when profile is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const channel = {
      id: 'ch-1',
      org_id: 'org-1',
      type: 'custom',
      name: 'Dev',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels
      { data: channel, error: null },
      // chat_channel_members
      { data: [{ user_id: 'user-99', joined_at: '2026-01-02', muted: false }], error: null },
      // profiles — not found
      { data: null, error: { message: 'not found' } },
    ]

    const result = await getChannel('ch-1')
    expect(result.data?.members[0]?.display_name).toBe('Unknown')
  })
})

/* ============================================================
   getMessages
   ============================================================ */

describe('getMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getMessages('ch-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when message fetch fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages
      { data: null, error: { message: 'DB error' } },
    ]

    const result = await getMessages('ch-1')
    expect(result).toEqual({ error: 'Failed to load messages' })
  })

  it('returns empty messages list', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages
      { data: [], error: null },
      // profiles
      { data: [], error: null },
    ]

    const result = await getMessages('ch-1')
    expect(result.data?.messages).toEqual([])
    expect(result.data?.hasMore).toBe(false)
  })

  it('returns messages with author profiles', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const messages = [
      {
        id: 'msg-1',
        channel_id: 'ch-1',
        org_id: 'org-1',
        author_id: 'user-2',
        body: 'Hello',
        mentions: [],
        edited_at: null,
        deleted_at: null,
        created_at: '2026-01-01T10:00:00Z',
      },
    ]
    fromResults = [
      // chat_messages
      { data: messages, error: null },
      // profiles
      { data: [{ id: 'user-2', display_name: 'Alice', avatar_url: null }], error: null },
    ]

    const result = await getMessages('ch-1')
    expect(result.data?.messages).toHaveLength(1)
    expect(result.data?.messages[0]).toMatchObject({
      id: 'msg-1',
      body: 'Hello',
      author: { display_name: 'Alice', avatar_url: null },
    })
  })

  it('signals hasMore when more than limit messages returned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    // limit default is 50, so return 51 items to trigger hasMore
    const messages = Array.from({ length: 51 }, (_, i) => ({
      id: `msg-${i}`,
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: `Message ${i}`,
      mentions: null,
      edited_at: null,
      deleted_at: null,
      created_at: `2026-01-01T${String(i).padStart(2, '0')}:00:00Z`,
    }))
    fromResults = [
      // chat_messages
      { data: messages, error: null },
      // profiles
      { data: [{ id: 'user-1', display_name: 'User', avatar_url: null }], error: null },
    ]

    const result = await getMessages('ch-1')
    expect(result.data?.hasMore).toBe(true)
    expect(result.data?.messages).toHaveLength(50)
  })

  it('fills in Unknown for missing author profile', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const messages = [
      {
        id: 'msg-1',
        channel_id: 'ch-1',
        org_id: 'org-1',
        author_id: 'ghost-user',
        body: 'Hi',
        mentions: null,
        edited_at: null,
        deleted_at: null,
        created_at: '2026-01-01T10:00:00Z',
      },
    ]
    fromResults = [
      // chat_messages
      { data: messages, error: null },
      // profiles — empty (no profile for ghost-user)
      { data: [], error: null },
    ]

    const result = await getMessages('ch-1')
    expect(result.data?.messages[0]?.author?.display_name).toBe('Unknown')
  })
})

/* ============================================================
   sendMessage
   ============================================================ */

describe('sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await sendMessage('ch-1', 'Hello')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockGetCurrentOrg.mockResolvedValue(null)
    fromResults = []

    const result = await sendMessage('ch-1', 'Hello')
    expect(result).toEqual({ error: 'No organization context' })
  })

  it('returns error when message body is empty', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    const result = await sendMessage('ch-1', '   ')
    expect(result).toEqual({ error: 'Message cannot be empty' })
  })

  it('returns error when insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages insert
      { data: null, error: { message: 'DB error' } },
    ]

    const result = await sendMessage('ch-1', 'Hello')
    expect(result).toEqual({ error: 'Failed to send message' })
  })

  it('sends message successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const newMessage = {
      id: 'msg-new',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Hello world',
      mentions: [],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-01T12:00:00Z',
    }
    fromResults = [
      // chat_messages insert
      { data: newMessage, error: null },
    ]

    const result = await sendMessage('ch-1', 'Hello world')
    expect(result.data).toMatchObject({ id: 'msg-new', body: 'Hello world' })
  })

  it('extracts @mentions from message body', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const newMessage = {
      id: 'msg-mention',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Hey @[a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d] check this out',
      mentions: ['a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-01T12:00:00Z',
    }
    fromResults = [
      // chat_messages insert
      { data: newMessage, error: null },
    ]

    const result = await sendMessage(
      'ch-1',
      'Hey @[a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d] check this out',
    )
    expect(result.data?.mentions).toEqual(['a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'])
  })

  it('trims whitespace from message body', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const newMessage = {
      id: 'msg-trimmed',
      channel_id: 'ch-1',
      org_id: 'org-1',
      author_id: 'user-1',
      body: 'Trimmed message',
      mentions: [],
      edited_at: null,
      deleted_at: null,
      created_at: '2026-01-01T12:00:00Z',
    }
    fromResults = [
      // chat_messages insert
      { data: newMessage, error: null },
    ]

    const result = await sendMessage('ch-1', '  Trimmed message  ')
    expect(result.error).toBeUndefined()
  })
})

/* ============================================================
   editMessage
   ============================================================ */

describe('editMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await editMessage('msg-1', 'Updated body')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when update fails (e.g., not the author)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages update
      { error: { message: 'RLS violation' } },
    ]

    const result = await editMessage('msg-1', 'Updated body')
    expect(result).toEqual({ error: 'Failed to edit message' })
  })

  it('edits message successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages update
      { error: null },
    ]

    const result = await editMessage('msg-1', 'Updated body')
    expect(result).toEqual({})
  })
})

/* ============================================================
   deleteMessage
   ============================================================ */

describe('deleteMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await deleteMessage('msg-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when soft delete fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages update
      { error: { message: 'RLS violation' } },
    ]

    const result = await deleteMessage('msg-1')
    expect(result).toEqual({ error: 'Failed to delete message' })
  })

  it('soft deletes message successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_messages update (sets deleted_at)
      { error: null },
    ]

    const result = await deleteMessage('msg-1')
    expect(result).toEqual({})
  })
})

/* ============================================================
   createChannel
   ============================================================ */

describe('createChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await createChannel('custom', 'My Channel')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockGetCurrentOrg.mockResolvedValue(null)
    fromResults = []

    const result = await createChannel('custom', 'My Channel')
    expect(result).toEqual({ error: 'No organization context' })
  })

  it('returns error when channel insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channels insert
      { data: null, error: { message: 'DB error' } },
    ]

    const result = await createChannel('custom', 'My Channel')
    expect(result).toEqual({ error: 'Failed to create channel' })
  })

  it('creates a custom channel and adds creator as member', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const newChannel = {
      id: 'ch-new',
      org_id: 'org-1',
      type: 'custom',
      name: 'My Channel',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels insert
      { data: newChannel, error: null },
      // chat_channel_members insert for creator
      { data: null, error: null },
    ]

    const result = await createChannel('custom', 'My Channel')
    expect(result.data).toMatchObject({ id: 'ch-new', name: 'My Channel', type: 'custom' })
  })

  it('creates channel with additional members', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const newChannel = {
      id: 'ch-new',
      org_id: 'org-1',
      type: 'team',
      name: 'Dev Team',
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels insert
      { data: newChannel, error: null },
      // chat_channel_members insert for user-1
      { data: null, error: null },
      // chat_channel_members insert for user-2
      { data: null, error: null },
    ]

    const result = await createChannel('team', 'Dev Team', ['user-2'])
    expect(result.data?.id).toBe('ch-new')
  })

  it('returns existing DM channel when one already exists between the two users', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const existingDm = {
      id: 'dm-existing',
      org_id: 'org-1',
      type: 'direct',
      name: null,
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels select (existing DMs)
      { data: [existingDm], error: null },
      // chat_channel_members for existingDm
      { data: [{ user_id: 'user-1' }, { user_id: 'user-2' }], error: null },
    ]

    const result = await createChannel('direct', undefined, ['user-2'])
    expect(result.data?.id).toBe('dm-existing')
  })

  it('creates new DM channel when no existing DM between users', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const newDm = {
      id: 'dm-new',
      org_id: 'org-1',
      type: 'direct',
      name: null,
      entity_id: null,
      created_by: 'user-1',
      archived_at: null,
      created_at: '2026-01-01',
    }
    fromResults = [
      // chat_channels select (no existing DMs)
      { data: [], error: null },
      // chat_channels insert
      { data: newDm, error: null },
      // chat_channel_members insert for user-1
      { data: null, error: null },
      // chat_channel_members insert for user-2
      { data: null, error: null },
    ]

    const result = await createChannel('direct', undefined, ['user-2'])
    expect(result.data?.id).toBe('dm-new')
  })
})

/* ============================================================
   archiveChannel
   ============================================================ */

describe('archiveChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await archiveChannel('ch-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when archive update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channels update
      { error: { message: 'RLS violation' } },
    ]

    const result = await archiveChannel('ch-1')
    expect(result).toEqual({ error: 'Failed to archive channel' })
  })

  it('archives channel successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channels update
      { error: null },
    ]

    const result = await archiveChannel('ch-1')
    expect(result).toEqual({})
  })
})

/* ============================================================
   markChannelRead
   ============================================================ */

describe('markChannelRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await markChannelRead('ch-1')
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channel_members update
      { error: { message: 'DB error' } },
    ]

    const result = await markChannelRead('ch-1')
    expect(result).toEqual({ error: 'Failed to mark channel as read' })
  })

  it('updates last_read_at successfully', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channel_members update
      { error: null },
    ]

    const result = await markChannelRead('ch-1')
    expect(result).toEqual({})
  })
})

/* ============================================================
   addMembers
   ============================================================ */

describe('addMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await addMembers('ch-1', ['user-2'])
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('adds members successfully and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // chat_channel_members upsert for user-2
      { data: null, error: null },
      // chat_channel_members upsert for user-3
      { data: null, error: null },
    ]

    const result = await addMembers('ch-1', ['user-2', 'user-3'])
    expect(result).toEqual({})
  })

  it('adds zero members and returns success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = []

    const result = await addMembers('ch-1', [])
    expect(result).toEqual({})
  })
})

/* ============================================================
   getOrgMembers
   ============================================================ */

describe('getOrgMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockGetCurrentOrg.mockResolvedValue({ orgId: 'org-1', orgName: 'Test Org', role: 'owner' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getOrgMembers()
    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when user has no organization', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockGetCurrentOrg.mockResolvedValue(null)
    fromResults = []

    const result = await getOrgMembers()
    expect(result).toEqual({ error: 'No organization context' })
  })

  it('returns empty array when org has no members', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // org_members for getOrgMembers
      { data: null, error: null },
    ]

    const result = await getOrgMembers()
    expect(result).toEqual({ data: [] })
  })

  it('returns member profiles for org members', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // org_members for getOrgMembers
      { data: [{ user_id: 'user-2' }, { user_id: 'user-3' }], error: null },
      // profiles for user-2
      { data: { display_name: 'Alice', avatar_url: 'https://example.com/alice.png' }, error: null },
      // profiles for user-3
      { data: { display_name: 'Bob', avatar_url: null }, error: null },
    ]

    const result = await getOrgMembers()
    expect(result.data).toHaveLength(2)
    expect(result.data?.[0]).toMatchObject({
      user_id: 'user-2',
      display_name: 'Alice',
      avatar_url: 'https://example.com/alice.png',
    })
    expect(result.data?.[1]).toMatchObject({
      user_id: 'user-3',
      display_name: 'Bob',
      avatar_url: null,
    })
  })

  it('uses Unknown display name for members with missing profiles', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // org_members for getOrgMembers
      { data: [{ user_id: 'ghost-user' }], error: null },
      // profiles — not found
      { data: null, error: { message: 'not found' } },
    ]

    const result = await getOrgMembers()
    expect(result.data?.[0]?.display_name).toBe('Unknown')
    expect(result.data?.[0]?.avatar_url).toBeNull()
  })
})
