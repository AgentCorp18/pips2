import { MessageSquare } from 'lucide-react'
import { ChatPageClient } from './chat-page-client'
import { getChannels } from './actions'

export const metadata = {
  title: 'Chat — PIPS',
}

export default async function ChatPage() {
  const result = await getChannels()
  const channels = result.data ?? []

  return (
    <div className="flex h-[calc(100vh-var(--topbar-height)-3rem)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <ChatPageClient initialChannels={channels} />

      {/* Empty state when no channel selected — hidden on mobile (sidebar is full-width there) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[var(--color-bg)]">
        <MessageSquare size={48} className="text-[var(--color-text-tertiary)]" />
        <h2 className="mt-4 text-lg font-medium text-[var(--color-text-primary)]">Team Chat</h2>
        <p className="mt-1 text-sm text-[var(--color-text-tertiary)]">
          Select a channel to start chatting
        </p>
      </div>
    </div>
  )
}
