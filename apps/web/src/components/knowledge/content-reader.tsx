'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, BookOpen, List } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { BookmarkButton } from './bookmark-button'

const MarkdownContent = dynamic(
  () => import('./markdown-content').then((mod) => ({ default: mod.MarkdownContent })),
  {
    loading: () => (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-3/4 rounded bg-[var(--color-surface-secondary)]" />
        <div className="h-4 w-full rounded bg-[var(--color-surface-secondary)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--color-surface-secondary)]" />
      </div>
    ),
  },
)
import type { ContentNodeRow } from '@/app/(app)/knowledge/actions'
import { recordReadHistory, updateReadingSession } from '@/app/(app)/knowledge/actions'

type Breadcrumb = { label: string; href: string }

type ContentReaderProps = {
  node: ContentNodeRow
  sections: ContentNodeRow[]
  prevNode: ContentNodeRow | null
  nextNode: ContentNodeRow | null
  breadcrumbs: Breadcrumb[]
  /** Saved scroll position (0-1) to restore on mount */
  initialScrollPosition?: number
}

export const ContentReader = ({
  node,
  sections,
  prevNode,
  nextNode,
  breadcrumbs,
  initialScrollPosition,
}: ContentReaderProps) => {
  // Record read on mount
  useEffect(() => {
    recordReadHistory(node.id)
  }, [node.id])

  // Restore scroll position on mount
  useEffect(() => {
    if (initialScrollPosition == null || initialScrollPosition <= 0) return
    // Small delay to let content render before scrolling
    const timer = setTimeout(() => {
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        const scrollTarget =
          initialScrollPosition * (mainContent.scrollHeight - mainContent.clientHeight)
        mainContent.scrollTo({ top: scrollTarget, behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="mx-auto max-w-4xl space-y-6" data-testid="content-reader">
      {/* Breadcrumbs */}
      <nav
        data-testid="breadcrumbs"
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]"
      >
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
                <h1
                  data-testid="content-title"
                  className="text-2xl font-bold text-[var(--color-text-primary)]"
                >
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
          {node.body_md && <MarkdownContent content={node.body_md} />}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} id={section.slug} className="mt-8 scroll-mt-6">
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
                {section.title}
              </h2>
              {section.body_md && <MarkdownContent content={section.body_md} />}
            </div>
          ))}

          {/* Previous / Next navigation */}
          <Card className="mt-10">
            <CardContent className="flex items-center justify-between py-4">
              {prevNode ? (
                <Link
                  data-testid="nav-prev"
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
                  data-testid="nav-next"
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
