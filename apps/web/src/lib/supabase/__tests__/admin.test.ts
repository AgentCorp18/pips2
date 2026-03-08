import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreateClient = vi.fn().mockReturnValue({
  auth: { autoRefreshToken: false, persistSession: false },
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

describe('createAdminClient', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    mockCreateClient.mockClear()
  })

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
    const { createAdminClient } = await import('../admin')
    expect(() => createAdminClient()).toThrow('Missing')
  })

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')
    const { createAdminClient } = await import('../admin')
    expect(() => createAdminClient()).toThrow('Missing')
  })

  it('creates a client when both env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
    const { createAdminClient } = await import('../admin')
    const client = createAdminClient()
    expect(client).toBeDefined()
  })

  it('trims whitespace from env vars', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '  https://test.supabase.co  \n')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '  test-service-key  \n')
    const { createAdminClient } = await import('../admin')
    createAdminClient()
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-key',
      expect.any(Object),
    )
  })
})
