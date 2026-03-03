import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'
import { PermissionGate } from '@/components/pips/permission-gate'
import { MembersList, type OrgMember } from './members-list'
import { InviteDialog } from './invite-dialog'

const MembersPage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const membership = await getUserOrg()
  if (!membership) redirect('/onboarding')

  const orgId = membership.org_id as string
  const role = membership.role as OrgRole

  // Fetch all org members with profile data
  const { data: members } = await supabase
    .from('org_members')
    .select('id, role, created_at, user_id, profiles(full_name, email, avatar_url)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true })

  // Supabase join returns profiles; cast through unknown since
  // generated DB types may not be present yet.
  const orgMembers: OrgMember[] = (members ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as OrgRole,
    created_at: m.created_at as string,
    user_id: m.user_id as string,
    profiles: (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as OrgMember['profiles'],
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to your organization.
          </p>
        </div>
        <PermissionGate role={role} permission="org.members.manage">
          <InviteDialog orgId={orgId} actorRole={role} />
        </PermissionGate>
      </div>

      <MembersList
        orgId={orgId}
        members={orgMembers}
        currentUserId={user.id}
        currentUserRole={role}
      />
    </div>
  )
}

export default MembersPage
