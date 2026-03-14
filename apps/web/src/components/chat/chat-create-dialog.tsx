'use client'

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createChannel } from '@/app/(app)/chat/actions'
import { useChatStore } from '@/stores/chat-store'

export const ChatCreateDialog = () => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { addChannel } = useChatStore()

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return

    setIsCreating(true)
    const result = await createChannel('custom', name.trim())
    setIsCreating(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    if (result.data) {
      addChannel(result.data)
      toast.success(`Channel "${name.trim()}" created`)
      setName('')
      setOpen(false)
    }
  }, [name, addChannel])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
          <Plus size={14} />
          New Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>Create a new chat channel for your team.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label
              htmlFor="channel-name"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Channel Name
            </label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., brainstorming, design-review"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreate()
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={!name.trim() || isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
