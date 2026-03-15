'use client'

import { useCallback, useState } from 'react'
import { UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { removeMember } from '@/app/(app)/chat/actions'
import { ChatAddMemberDialog } from './chat-add-member-dialog'

type ChannelMember = {
  user_id: string
  display_name: string
  avatar_url: string | null
  joined_at: string
  muted: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string
  members: ChannelMember[]
  canManage: boolean
  onMembersChanged: () => void
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const ChatMemberList = ({
  open,
  onOpenChange,
  channelId,
  members,
  canManage,
  onMembersChanged,
}: Props) => {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const handleRemove = useCallback(
    async (userId: string, displayName: string) => {
      setRemovingId(userId)
      const result = await removeMember(channelId, userId)
      setRemovingId(null)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`${displayName} removed from channel`)
      onMembersChanged()
    },
    [channelId, onMembersChanged],
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Channel Members</DialogTitle>
            <DialogDescription>
              {members.length} {members.length === 1 ? 'member' : 'members'} in this channel
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-surface-secondary)]"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-secondary)] text-xs font-semibold text-[var(--color-text-secondary)] overflow-hidden">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatar_url}
                      alt={member.display_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(member.display_name)}</span>
                  )}
                </div>

                {/* Name + joined date */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {member.display_name}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Remove button */}
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-7 w-7 p-0 text-[var(--color-text-tertiary)] hover:text-destructive hover:bg-destructive/10"
                    onClick={() => void handleRemove(member.user_id, member.display_name)}
                    disabled={removingId === member.user_id}
                    title={`Remove ${member.display_name}`}
                  >
                    <UserMinus size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {canManage && (
            <div className="border-t border-[var(--color-border)] pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setAddOpen(true)}
              >
                Add Members
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {addOpen && (
        <ChatAddMemberDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          channelId={channelId}
          existingMemberIds={members.map((m) => m.user_id)}
          onMembersAdded={() => {
            setAddOpen(false)
            onMembersChanged()
          }}
        />
      )}
    </>
  )
}
