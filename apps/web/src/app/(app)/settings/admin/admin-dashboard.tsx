'use client'

import Link from 'next/link'
import { Users, FolderKanban, UsersRound, Ticket, FileText, Activity } from 'lucide-react'
import { ROLE_LABELS, type OrgRole } from '@pips/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { FormattedDate } from '@/components/ui/formatted-date'
import { SortableHeader } from '@/components/ui/sortable-header'
import { useSortable } from '@/hooks/use-sortable'
import type { AdminStats, AdminMember, AdminTeam, AdminProject } from './actions'

type AdminDashboardProps = {
  stats: AdminStats
  members: AdminMember[]
  teams: AdminTeam[]
  projects: AdminProject[]
}

const STATUS_COLORS: Record<string, string> = {
  active: '#3B82F6',
  on_hold: '#F59E0B',
  completed: '#10B981',
  cancelled: 'var(--color-text-tertiary)',
}

const roleBadgeVariant = (role: OrgRole) => {
  switch (role) {
    case 'owner':
      return 'default' as const
    case 'admin':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}

export const AdminDashboard = ({ stats, members, teams, projects }: AdminDashboardProps) => {
  const {
    sortedData: sortedMembers,
    sortKey: memberSortKey,
    sortDirection: memberSortDir,
    handleSort: handleMemberSort,
  } = useSortable(members)

  const {
    sortedData: sortedTeams,
    sortKey: teamSortKey,
    sortDirection: teamSortDir,
    handleSort: handleTeamSort,
  } = useSortable(teams)

  const {
    sortedData: sortedProjects,
    sortKey: projectSortKey,
    sortDirection: projectSortDir,
    handleSort: handleProjectSort,
  } = useSortable(projects)

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Members" value={stats.memberCount} />
        <StatCard icon={UsersRound} label="Teams" value={stats.teamCount} />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={stats.projectCount}
          sub={`${stats.activeProjectCount} active`}
        />
        <StatCard
          icon={Ticket}
          label="Tickets"
          value={stats.ticketCount}
          sub={`${stats.openTicketCount} open`}
        />
        <StatCard icon={FileText} label="Forms" value={stats.formCount} />
        <StatCard
          icon={Activity}
          label="Completion"
          value={`${stats.activeProjectCount > 0 ? Math.round(((stats.projectCount - stats.activeProjectCount) / stats.projectCount) * 100) : 0}%`}
        />
      </div>

      {/* Members table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader
                  label="Name"
                  sortKey="full_name"
                  currentSort={memberSortKey}
                  currentDirection={memberSortDir}
                  onSort={handleMemberSort}
                />
                <SortableHeader
                  label="Email"
                  sortKey="email"
                  currentSort={memberSortKey}
                  currentDirection={memberSortDir}
                  onSort={handleMemberSort}
                />
                <SortableHeader
                  label="Role"
                  sortKey="role"
                  currentSort={memberSortKey}
                  currentDirection={memberSortDir}
                  onSort={handleMemberSort}
                />
                <SortableHeader
                  label="Teams"
                  sortKey="team_count"
                  currentSort={memberSortKey}
                  currentDirection={memberSortDir}
                  onSort={handleMemberSort}
                  className="text-center"
                />
                <SortableHeader
                  label="Projects"
                  sortKey="project_count"
                  currentSort={memberSortKey}
                  currentDirection={memberSortDir}
                  onSort={handleMemberSort}
                  className="text-center"
                />
                <SortableHeader
                  label="Joined"
                  sortKey="joined_at"
                  currentSort={memberSortKey}
                  currentDirection={memberSortDir}
                  onSort={handleMemberSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        {(member.full_name ?? member.email).charAt(0).toUpperCase()}
                      </div>
                      {member.full_name ?? 'No name'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(member.role)}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">{member.team_count}</TableCell>
                  <TableCell className="text-center text-sm">{member.project_count}</TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <FormattedDate
                      date={member.joined_at}
                      options={{ month: 'short', day: 'numeric', year: 'numeric' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Teams & Projects side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Teams */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Teams</CardTitle>
              <Link
                href="/teams"
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <p
                className="py-4 text-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                No teams created yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader
                      label="Team"
                      sortKey="name"
                      currentSort={teamSortKey}
                      currentDirection={teamSortDir}
                      onSort={handleTeamSort}
                    />
                    <SortableHeader
                      label="Members"
                      sortKey="member_count"
                      currentSort={teamSortKey}
                      currentDirection={teamSortDir}
                      onSort={handleTeamSort}
                      className="text-center"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/teams/${team.id}`}
                          className="hover:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {team.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center text-sm">{team.member_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Projects</CardTitle>
              <Link
                href="/projects"
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p
                className="py-4 text-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                No projects created yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader
                      label="Project"
                      sortKey="title"
                      currentSort={projectSortKey}
                      currentDirection={projectSortDir}
                      onSort={handleProjectSort}
                    />
                    <SortableHeader
                      label="Status"
                      sortKey="status"
                      currentSort={projectSortKey}
                      currentDirection={projectSortDir}
                      onSort={handleProjectSort}
                    />
                    <SortableHeader
                      label="Owner"
                      sortKey="owner_name"
                      currentSort={projectSortKey}
                      currentDirection={projectSortDir}
                      onSort={handleProjectSort}
                    />
                    <SortableHeader
                      label="Members"
                      sortKey="member_count"
                      currentSort={projectSortKey}
                      currentDirection={projectSortDir}
                      onSort={handleProjectSort}
                      className="text-center"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="max-w-[180px] truncate font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {project.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: STATUS_COLORS[project.status] ?? '#6B7280',
                            }}
                          />
                          <span className="text-xs capitalize">
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {project.owner_name}
                      </TableCell>
                      <TableCell className="text-center text-sm">{project.member_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ─── Small stat card ─── */

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string | number
  sub?: string
}) => (
  <Card>
    <CardContent className="flex items-center gap-3 p-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <Icon size={18} className="text-[var(--color-primary)]" />
      </div>
      <div>
        <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {label}
        </p>
        {sub && (
          <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {sub}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
)
