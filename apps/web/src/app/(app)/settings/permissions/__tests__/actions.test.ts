import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockSelect = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockDelete = vi.fn().mockReturnThis()
const mockUpsert = vi.fn().mockResolvedValue({ error: null })
const mockSingle = vi.fn().mockResolvedValue({ data: null })
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null })

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  eq: mockEq,
  delete: mockDelete,
  upsert: mockUpsert,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
      }),
    },
  }),
}))

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('owner'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('permissions actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPermissionOverrides', () => {
    it('is a function', async () => {
      const { getPermissionOverrides } = await import('../actions')
      expect(typeof getPermissionOverrides).toBe('function')
    })
  })

  describe('togglePermissionOverride', () => {
    it('is a function', async () => {
      const { togglePermissionOverride } = await import('../actions')
      expect(typeof togglePermissionOverride).toBe('function')
    })

    it('rejects invalid permissions', async () => {
      const { togglePermissionOverride } = await import('../actions')
      const result = await togglePermissionOverride('org-1', 'admin', 'fake.permission', true)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid permission')
    })

    it('rejects modifying owner permissions', async () => {
      const { togglePermissionOverride } = await import('../actions')
      const result = await togglePermissionOverride('org-1', 'owner', 'org.delete', false)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot modify owner permissions')
    })
  })

  describe('resetPermissionOverrides', () => {
    it('is a function', async () => {
      const { resetPermissionOverrides } = await import('../actions')
      expect(typeof resetPermissionOverrides).toBe('function')
    })
  })
})
