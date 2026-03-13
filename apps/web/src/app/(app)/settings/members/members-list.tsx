'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { MoreHorizontal, Shield, Trash2 } from 'lucide-react'
import {
  ROLE_LABELS,
  ROLES_ORDERED,
  canManageRole,
  hasPermission,
  type OrgRole,
} from '@pips/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FormattedDate } from '@/components/ui/formatted-date'
import {
  SortableHeader,
  nextSortState,
  sortRows,
  type SortDirection,
} from '@/components/ui/sortable-header'
import { changeMemberRole, removeMember } from './actions'

export interface OrgMember {
  id: string
  role: OrgRole
  joined_at: string
  user_id: string
  profiles: {
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

interface MembersListProps {
  orgId: string
  members: OrgMember[]
  currentUserId: string
  currentUserRole: OrgRole
}

export const MembersList = ({
  orgId,
  members,
  currentUserId,
  currentUserRole,
}: MembersListProps) => {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const canManageMembers = hasPermission(currentUserRole, 'org.members.manage')

  const handleSort = (key: string) => {
    const next = nextSortState(sortKey, sortDirection, key)
    setSortKey(next.sortKey)
    setSortDirection(next.direction)
  }

  const sortableRows = useMemo(
    () =>
      members.map((m) => ({
        name: m.profiles?.full_name ?? 'Unknown',
        email: m.profiles?.email ?? '',
        role: m.role,
        joined_at: m.joined_at,
        _original: m,
      })),
    [members],
  )

  const sortedRows = useMemo(
    () =>
      sortRows(
        sortableRows as unknown as Record<string, unknown>[],
        sortKey,
        sortDirection,
      ) as typeof sortableRows,
    [sortableRows, sortKey, sortDirection],
  )

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    const result = await changeMemberRole(orgId, memberId, newRole)
    if (result.success) {
      toast.success('Role updated successfully')
    } else {
      toast.error(result.error ?? 'Failed to update role')
    }
  }

  const handleRemove = async () => {
    if (!removingId) return
    const result = await removeMember(orgId, removingId)
    setRemovingId(null)
    if (result.success) {
      toast.success('Member removed')
    } else {
      toast.error(result.error ?? 'Failed to remove member')
    }
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

  const memberToRemove = members.find((m) => m.id === removingId)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              label="Name"
              sortKey="name"
              currentSort={sortKey}
              currentDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Email"
              sortKey="email"
              currentSort={sortKey}
              currentDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Role"
              sortKey="role"
              currentSort={sortKey}
              currentDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Joined"
              sortKey="joined_at"
              currentSort={sortKey}
              currentDirection={sortDirection}
              onSort={handleSort}
            />
            {canManageMembers && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row) => {
            const member = row._original
            const isCurrentUser = member.user_id === currentUserId
            const canManageThisMember =
              canManageMembers && !isCurrentUser && canManageRole(currentUserRole, member.role)

            return (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {(member.profiles?.full_name ?? member.profiles?.email ?? '?')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <span>
                      {member.profiles?.full_name ?? 'Unknown'}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.profiles?.email ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(member.role)}>{ROLE_LABELS[member.role]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <FormattedDate
                    date={member.joined_at}
                    options={{ month: 'short', day: 'numeric', year: 'numeric' }}
                  />
                </TableCell>
                {canManageMembers && (
                  <TableCell>
                    {canManageThisMember ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Shield className="size-4" />
                              Change role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {ROLES_ORDERED.filter(
                                (r) => r !== member.role && canManageRole(currentUserRole, r),
                              ).map((r) => (
                                <DropdownMenuItem
                                  key={r}
                                  onClick={() => handleRoleChange(member.id, r)}
                                >
                                  {ROLE_LABELS[r]}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setRemovingId(member.id)}
                          >
                            <Trash2 className="size-4" />
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!removingId} onOpenChange={() => setRemovingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>
                {memberToRemove?.profiles?.full_name ??
                  memberToRemove?.profiles?.email ??
                  'this member'}
              </strong>{' '}
              from the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
