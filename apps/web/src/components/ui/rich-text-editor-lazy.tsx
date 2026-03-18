'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

/**
 * Lazy-loaded RichTextEditor — reduces initial bundle by ~150KB.
 * Shows a skeleton placeholder while the Tiptap editor loads.
 */
export const RichTextEditorLazy = dynamic(
  () => import('@/components/ui/rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div
        className={cn('rounded-md border animate-pulse', 'min-h-[168px] bg-muted')}
        style={{ borderColor: 'var(--color-border)' }}
      />
    ),
  },
)
