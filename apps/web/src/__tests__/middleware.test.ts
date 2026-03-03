import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

/* ============================================================
   Mocks
   ============================================================ */

// Track the mock supabase client and user for each test
let mockUser: { id: string } | null = null
let mockMembership: { id: string } | null = null

const mockMaybeSingle = vi.fn().mockImplementation(() => ({
  data: mockMembership,
}))

const mockLimit = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
const mockEq = vi.fn().mockReturnValue({ limit: mockLimit })
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

const mockGetUser = vi.fn().mockImplementation(() => ({
  data: { user: mockUser },
}))

const mockSupabase = {
  from: mockFrom,
  auth: { getUser: mockGetUser },
}

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn().mockImplementation(async () => ({
    supabaseResponse: NextResponse.next(),
    user: mockUser,
    supabase: mockSupabase,
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { middleware, config } from '../middleware'

/* ============================================================
   Helpers
   ============================================================ */

const createRequest = (pathname: string): NextRequest => {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`))
}

/* ============================================================
   Tests
   ============================================================ */

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = null
    mockMembership = null
  })

  /* --------------------------------------------------------
     Public routes (unauthenticated)
     -------------------------------------------------------- */

  describe('public routes', () => {
    it('allows unauthenticated access to root', async () => {
      const response = await middleware(createRequest('/'))
      expect(response.status).toBe(200)
    })

    it('allows unauthenticated access to marketing pages', async () => {
      const response = await middleware(createRequest('/pricing'))
      expect(response.status).toBe(200)
    })

    it('allows unauthenticated access to /about', async () => {
      const response = await middleware(createRequest('/about'))
      expect(response.status).toBe(200)
    })
  })

  /* --------------------------------------------------------
     Auth redirects for unauthenticated users
     -------------------------------------------------------- */

  describe('unauthenticated access to protected routes', () => {
    const protectedPaths = [
      '/dashboard',
      '/projects',
      '/projects/123',
      '/tickets',
      '/tickets/abc',
      '/teams',
      '/settings',
      '/notifications',
      '/my-work',
      '/search',
      '/profile',
    ]

    for (const path of protectedPaths) {
      it(`redirects ${path} to /login`, async () => {
        const response = await middleware(createRequest(path))
        expect(response.status).toBe(307)
        const location = new URL(response.headers.get('location')!)
        expect(location.pathname).toBe('/login')
      })
    }

    it('includes the original path as a "next" search param', async () => {
      const response = await middleware(createRequest('/dashboard'))
      const location = new URL(response.headers.get('location')!)
      expect(location.searchParams.get('next')).toBe('/dashboard')
    })

    it('redirects /onboarding to /login for unauthenticated users', async () => {
      const response = await middleware(createRequest('/onboarding'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/login')
    })

    it('redirects /onboarding/step-1 to /login for unauthenticated users', async () => {
      const response = await middleware(createRequest('/onboarding/step-1'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/login')
    })
  })

  /* --------------------------------------------------------
     Authenticated users on auth pages
     -------------------------------------------------------- */

  describe('authenticated users on auth pages', () => {
    beforeEach(() => {
      mockUser = { id: 'user-1' }
    })

    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password']

    for (const path of authPaths) {
      it(`redirects ${path} to /dashboard`, async () => {
        const response = await middleware(createRequest(path))
        expect(response.status).toBe(307)
        const location = new URL(response.headers.get('location')!)
        expect(location.pathname).toBe('/dashboard')
      })
    }

    it('redirects /login/some-sub to /dashboard', async () => {
      const response = await middleware(createRequest('/login/some-sub'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/dashboard')
    })
  })

  /* --------------------------------------------------------
     Authenticated users with org membership
     -------------------------------------------------------- */

  describe('authenticated users with org membership', () => {
    beforeEach(() => {
      mockUser = { id: 'user-1' }
      mockMembership = { id: 'member-1' }
    })

    it('allows access to /dashboard', async () => {
      const response = await middleware(createRequest('/dashboard'))
      expect(response.status).toBe(200)
    })

    it('allows access to /projects', async () => {
      const response = await middleware(createRequest('/projects'))
      expect(response.status).toBe(200)
    })

    it('allows access to /tickets/abc', async () => {
      const response = await middleware(createRequest('/tickets/abc'))
      expect(response.status).toBe(200)
    })

    it('redirects /onboarding to /dashboard when user already has org', async () => {
      const response = await middleware(createRequest('/onboarding'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/dashboard')
    })

    it('redirects /onboarding/step-2 to /dashboard when user already has org', async () => {
      const response = await middleware(createRequest('/onboarding/step-2'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/dashboard')
    })
  })

  /* --------------------------------------------------------
     Authenticated users without org membership
     -------------------------------------------------------- */

  describe('authenticated users without org membership', () => {
    beforeEach(() => {
      mockUser = { id: 'user-1' }
      mockMembership = null
    })

    it('redirects /dashboard to /onboarding', async () => {
      const response = await middleware(createRequest('/dashboard'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/onboarding')
    })

    it('redirects /projects to /onboarding', async () => {
      const response = await middleware(createRequest('/projects'))
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get('location')!)
      expect(location.pathname).toBe('/onboarding')
    })

    it('allows access to /onboarding', async () => {
      const response = await middleware(createRequest('/onboarding'))
      expect(response.status).toBe(200)
    })

    it('allows access to /onboarding/step-1', async () => {
      const response = await middleware(createRequest('/onboarding/step-1'))
      expect(response.status).toBe(200)
    })
  })

  /* --------------------------------------------------------
     Session refresh
     -------------------------------------------------------- */

  describe('session handling', () => {
    it('calls updateSession on every request', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware')
      await middleware(createRequest('/'))
      expect(updateSession).toHaveBeenCalledOnce()
    })
  })

  /* --------------------------------------------------------
     Matcher config
     -------------------------------------------------------- */

  describe('config.matcher', () => {
    it('exports a matcher array', () => {
      expect(Array.isArray(config.matcher)).toBe(true)
      expect(config.matcher.length).toBeGreaterThan(0)
    })

    it('excludes static files pattern', () => {
      const pattern = config.matcher[0]
      expect(pattern).toContain('_next/static')
      expect(pattern).toContain('_next/image')
      expect(pattern).toContain('favicon.ico')
    })
  })
})
