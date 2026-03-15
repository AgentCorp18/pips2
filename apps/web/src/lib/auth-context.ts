import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'

export type AuthContext = {
  supabase: SupabaseClient
  user: User | null
  orgId: string | null
}

/**
 * Resolves the current user and active org in a single call.
 *
 * This is the canonical auth bootstrap for server actions that need
 * both the authenticated user and their active org ID.
 *
 * Returns { supabase, user: null, orgId: null } when the user is not authenticated.
 * Returns { supabase, user, orgId: null } when the user has no org membership.
 */
export const getAuthContext = async (): Promise<AuthContext> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, orgId: null }

  const currentOrg = await getCurrentOrg(supabase, user.id)
  return { supabase, user, orgId: currentOrg?.orgId ?? null }
}
