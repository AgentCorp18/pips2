import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Routes that require authentication. Unauthenticated visitors
 * hitting these paths are redirected to /login.
 */
const PROTECTED_PATHS = ['/dashboard', '/projects', '/tickets', '/teams', '/settings']

/**
 * Routes reserved for unauthenticated users. Authenticated visitors
 * hitting these paths are redirected to /dashboard.
 */
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

const isAuthPath = (pathname: string) =>
  AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

export const middleware = async (request: NextRequest) => {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  if (!user && isProtectedPath(pathname)) {
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
