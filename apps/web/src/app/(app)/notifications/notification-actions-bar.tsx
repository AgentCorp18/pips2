'use client'

import { useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markAllAsRead } from './actions'

type NotificationActionsBarProps = {
  hasUnread: boolean
}

export const NotificationActionsBar = ({ hasUnread }: NotificationActionsBarProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleMarkAllAsRead = useCallback(() => {
    startTransition(async () => {
      const result = await markAllAsRead()
      if (!result.error) {
        router.refresh()
      }
    })
  }, [router])

  if (!hasUnread) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={handleMarkAllAsRead}
      disabled={isPending}
    >
      <CheckCheck size={14} />
      {isPending ? 'Marking...' : 'Mark all as read'}
    </Button>
  )
}
