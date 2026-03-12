import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Routes that require authentication AND an org membership.
 * Unauthenticated visitors are redirected to /login.
 * Authenticated visitors without an org are redirected to /onboarding.
 */
const PROTECTED_PATHS = [
  '/dashboard',
  '/projects',
  '/tickets',
  '/teams',
  '/settings',
  '/notifications',
  '/my-work',
  '/search',
  '/profile',
  '/knowledge',
  '/training',
  '/reports',
  '/export',
  '/tools',
]

/**
 * Routes reserved for unauthenticated users. Authenticated visitors
 * hitting these paths are redirected to /dashboard.
 */
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

const isAuthPath = (pathname: string) =>
  AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

const isOnboardingPath = (pathname: string) =>
  pathname === '/onboarding' || pathname.startsWith('/onboarding/')

export const middleware = async (request: NextRequest) => {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Never redirect POST/PATCH/DELETE requests — server actions handle their own auth.
  // Redirecting a POST would drop the request body and break form submissions.
  if (request.method !== 'GET') {
    return supabaseResponse
  }

  // Redirect unauthenticated users away from protected routes and onboarding
  if (!user && (isProtectedPath(pathname) || isOnboardingPath(pathname))) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPath(pathname)) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // For authenticated users on protected or onboarding paths, check org membership
  if (user && (isProtectedPath(pathname) || isOnboardingPath(pathname))) {
    const { data: membership } = await supabase
      .from('org_members')
      .select('id')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const hasOrg = !!membership

    // User has no org and is NOT on onboarding — redirect to onboarding
    if (!hasOrg && !isOnboardingPath(pathname)) {
      const onboardingUrl = request.nextUrl.clone()
      onboardingUrl.pathname = '/onboarding'
      return NextResponse.redirect(onboardingUrl)
    }

    // User has an org and IS on onboarding — redirect to dashboard
    if (hasOrg && isOnboardingPath(pathname)) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets in /images, /fonts, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/|fonts/).*)',
  ],
}
