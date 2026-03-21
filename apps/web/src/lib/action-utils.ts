'use server'

import { getAuthContext } from '@/lib/auth-context'
import { requirePermission } from '@/lib/permissions'
import type { Permission } from '@pips/shared'

/**
 * Shared result type for all server actions.
 * Replaces 13+ duplicate ActionResult/ActionState definitions.
 *
 * Usage:
 *   ActionResult        → { error?: string }           (void actions)
 *   ActionResult<User>  → { data?: User; error?: string }
 */
export type ActionResult<T = void> = T extends void
  ? { error?: string }
  : { data?: T; error?: string }

/**
 * Authenticated context returned by requireAuth() on success.
 * Mirrors the shape of getAuthContext() but with non-nullable user and orgId.
 */
export type AuthContext = {
  supabase: Awaited<ReturnType<typeof getAuthContext>>['supabase']
  user: NonNullable<Awaited<ReturnType<typeof getAuthContext>>['user']>
  orgId: string
}

/**
 * Discriminated union returned by requireAuth().
 * Use the `success` field as the discriminant for TypeScript narrowing.
 */
export type AuthResult = { success: true; ctx: AuthContext } | { success: false; error: string }

/**
 * Verifies authentication and org context in a single call.
 *
 * Returns the typed AuthContext on success, or an error string on failure.
 * Replaces the 4-line boilerplate repeated in 81+ server action functions:
 *
 *   const { supabase, user, orgId } = await getAuthContext()
 *   if (!user) return { error: 'Not authenticated' }
 *   if (!orgId) return { error: 'No organization context' }
 *
 * Usage:
 *   const auth = await requireAuth()
 *   if (!auth.success) return { error: auth.error }
 *   const { supabase, user, orgId } = auth.ctx
 */
export const requireAuth = async (): Promise<AuthResult> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!orgId) return { success: false, error: 'No organization context' }
  return { success: true, ctx: { supabase, user, orgId } }
}

/**
 * Like requireAuth(), but also checks that the user account has not been
 * deactivated. Use this for sensitive write actions (settings changes, admin
 * mutations) where a deactivated user should be blocked at the action level.
 *
 * Read-only actions and most mutations use requireAuth() to avoid the extra
 * DB round-trip and to keep test mocks simple.
 *
 * Usage:
 *   const auth = await requireActiveUser()
 *   if (!auth.success) return { error: auth.error }
 *   const { supabase, user, orgId } = auth.ctx
 */
export const requireActiveUser = async (): Promise<AuthResult> => {
  const { supabase, user, orgId } = await getAuthContext()
  if (!user) return { success: false, error: 'Not authenticated' }
  if (!orgId) return { success: false, error: 'No organization context' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('deactivated_at')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.deactivated_at) return { success: false, error: 'Account has been deactivated' }

  return { success: true, ctx: { supabase, user, orgId } }
}

/**
 * Wraps requirePermission() in a try/catch and returns an error string or null.
 *
 * Replaces the repeated try/catch pattern:
 *   try { await requirePermission(orgId, permission, opts) } catch { return { error: '...' } }
 *
 * Usage:
 *   const permError = await checkPermission(orgId, 'chat.send', { supabase, userId: user.id })
 *   if (permError) return { error: permError }
 *
 * Returns null when the caller has the permission, or an error message string otherwise.
 */
export const checkPermission = async (
  orgId: string,
  permission: Permission,
  options?: Parameters<typeof requirePermission>[2],
): Promise<string | null> => {
  try {
    await requirePermission(orgId, permission, options)
    return null
  } catch {
    const actionLabel = permission.replace('.', ' ')
    return `You don't have permission to ${actionLabel}. Contact your org admin to upgrade your role.`
  }
}
