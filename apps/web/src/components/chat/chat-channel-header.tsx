'use client'

import { useState } from 'react'
import { Hash, Users, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatChannel } from '@/stores/chat-store'

type Props = {
  channel: ChatChannel
  memberCount: number
  onGenerateSummary: () => Promise<void>
}

export const ChatChannelHeader = ({ channel, memberCount, onGenerateSummary }: Props) => {
  const [isGenerating, setIsGenerating] = useState(false)

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
    <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Hash size={16} className="text-[var(--color-text-tertiary)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{displayName}</h3>
        <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
          <Users size={12} />
          {memberCount}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleSummary()}
        disabled={isGenerating}
        className="gap-1.5 text-xs"
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
  )
}
