import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'
import { getUserOrgs } from '@/app/(app)/actions'
import { getCurrentOrg } from '@/lib/get-current-org'

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all orgs and the currently selected org in parallel
  // Also check system admin status for the admin nav link
  const [orgs, currentOrg, profileData] = await Promise.all([
    getUserOrgs(),
    getCurrentOrg(supabase, user.id),
    supabase.from('profiles').select('is_system_admin').eq('id', user.id).maybeSingle(),
  ])

  const isAdmin = profileData.data?.is_system_admin === true

  if (!currentOrg) {
    // No org membership — render children without the AppShell.
    // This handles the /onboarding page which lives inside the (app) route
    // group but doesn't need org context. The middleware already handles
    // redirecting non-onboarding protected routes to /onboarding, so we
    // don't need a redirect here. Previously this did redirect('/onboarding')
    // which caused ERR_TOO_MANY_REDIRECTS because /onboarding is inside (app)
    // and would trigger this same layout in a loop.
    return <>{children}</>
  }

  return (
    <AppShell orgs={orgs} currentOrgId={currentOrg.orgId} isAdmin={isAdmin}>
      {children}
    </AppShell>
  )
}

export default AppLayout
