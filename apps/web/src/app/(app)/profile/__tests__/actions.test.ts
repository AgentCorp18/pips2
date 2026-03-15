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
const mockStorageRemove = vi.fn()

const mockSupabase = {
  auth: { getUser: () => mockGetUser() },
  from: () => {
    const idx = fromCallIndex++
    return createChainForIndex(idx)
  },
  storage: {
    from: () => ({
      remove: mockStorageRemove,
    }),
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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { getProfile, updateProfile, updateAvatarUrl, removeAvatar } from '../actions'
import { revalidatePath } from 'next/cache'

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

const emptyState = {}

/* ============================================================
   getProfile
   ============================================================ */

describe('getProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns null when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await getProfile()
    expect(result).toBeNull()
  })

  it('returns profile when user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const profileData = {
      id: 'user-1',
      email: 'user@example.com',
      full_name: 'Test User',
      display_name: 'TestUser',
      avatar_url: null,
    }
    fromResults = [{ data: profileData }]

    const result = await getProfile()
    expect(result).toEqual(profileData)
  })

  it('returns null when profile is not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: null }]

    const result = await getProfile()
    expect(result).toBeNull()
  })
})

/* ============================================================
   updateProfile
   ============================================================ */

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns error when display_name is not a string', async () => {
    const fd = new FormData()
    // do not set display_name at all
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'Display name is required' })
  })

  it('returns error when display_name is whitespace only', async () => {
    const fd = makeFormData({ display_name: '   ' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'Display name cannot be empty or whitespace only' })
  })

  it('returns error when display_name is an empty string', async () => {
    const fd = makeFormData({ display_name: '' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'Display name cannot be empty or whitespace only' })
  })

  it('returns error when display_name is a single character', async () => {
    const fd = makeFormData({ display_name: 'A' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'Display name must be at least 2 characters' })
  })

  it('accepts display_name with exactly 2 characters', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]
    const fd = makeFormData({ display_name: 'Jo' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ success: 'Profile updated successfully' })
  })

  it('returns error when display_name is too long', async () => {
    const fd = makeFormData({ display_name: 'x'.repeat(101) })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'Display name must be 100 characters or fewer' })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const fd = makeFormData({ display_name: 'Test User' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'You must be signed in to update your profile' })
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB error' } }]

    const fd = makeFormData({ display_name: 'New Name' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to update profile' })
  })

  it('returns success when profile is updated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]

    const fd = makeFormData({ display_name: 'New Name' })
    const result = await updateProfile(emptyState, fd)
    expect(result).toEqual({ success: 'Profile updated successfully' })
    expect(revalidatePath).toHaveBeenCalledWith('/profile')
  })
})

/* ============================================================
   updateAvatarUrl
   ============================================================ */

describe('updateAvatarUrl', () => {
  const SUPABASE_URL = 'https://test-project.supabase.co'
  const validAvatarUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/user-1/photo.png`

  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL)
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await updateAvatarUrl(validAvatarUrl)
    expect(result).toEqual({ error: 'You must be signed in to update your avatar' })
  })

  it('returns error when update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: { message: 'DB error' } }]

    const result = await updateAvatarUrl(validAvatarUrl)
    expect(result).toEqual({ error: 'Failed to update avatar' })
  })

  it('returns success when avatar is updated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ error: null }]

    const result = await updateAvatarUrl(validAvatarUrl)
    expect(result).toEqual({ success: 'Avatar updated successfully' })
    expect(revalidatePath).toHaveBeenCalledWith('/profile')
  })
})

/* ============================================================
   removeAvatar
   ============================================================ */

describe('removeAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
    mockStorageRemove.mockResolvedValue({ error: null })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await removeAvatar()
    expect(result).toEqual({ error: 'You must be signed in to remove your avatar' })
  })

  it('returns success when avatar is removed (with storage cleanup)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('profiles').select('avatar_url').eq().single() -> has avatar
      {
        data: {
          avatar_url:
            'https://example.supabase.co/storage/v1/object/public/avatars/user-1/photo.png',
        },
      },
      // from('profiles').update().eq() -> success
      { error: null },
    ]

    const result = await removeAvatar()
    expect(result).toEqual({ success: 'Avatar removed successfully' })
    expect(mockStorageRemove).toHaveBeenCalledWith(['user-1/photo.png'])
    expect(revalidatePath).toHaveBeenCalledWith('/profile')
  })

  it('returns success when no previous avatar exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [
      // from('profiles').select('avatar_url').eq().single() -> null avatar
      { data: { avatar_url: null } },
      // from('profiles').update().eq() -> success
      { error: null },
    ]

    const result = await removeAvatar()
    expect(result).toEqual({ success: 'Avatar removed successfully' })
    expect(mockStorageRemove).not.toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith('/profile')
  })

  it('returns error when profile update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    fromResults = [{ data: { avatar_url: null } }, { error: { message: 'DB error' } }]

    const result = await removeAvatar()
    expect(result).toEqual({ error: 'Failed to remove avatar' })
  })
})
