import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { PermissionsMatrix } from './permissions-matrix'
import { getPermissionOverrides } from './actions'

const PermissionsPage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const currentOrg = await getCurrentOrg(supabase, user.id)
  if (!currentOrg) redirect('/onboarding')

  // Only owners and admins can view this page
  const isAdmin = currentOrg.role === 'owner' || currentOrg.role === 'admin'
  if (!isAdmin) {
    redirect('/settings')
  }

  const isOwner = currentOrg.role === 'owner'
  const overrides = await getPermissionOverrides(currentOrg.orgId)

  return <PermissionsMatrix orgId={currentOrg.orgId} overrides={overrides} isOwner={isOwner} />
}

export default PermissionsPage
