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
  const [orgs, currentOrg] = await Promise.all([getUserOrgs(), getCurrentOrg(supabase, user.id)])

  if (!currentOrg) {
    redirect('/onboarding')
  }

  return (
    <AppShell orgs={orgs} currentOrgId={currentOrg.orgId}>
      {children}
    </AppShell>
  )
}

export default AppLayout
