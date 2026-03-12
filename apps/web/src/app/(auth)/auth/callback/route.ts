import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Only allow internal redirects — parse to catch encoded slashes and protocol-relative URLs
  let next = '/dashboard'
  try {
    const resolved = new URL(rawNext, origin)
    if (resolved.origin === origin) {
      next = resolved.pathname + resolved.search
    }
  } catch {
    // Invalid URL — fall back to dashboard
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
