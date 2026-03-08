import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreateBrowserClient = vi.fn().mockReturnValue({ auth: {} })

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
}))

describe('createClient (browser)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    mockCreateBrowserClient.mockClear()
  })

  it('creates a browser client', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    const { createClient } = await import('../client')
    const client = createClient()
    expect(client).toBeDefined()
  })

  it('calls createBrowserClient with trimmed env vars', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '  https://test.supabase.co  ')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '  test-anon-key  ')
    const { createClient } = await import('../client')
    createClient()
    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
    )
  })
})
