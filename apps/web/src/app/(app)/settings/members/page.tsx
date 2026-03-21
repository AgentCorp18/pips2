import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'
import { PermissionGate } from '@/components/pips/permission-gate'
import { MembersList, type OrgMember } from './members-list'
import { InviteDialog } from './invite-dialog'
import { PendingInvitations, type PendingInvitation } from './pending-invitations'

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
    .select('id, role, joined_at, user_id, profiles(full_name, email, avatar_url)')
    .eq('org_id', orgId)
    .order('joined_at', { ascending: true })

  // Supabase join returns profiles; cast through unknown since
  // generated DB types may not be present yet.
  const orgMembers: OrgMember[] = (members ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as OrgRole,
    joined_at: m.joined_at as string,
    user_id: m.user_id as string,
    profiles: (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as OrgMember['profiles'],
  }))

  // Fetch pending invitations (admin/owner only)
  const isAdmin = role === 'owner' || role === 'admin'
  let pendingInvitations: PendingInvitation[] = []

  if (isAdmin) {
    const { data: invitations } = await supabase
      .from('org_invitations')
      .select(
        'id, email, role, status, expires_at, created_at, invited_by, profiles!org_invitations_invited_by_fkey(full_name)',
      )
      .eq('org_id', orgId)
      .in('status', ['pending'])
      .order('created_at', { ascending: false })

    pendingInvitations = (invitations ?? []).map((inv) => {
      const inviterProfile = (Array.isArray(inv.profiles) ? inv.profiles[0] : inv.profiles) as {
        full_name: string
      } | null
      return {
        id: inv.id as string,
        email: inv.email as string,
        role: inv.role as string,
        status: inv.status as string,
        expires_at: inv.expires_at as string,
        created_at: inv.created_at as string,
        inviter_name: (inviterProfile?.full_name as string) ?? null,
      }
    })
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="members-page-heading">
            Members
          </h1>
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

      {isAdmin && pendingInvitations.length > 0 && (
        <PendingInvitations orgId={orgId} invitations={pendingInvitations} />
      )}
    </div>
  )
}

export default MembersPage
