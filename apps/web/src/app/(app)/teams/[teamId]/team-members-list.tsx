'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Trash2, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormattedDate } from '@/components/ui/formatted-date'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { TeamMember } from '../actions'
import { removeTeamMember } from '../actions'
import { AddMemberDialog } from './add-member-dialog'

type OrgMemberOption = {
  user_id: string
  full_name: string
  email: string
}

interface TeamMembersListProps {
  teamId: string
  members: TeamMember[]
  canManage: boolean
  availableMembers: OrgMemberOption[]
}

export const TeamMembersList = ({
  teamId,
  members,
  canManage,
  availableMembers,
}: TeamMembersListProps) => {
  const router = useRouter()
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  const memberToRemove = members.find((m) => m.user_id === removingUserId)

  const handleRemove = async () => {
    if (!removingUserId) return
    const result = await removeTeamMember(teamId, removingUserId)
    setRemovingUserId(null)
    if (result.success) {
      toast.success('Member removed from team')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Failed to remove member')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="team-members-heading"
        >
          Members ({members.length})
        </h2>
        {canManage && availableMembers.length > 0 && (
          <AddMemberDialog teamId={teamId} availableMembers={availableMembers} />
        )}
      </div>

      {members.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {canManage && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const displayName =
                member.profiles?.display_name ?? member.profiles?.full_name ?? 'Unknown'
              const email = member.profiles?.email ?? '--'
              const initial = (displayName || email).charAt(0).toUpperCase()

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {member.profiles?.avatar_url ? (
                        <Image
                          src={member.profiles.avatar_url}
                          alt={displayName}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {initial}
                        </div>
                      )}
                      <span>{displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{email}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'lead' ? 'default' : 'outline'}>
                      {member.role === 'lead' ? 'Lead' : 'Member'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <FormattedDate date={member.joined_at} />
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setRemovingUserId(member.user_id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                        <span className="sr-only">Remove member</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-12 text-center">
          <UserPlus
            size={24}
            className="mx-auto mb-2"
            style={{ color: 'var(--color-text-tertiary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No members yet. Add org members to this team to get started.
          </p>
        </div>
      )}

      <AlertDialog open={!!removingUserId} onOpenChange={() => setRemovingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>
                {memberToRemove?.profiles?.display_name ??
                  memberToRemove?.profiles?.full_name ??
                  memberToRemove?.profiles?.email ??
                  'this member'}
              </strong>{' '}
              from this team? They will still remain in the organization.
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
