'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

/**
 * Lightweight markdown renderer for inline content (ticket descriptions,
 * comments). Uses smaller typography than the full MarkdownContent used
 * in the Knowledge Hub.
 */

const components: Components = {
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http')
    return (
      <a
        href={href}
        className="text-[var(--color-primary)] underline decoration-[var(--color-primary)]/30 hover:decoration-[var(--color-primary)]"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    )
  },
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full" {...props}>
        {children}
      </table>
    </div>
  ),
}

type InlineMarkdownProps = {
  content: string
  className?: string
}

export const InlineMarkdown = ({ content, className }: InlineMarkdownProps) => {
  // If the content has no markdown indicators, skip the parser for performance
  const hasMarkdown = /[*_`#\-\[>|]/.test(content)

  if (!hasMarkdown) {
    return (
      <p
        className={`whitespace-pre-wrap text-sm ${className ?? ''}`}
        style={{ color: 'var(--color-text-primary)' }}
      >
        {content}
      </p>
    )
  }

  return (
    <div
      className={`prose prose-sm prose-slate dark:prose-invert max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-p:my-1 prose-li:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-primary)] prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-secondary)] prose-code:text-[var(--color-primary)] prose-code:bg-[var(--color-surface)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-[''] prose-code:after:content-[''] ${className ?? ''}`}
      data-testid="inline-markdown"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
