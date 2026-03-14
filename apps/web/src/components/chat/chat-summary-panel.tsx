'use client'

import { Sparkles, X } from 'lucide-react'
import type { ChatSummary } from '@/stores/chat-store'

type Props = {
  summary: ChatSummary
  onClose: () => void
}

export const ChatSummaryPanel = ({ summary, onClose }: Props) => {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-primary-subtle)] px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <div>
            <p className="text-xs font-medium text-[var(--color-primary)]">AI Summary</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">
              {summary.summary}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          aria-label="Close summary"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
