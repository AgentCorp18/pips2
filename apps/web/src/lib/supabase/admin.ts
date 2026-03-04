import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only in server-side code for
 * operations that require elevated privileges (e.g.,
 * invitation acceptance where the user is not yet a member).
 */
export const createAdminClient = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!rawUrl || !rawKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
    )
  }

  // Strip any trailing whitespace/newlines (Vercel CLI can inject \n into env values)
  const url = rawUrl.trim()
  const key = rawKey.trim()

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
