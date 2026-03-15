'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatCreateDialog } from '@/components/chat/chat-create-dialog'
import { useChatStore } from '@/stores/chat-store'
import type { ChatChannel } from '@/stores/chat-store'

type Props = {
  initialChannels: (ChatChannel & { unread_count?: number })[]
}

export const ChatPageClient = ({ initialChannels }: Props) => {
  const { setChannels, channels, isLoaded } = useChatStore()
  const pathname = usePathname()

  // Hydrate store on first render
  useEffect(() => {
    if (!isLoaded) {
      setChannels(initialChannels)
    }
  }, [initialChannels, isLoaded, setChannels])

  const displayChannels = isLoaded ? channels : initialChannels

  // On mobile: when a channel is selected (/chat/[channelId]), hide the sidebar
  // so the thread fills the screen. On desktop (md+): always visible.
  const isChannelActive = pathname !== '/chat'

  return (
    <div
      className={[
        'flex flex-col',
        // Mobile: hidden when a channel is active (thread takes full width)
        // Mobile: full-width when on /chat (channel list view)
        // Desktop: always shown as a fixed sidebar
        isChannelActive ? 'hidden md:flex' : 'flex w-full md:w-auto',
      ].join(' ')}
    >
      <ChatSidebar channels={displayChannels as (ChatChannel & { unread_count?: number })[]} />
      <div className="border-r border-t border-[var(--color-border)] p-2">
        <ChatCreateDialog />
      </div>
    </div>
  )
}
