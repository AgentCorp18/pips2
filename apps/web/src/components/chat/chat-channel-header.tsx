'use client'

import { useState } from 'react'
import { Hash, Users, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMemberList } from './chat-member-list'
import type { ChatChannel } from '@/stores/chat-store'

type ChannelMember = {
  user_id: string
  display_name: string
  avatar_url: string | null
  joined_at: string
  muted: boolean
}

type Props = {
  channel: ChatChannel
  members: ChannelMember[]
  canManage: boolean
  isConnected?: boolean
  onGenerateSummary: () => Promise<void>
  onMembersChanged: () => void
}

export const ChatChannelHeader = ({
  channel,
  members,
  canManage,
  isConnected,
  onGenerateSummary,
  onMembersChanged,
}: Props) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [memberListOpen, setMemberListOpen] = useState(false)

  const handleSummary = async () => {
    setIsGenerating(true)
    try {
      await onGenerateSummary()
    } finally {
      setIsGenerating(false)
    }
  }

  const displayName = channel.name ?? 'General'

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-[var(--color-text-tertiary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{displayName}</h3>
          {isConnected !== undefined && (
            <span
              className={`inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}
              title={isConnected ? 'Connected' : 'Reconnecting...'}
            />
          )}

          {/* Clickable member count */}
          <button
            type="button"
            onClick={() => setMemberListOpen(true)}
            className="flex items-center gap-1 rounded-[var(--radius-md)] px-1.5 py-0.5 text-xs text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-secondary)]"
            aria-label="View channel members"
            title="View members"
          >
            <Users size={12} />
            {members.length}
          </button>
        </div>

        {/* AI Summary button — hidden on mobile to save space */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleSummary()}
          disabled={isGenerating}
          className="hidden gap-1.5 text-xs md:flex"
        >
          {isGenerating ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Summarizing...
            </>
          ) : (
            <>
              <Sparkles size={12} />
              AI Summary
            </>
          )}
        </Button>
      </div>

      <ChatMemberList
        open={memberListOpen}
        onOpenChange={setMemberListOpen}
        channelId={channel.id}
        members={members}
        canManage={canManage}
        onMembersChanged={() => {
          setMemberListOpen(false)
          onMembersChanged()
        }}
      />
    </>
  )
}
