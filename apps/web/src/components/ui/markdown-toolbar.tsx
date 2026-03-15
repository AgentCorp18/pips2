'use client'

import { useCallback, type RefObject } from 'react'
import { Bold, Italic, Heading2, List, ListOrdered, Code, Link, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

/* ============================================================
   Types
   ============================================================ */

type MarkdownToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onChange: (value: string) => void
  disabled?: boolean
}

type ToolbarAction = {
  icon: React.ElementType
  label: string
  shortcut?: string
  apply: (text: string, start: number, end: number) => { text: string; cursor: number }
}

/* ============================================================
   Formatting actions
   ============================================================ */

const wrapSelection = (
  text: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
) => {
  const selected = text.slice(start, end)
  const content = selected || placeholder
  const newText = text.slice(0, start) + before + content + after + text.slice(end)
  const cursor = selected
    ? start + before.length + content.length + after.length
    : start + before.length
  return { text: newText, cursor }
}

const prefixLine = (text: string, start: number, end: number, prefix: string) => {
  // Find the start of the current line
  const lineStart = text.lastIndexOf('\n', start - 1) + 1
  const selected = text.slice(start, end)

  if (selected.includes('\n')) {
    // Multi-line: prefix each line
    const lines = selected.split('\n')
    const prefixed = lines.map((line) => prefix + line).join('\n')
    const newText = text.slice(0, start) + prefixed + text.slice(end)
    return { text: newText, cursor: start + prefixed.length }
  }

  // Single line
  const newText = text.slice(0, lineStart) + prefix + text.slice(lineStart)
  return { text: newText, cursor: end + prefix.length }
}

const ACTIONS: ToolbarAction[] = [
  {
    icon: Bold,
    label: 'Bold',
    shortcut: 'Ctrl+B',
    apply: (text, start, end) => wrapSelection(text, start, end, '**', '**', 'bold text'),
  },
  {
    icon: Italic,
    label: 'Italic',
    shortcut: 'Ctrl+I',
    apply: (text, start, end) => wrapSelection(text, start, end, '_', '_', 'italic text'),
  },
  {
    icon: Heading2,
    label: 'Heading',
    apply: (text, start, end) => prefixLine(text, start, end, '## '),
  },
  {
    icon: List,
    label: 'Bullet List',
    apply: (text, start, end) => prefixLine(text, start, end, '- '),
  },
  {
    icon: ListOrdered,
    label: 'Numbered List',
    apply: (text, start, end) => prefixLine(text, start, end, '1. '),
  },
  {
    icon: Quote,
    label: 'Quote',
    apply: (text, start, end) => prefixLine(text, start, end, '> '),
  },
  {
    icon: Code,
    label: 'Code',
    apply: (text, start, end) => wrapSelection(text, start, end, '`', '`', 'code'),
  },
  {
    icon: Link,
    label: 'Link',
    apply: (text, start, end) => {
      const selected = text.slice(start, end)
      const linkText = selected || 'link text'
      const newText = text.slice(0, start) + `[${linkText}](url)` + text.slice(end)
      const cursor = start + linkText.length + 3 // Position cursor at "url"
      return { text: newText, cursor }
    },
  },
]

/* ============================================================
   Component
   ============================================================ */

export const MarkdownToolbar = ({
  textareaRef,
  onChange,
  disabled = false,
}: MarkdownToolbarProps) => {
  const applyAction = useCallback(
    (action: ToolbarAction) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const result = action.apply(textarea.value, start, end)

      onChange(result.text)

      // Restore focus and cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(result.cursor, result.cursor)
      })
    },
    [textareaRef, onChange],
  )

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex flex-wrap gap-0.5 rounded-t-md border border-b-0 px-1 py-1"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        data-testid="markdown-toolbar"
      >
        {ACTIONS.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                onClick={() => applyAction(action)}
                aria-label={action.label}
                data-testid={`markdown-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <action.icon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {action.label}
              {action.shortcut && <span className="ml-1.5 opacity-60">{action.shortcut}</span>}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
