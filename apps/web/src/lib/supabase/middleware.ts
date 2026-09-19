import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Supabase auth errors carry a __isAuthError marker. We duck-type it rather
 * than importing AuthError so this stays free of a direct supabase-js import.
 */
const isAuthError = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && '__isAuthError' in error

/**
 * Expire the Supabase auth cookies on the response. Without this the browser
 * keeps replaying a refresh token the server has already rejected, so every
 * subsequent request repeats the same failed refresh.
 */
const clearAuthCookies = (request: NextRequest, response: NextResponse) => {
  request.cookies
    .getAll()
    .filter(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'))
    .forEach(({ name }) => response.cookies.set(name, '', { maxAge: 0, path: '/' }))
}

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh the session — IMPORTANT: do not remove this call.
  // getUser() contacts the Supabase Auth server to validate the
  // token and will trigger a token refresh if needed, writing
  // the updated cookies via setAll above.
  //
  // An expired, rotated or cleared refresh token is a routine condition, not
  // an exceptional one. getUser() surfaces it as an AuthApiError
  // (refresh_token_not_found). Middleware runs on effectively every request,
  // so letting that escape fails the whole request rather than the one call
  // that failed. Treat an unusable session as signed out — the caller already
  // handles a null user by redirecting to /login.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null

  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    user = data.user
  } catch (error) {
    if (!isAuthError(error)) throw error
    user = null
    clearAuthCookies(request, supabaseResponse)
  }

  return { supabaseResponse, user, supabase }
}
