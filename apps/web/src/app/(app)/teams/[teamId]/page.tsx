import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getUserOrg } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { hasPermission, type OrgRole } from '@pips/shared'
import { getTeamDetail } from '../actions'
import { FormattedDate } from '@/components/ui/formatted-date'
import { TeamMembersList } from './team-members-list'
import { DeleteTeamButton } from './delete-team-button'

interface TeamDetailPageProps {
  params: Promise<{ teamId: string }>
}

const TeamDetailPage = async ({ params }: TeamDetailPageProps) => {
  const { teamId } = await params

  const membership = await getUserOrg()
  if (!membership) redirect('/onboarding')

  const role = membership.role as OrgRole
  const orgId = membership.org_id as string
  const canManage = hasPermission(role, 'org.teams.manage')

  const team = await getTeamDetail(teamId)
  if (!team) notFound()

  // Fetch org members who are NOT already in this team (for the add-member dialog)
  const supabase = await createClient()
  const teamMemberUserIds = new Set(team.members.map((m) => m.user_id))

  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('user_id, profiles(full_name, email)')
    .eq('org_id', orgId)

  const availableMembers = (orgMembers ?? [])
    .filter((om) => !teamMemberUserIds.has(om.user_id as string))
    .map((om) => {
      const profile = (Array.isArray(om.profiles) ? om.profiles[0] : om.profiles) as {
        full_name: string
        email: string
      } | null
      return {
        user_id: om.user_id as string,
        full_name: profile?.full_name ?? '',
        email: profile?.email ?? '',
      }
    })

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] space-y-6">
      {/* Back link */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <ArrowLeft size={16} />
        Back to Teams
      </Link>

      {/* Team header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {team.name}
          </h1>
          {team.description && (
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {team.description}
            </p>
          )}
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Created <FormattedDate date={team.created_at} />
          </p>
        </div>
        {canManage && <DeleteTeamButton teamId={team.id} teamName={team.name} />}
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe rounded-full" />

      {/* Members section */}
      <TeamMembersList
        teamId={team.id}
        members={team.members}
        canManage={canManage}
        availableMembers={availableMembers}
      />
    </div>
  )
}

export default TeamDetailPage
