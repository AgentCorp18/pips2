import type { Metadata } from 'next'
import { MessageSquare, Hash, Users } from 'lucide-react'
import { getAuthContext } from '@/lib/auth-context'
import { ChatPageClient } from './chat-page-client'
import { getChannels } from './actions'

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Collaborate with your team via project, ticket, and team chat channels.',
}

export default async function ChatPage() {
  // Sequential to avoid race condition — getChannels uses requireAuth which
  // reads the org cookie, and parallel execution can get different orgId values.
  const { user } = await getAuthContext()
  const result = await getChannels()
  const channels = result.data ?? []

  return (
    <div className="flex h-[calc(100vh-var(--topbar-height)-3rem)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <ChatPageClient initialChannels={channels} currentUserId={user?.id ?? null} />

      {/* Empty state when no channel selected */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-bg)] px-6">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
        >
          <MessageSquare size={32} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">Team Chat</h2>
        <p className="mb-5 max-w-xs text-center text-sm text-[var(--color-text-secondary)]">
          Coordinate with your team in real time. Channels are organized by project, ticket, and
          team — so every conversation stays in context.
        </p>
        <div className="flex flex-col gap-2 text-xs text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-2">
            <Hash size={13} aria-hidden="true" />
            <span>Select a channel on the left to read and send messages</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={13} aria-hidden="true" />
            <span>Team channels are created automatically when you add teams</span>
          </div>
        </div>
      </div>
    </div>
  )
}
