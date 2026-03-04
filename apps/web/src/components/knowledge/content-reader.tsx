'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, BookOpen, List } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { BookmarkButton } from './bookmark-button'
import type { ContentNodeRow } from '@/app/(app)/knowledge/actions'
import { recordReadHistory, updateReadingSession } from '@/app/(app)/knowledge/actions'

type Breadcrumb = { label: string; href: string }

type ContentReaderProps = {
  node: ContentNodeRow
  sections: ContentNodeRow[]
  prevNode: ContentNodeRow | null
  nextNode: ContentNodeRow | null
  breadcrumbs: Breadcrumb[]
}

export const ContentReader = ({
  node,
  sections,
  prevNode,
  nextNode,
  breadcrumbs,
}: ContentReaderProps) => {
  // Record read on mount
  useEffect(() => {
    recordReadHistory(node.id)
  }, [node.id])

  // Save scroll position on unmount
  const saveScrollPosition = useCallback(() => {
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      const scrollPercent =
        mainContent.scrollTop / (mainContent.scrollHeight - mainContent.clientHeight)
      updateReadingSession(node.id, node.pillar, scrollPercent)
    }
  }, [node.id, node.pillar])

  useEffect(() => {
    return () => {
      saveScrollPosition()
    }
  }, [saveScrollPosition])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-[var(--color-text-secondary)]">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-[var(--color-primary)]">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex gap-8">
        {/* Sidebar TOC (desktop) */}
        {sections.length > 0 && (
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-6">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                <List size={12} />
                On This Page
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.slug}`}
                    className="block truncate rounded px-2 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main content */}
        <article className="min-w-0 flex-1">
          {/* Title header */}
          <div className="mb-6 border-b border-[var(--color-border)] pb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  {node.title}
                </h1>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {node.estimated_read_minutes} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {sections.length} sections
                  </span>
                </div>
              </div>
              <BookmarkButton contentNodeId={node.id} />
            </div>
            {node.summary && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {node.summary}
              </p>
            )}
          </div>

          {/* Chapter body */}
          {node.body_md && (
            <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-secondary)] prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-primary)]">
              <MarkdownContent markdown={node.body_md} />
            </div>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} id={section.slug} className="mt-8 scroll-mt-6">
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
                {section.title}
              </h2>
              {section.body_md && (
                <div className="prose prose-sm max-w-none text-[var(--color-text-primary)] prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-secondary)]">
                  <MarkdownContent markdown={section.body_md} />
                </div>
              )}
            </div>
          ))}

          {/* Previous / Next navigation */}
          <Card className="mt-10">
            <CardContent className="flex items-center justify-between py-4">
              {prevNode ? (
                <Link
                  href={`/knowledge/book/${prevNode.slug}`}
                  className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                >
                  <ChevronLeft size={16} />
                  <span className="line-clamp-1">{prevNode.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {nextNode ? (
                <Link
                  href={`/knowledge/book/${nextNode.slug}`}
                  className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                >
                  <span className="line-clamp-1">{nextNode.title}</span>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}

/**
 * Simple markdown renderer — converts basic markdown to HTML.
 * For production, swap with react-markdown or a similar library.
 */
const MarkdownContent = ({ markdown }: { markdown: string }) => {
  const html = markdownToHtml(markdown)
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

const markdownToHtml = (md: string): string => {
  return (
    md
      // Headers (### to <h3>, etc.)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Ordered lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr />')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      // Paragraphs (double newline)
      .replace(/\n\n/g, '</p><p>')
      // Wrap in paragraph tags
      .replace(/^(.+)$/gm, (match) => {
        if (
          match.startsWith('<h') ||
          match.startsWith('<ul') ||
          match.startsWith('<ol') ||
          match.startsWith('<li') ||
          match.startsWith('<block') ||
          match.startsWith('<hr') ||
          match.startsWith('</p') ||
          match.startsWith('<p')
        ) {
          return match
        }
        return match
      })
  )
}
