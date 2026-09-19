import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockResponseCookieSet = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser: mockGetUser } }),
}))

vi.mock('next/server', () => ({
  NextResponse: {
    next: () => ({
      cookies: { set: mockResponseCookieSet, getAll: () => [] },
    }),
  },
}))

import { updateSession } from '../middleware'

/** An AuthApiError as supabase-js actually shapes it. */
const authError = () =>
  Object.assign(new Error('Invalid Refresh Token: Refresh Token Not Found'), {
    __isAuthError: true,
    status: 400,
    code: 'refresh_token_not_found',
  })

const makeRequest = (cookies: { name: string; value: string }[] = []) =>
  ({
    cookies: { getAll: () => cookies, set: vi.fn() },
  }) as never

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  it('returns the user when the session is valid', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

    const { user } = await updateSession(makeRequest())

    expect(user).toEqual({ id: 'user-1' })
    expect(mockResponseCookieSet).not.toHaveBeenCalled()
  })

  it('treats a rejected refresh as signed out instead of throwing', async () => {
    mockGetUser.mockRejectedValue(authError())

    const { user } = await updateSession(makeRequest())

    expect(user).toBeNull()
  })

  it('treats an AuthApiError returned in the error field as signed out', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: authError() })

    const { user } = await updateSession(makeRequest())

    expect(user).toBeNull()
  })

  it('expires the stale Supabase auth cookies so the browser stops replaying them', async () => {
    mockGetUser.mockRejectedValue(authError())

    await updateSession(
      makeRequest([
        { name: 'sb-abcdef-auth-token', value: 'stale' },
        { name: 'sb-abcdef-auth-token.1', value: 'stale-chunk' },
        { name: 'unrelated-cookie', value: 'keep-me' },
      ]),
    )

    expect(mockResponseCookieSet).toHaveBeenCalledTimes(2)
    expect(mockResponseCookieSet).toHaveBeenCalledWith('sb-abcdef-auth-token', '', {
      maxAge: 0,
      path: '/',
    })
    expect(mockResponseCookieSet).toHaveBeenCalledWith('sb-abcdef-auth-token.1', '', {
      maxAge: 0,
      path: '/',
    })
    expect(mockResponseCookieSet).not.toHaveBeenCalledWith(
      'unrelated-cookie',
      expect.anything(),
      expect.anything(),
    )
  })

  it('rethrows errors that are not auth errors', async () => {
    mockGetUser.mockRejectedValue(new Error('network down'))

    await expect(updateSession(makeRequest())).rejects.toThrow('network down')
  })
})
