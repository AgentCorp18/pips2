import { createClient } from '@supabase/supabase-js'

/**
 * Supabase admin helper for E2E tests.
 * Creates/deletes test users and orgs via the service role client.
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'E2E tests require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars',
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export type TestUser = {
  id: string
  email: string
  password: string
  displayName: string
}

/**
 * Create a test user with a confirmed email.
 * Returns user credentials for login.
 */
export const createTestUser = async (suffix?: string): Promise<TestUser> => {
  const admin = getAdminClient()
  const ts = Date.now()
  const tag = suffix ?? ts.toString()

  const email = `e2e-test-${tag}@test.pips.app`
  const password = 'E2eTestPass123!'
  const displayName = `E2E Test ${tag}`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  })

  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message}`)
  }

  return { id: data.user.id, email, password, displayName }
}

/**
 * Delete a test user and all their data (orgs, memberships, etc.)
 */
export const deleteTestUser = async (userId: string): Promise<void> => {
  const admin = getAdminClient()

  // Delete orgs created by this user (cascades to org_members, org_settings)
  await admin.from('organizations').delete().eq('created_by', userId)

  // Delete the user's profile
  await admin.from('profiles').delete().eq('id', userId)

  // Delete the auth user
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) {
    console.error(`Failed to delete test user ${userId}: ${error.message}`)
  }
}

/**
 * Check if an org exists for a given user.
 */
export const getUserOrgs = async (userId: string) => {
  const admin = getAdminClient()

  const { data } = await admin
    .from('org_members')
    .select('org_id, role, organizations(name, slug)')
    .eq('user_id', userId)

  return data ?? []
}

// ────────────────────────────────────────────────────────────
// Query helpers — read test data for assertions
// ────────────────────────────────────────────────────────────

/**
 * Fetch a project by ID.
 */
export const getProject = async (projectId: string) => {
  const admin = getAdminClient()
  const { data } = await admin.from('projects').select('*').eq('id', projectId).single()
  return data
}

/**
 * Fetch a ticket by ID.
 */
export const getTicket = async (ticketId: string) => {
  const admin = getAdminClient()
  const { data } = await admin.from('tickets').select('*').eq('id', ticketId).single()
  return data
}

/**
 * Fetch team members with their profile display names.
 */
export const getTeamMembers = async (teamId: string) => {
  const admin = getAdminClient()
  const { data } = await admin
    .from('team_members')
    .select('user_id, role, profiles(display_name)')
    .eq('team_id', teamId)
  return data ?? []
}

/**
 * Fetch recent audit log entries for an org.
 */
export const getAuditLog = async (orgId: string, limit: number = 10) => {
  const admin = getAdminClient()
  const { data } = await admin
    .from('audit_log')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

/**
 * Fetch a user profile by ID.
 */
export const getProfileById = async (userId: string) => {
  const admin = getAdminClient()
  const { data } = await admin.from('profiles').select('*').eq('id', userId).single()
  return data
}
