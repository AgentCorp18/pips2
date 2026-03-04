import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Users, Calendar, ArrowRight } from 'lucide-react'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormattedDate } from '@/components/ui/formatted-date'
import { PermissionGate } from '@/components/pips/permission-gate'
import { CreateTeamDialog } from './create-team-dialog'
import { TeamsEmptyState } from './teams-empty-state'
import { getTeams } from './actions'

export const metadata: Metadata = {
  title: 'Teams - PIPS',
  description: 'Manage your organization teams',
}

const TeamsPage = async () => {
  const membership = await getUserOrg()
  if (!membership) redirect('/onboarding')

  const role = membership.role as OrgRole
  const teams = await getTeams()

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Teams
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Organize members into teams for your projects
          </p>
        </div>
        <PermissionGate role={role} permission="org.teams.manage">
          <CreateTeamDialog />
        </PermissionGate>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-6 rounded-full" />

      {/* Team grid or empty state */}
      {teams.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="group block">
              <Card className="transition-all hover:shadow-[var(--shadow-medium)] group-hover:border-[var(--color-primary-light)]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: team.color + '20' }}
                      >
                        <Users size={16} style={{ color: team.color }} />
                      </div>
                      <CardTitle className="text-base leading-snug group-hover:text-[var(--color-primary)]">
                        {team.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {team.description && (
                    <p className="line-clamp-2 text-sm text-[var(--color-text-tertiary)]">
                      {team.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Created <FormattedDate date={team.created_at} />
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <TeamsEmptyState role={role} />
      )}
    </div>
  )
}

export default TeamsPage
