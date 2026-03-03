import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import type { ProjectMember } from './overview-actions'

type MembersListProps = {
  members: ProjectMember[]
}

const ROLE_LABELS: Record<string, string> = {
  lead: 'Lead',
  member: 'Member',
  viewer: 'Viewer',
  owner: 'Owner',
  admin: 'Admin',
}

export const MembersList = ({ members }: MembersListProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-base">
        <Users size={16} className="text-[var(--color-text-tertiary)]" />
        Team Members
        <Badge variant="secondary" className="ml-auto text-xs">
          {members.length}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {members.length === 0 ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">No team members assigned yet.</p>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                {member.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {member.displayName}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {ROLE_LABELS[member.role] ?? member.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
)
