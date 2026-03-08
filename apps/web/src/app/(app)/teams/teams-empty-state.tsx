'use client'

import { Users } from 'lucide-react'
import { hasPermission, type OrgRole } from '@pips/shared'
import { CreateTeamDialog } from './create-team-dialog'

type TeamsEmptyStateProps = {
  role: OrgRole
}

export const TeamsEmptyState = ({ role }: TeamsEmptyStateProps) => {
  const canCreate = hasPermission(role, 'org.teams.manage')

  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      >
        <Users size={24} style={{ color: 'var(--color-primary)' }} />
      </div>
      <h3
        className="mb-1 text-lg font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
        data-testid="teams-empty-title"
      >
        No teams yet
      </h3>
      <p
        className="mb-6 max-w-sm text-center text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {canCreate
          ? 'Create your first team to start organizing members and collaborating on projects.'
          : 'No teams have been created yet. Ask an admin to create a team.'}
      </p>
      {canCreate && <CreateTeamDialog />}
    </div>
  )
}
