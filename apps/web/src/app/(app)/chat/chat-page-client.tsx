'use client'

import { useEffect } from 'react'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatCreateDialog } from '@/components/chat/chat-create-dialog'
import { useChatStore } from '@/stores/chat-store'
import type { ChatChannel } from '@/stores/chat-store'

type Props = {
  initialChannels: (ChatChannel & { unread_count?: number })[]
  children?: React.ReactNode
}

export const ChatPageClient = ({ initialChannels, children }: Props) => {
  const { setChannels, channels, isLoaded } = useChatStore()

  // Hydrate store on first render
  useEffect(() => {
    if (!isLoaded) {
      setChannels(initialChannels)
    }
  }, [initialChannels, isLoaded, setChannels])

  const displayChannels = isLoaded ? channels : initialChannels

  return (
    <div className="flex h-full">
      <div className="flex flex-col">
        <ChatSidebar channels={displayChannels as (ChatChannel & { unread_count?: number })[]} />
        <div className="border-r border-t border-[var(--color-border)] p-2">
          <ChatCreateDialog />
        </div>
      </div>
      {children}
    </div>
  )
}
