'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Hash, FolderKanban, Ticket, Users, MessageSquare, Building2, User2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatChannel, ChatChannelType } from '@/stores/chat-store'

type Props = {
  channels: (ChatChannel & { unread_count?: number })[]
}

const CHANNEL_TYPE_ICONS: Record<ChatChannelType, typeof Hash> = {
  org: Building2,
  project: FolderKanban,
  ticket: Ticket,
  team: Users,
  direct: User2,
  custom: Hash,
}

const CHANNEL_TYPE_LABELS: Record<ChatChannelType, string> = {
  org: 'Organization',
  project: 'Projects',
  ticket: 'Tickets',
  team: 'Teams',
  direct: 'Direct Messages',
  custom: 'Channels',
}

const CHANNEL_TYPE_ORDER: ChatChannelType[] = [
  'org',
  'custom',
  'project',
  'team',
  'ticket',
  'direct',
]

const getChannelDisplayName = (channel: ChatChannel): string => {
  if (channel.name) return channel.name
  switch (channel.type) {
    case 'org':
      return 'General'
    case 'direct':
      return 'Direct Message'
    default:
      return `${channel.type} channel`
  }
}

export const ChatSidebar = ({ channels }: Props) => {
  const pathname = usePathname()

  // Group channels by type
  const grouped = useMemo(() => {
    const groups: Partial<Record<ChatChannelType, (ChatChannel & { unread_count?: number })[]>> = {}

    for (const channel of channels) {
      if (!groups[channel.type]) {
        groups[channel.type] = []
      }
      groups[channel.type]!.push(channel)
    }

    return groups
  }, [channels])

  return (
    <div className="flex h-full w-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:w-64">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <MessageSquare size={18} className="text-[var(--color-primary)]" />
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Chat</h2>
      </div>

      {/* Channel list */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Chat channels">
        {CHANNEL_TYPE_ORDER.map((type) => {
          const typeChannels = grouped[type]
          if (!typeChannels || typeChannels.length === 0) return null

          return (
            <div key={type} className="mb-2">
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                {CHANNEL_TYPE_LABELS[type]}
              </p>
              {typeChannels.map((channel) => {
                const Icon = CHANNEL_TYPE_ICONS[channel.type]
                const isActive = pathname === `/chat/${channel.id}`
                const unread = channel.unread_count ?? 0

                return (
                  <Link
                    key={channel.id}
                    href={`/chat/${channel.id}`}
                    className={cn(
                      'mx-2 flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-medium'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]',
                    )}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {getChannelDisplayName(channel)}
                    </span>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}

        {channels.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
            No channels yet
          </div>
        )}
      </nav>
    </div>
  )
}
