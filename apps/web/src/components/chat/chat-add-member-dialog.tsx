'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { addMembers, getOrgMembers } from '@/app/(app)/chat/actions'
import type { OrgMemberInfo } from '@/app/(app)/chat/actions'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelId: string
  existingMemberIds: string[]
  onMembersAdded: () => void
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const ChatAddMemberDialog = ({
  open,
  onOpenChange,
  channelId,
  existingMemberIds,
  onMembersAdded,
}: Props) => {
  const [allMembers, setAllMembers] = useState<OrgMemberInfo[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (!open) return

    const load = async () => {
      setIsLoading(true)
      const result = await getOrgMembers()
      setIsLoading(false)

      if (result.error) {
        toast.error(result.error)
        return
      }

      // Filter out members already in the channel
      const eligibleMembers = (result.data ?? []).filter(
        (m) => !existingMemberIds.includes(m.user_id),
      )
      setAllMembers(eligibleMembers)
    }

    void load()
  }, [open, existingMemberIds])

  const toggleMember = useCallback((userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  const handleAdd = useCallback(async () => {
    if (selected.size === 0) return

    setIsAdding(true)
    const result = await addMembers(channelId, Array.from(selected))
    setIsAdding(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`Added ${selected.size} ${selected.size === 1 ? 'member' : 'members'}`)
    setSelected(new Set())
    onMembersAdded()
  }, [channelId, selected, onMembersAdded])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>Select org members to add to this channel.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        ) : allMembers.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--color-text-tertiary)]">
            All org members are already in this channel.
          </p>
        ) : (
          <>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {allMembers.map((member) => {
                const isSelected = selected.has(member.user_id)
                return (
                  <button
                    key={member.user_id}
                    type="button"
                    className={[
                      'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors',
                      isSelected
                        ? 'bg-[var(--color-primary)]/10'
                        : 'hover:bg-[var(--color-surface-secondary)]',
                    ].join(' ')}
                    onClick={() => toggleMember(member.user_id)}
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

                    {/* Name */}
                    <span className="flex-1 truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {member.display_name}
                    </span>

                    {/* Checkmark */}
                    {isSelected && (
                      <Check size={16} className="flex-shrink-0 text-[var(--color-primary)]" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void handleAdd()}
                disabled={selected.size === 0 || isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  `Add ${selected.size > 0 ? selected.size : ''} ${selected.size === 1 ? 'Member' : 'Members'}`.trim()
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
