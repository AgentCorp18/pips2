'use client'

import Link from 'next/link'
import {
  BookOpen,
  Compass,
  ClipboardList,
  Users,
  Search,
  Bookmark,
  Clock,
  ArrowRight,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type {
  ReadHistoryWithContent,
  ReadingSessionWithContent,
} from '@/app/(app)/knowledge/actions'

const PILLAR_CARDS = [
  {
    pillar: 'book' as const,
    label: 'Book',
    description:
      'Deep methodology content — 15 chapters of philosophy, case studies, and practical guidance',
    icon: BookOpen,
    href: '/knowledge/book',
    color: 'var(--color-primary)',
    bgColor: 'var(--color-primary-subtle, rgba(79, 70, 229, 0.08))',
  },
  {
    pillar: 'guide' as const,
    label: 'Interactive Guide',
    description:
      'Step-by-step methodology — distilled tools, roles, and processes for each PIPS step',
    icon: Compass,
    href: '/knowledge/guide',
    color: 'var(--color-step-3, #059669)',
    bgColor: 'rgba(5, 150, 105, 0.08)',
  },
  {
    pillar: 'workbook' as const,
    label: 'Workbook',
    description:
      'Hands-on practice — exercises, templates, and form-based activities for learning by doing',
    icon: ClipboardList,
    href: '/knowledge/workbook',
    color: 'var(--color-step-2, #D97706)',
    bgColor: 'rgba(217, 119, 6, 0.08)',
  },
  {
    pillar: 'workshop' as const,
    label: 'Workshop',
    description: 'Facilitation in action — timed sessions, team scenarios, and facilitator guides',
    icon: Users,
    href: '/knowledge/workshop',
    color: 'var(--color-step-6, #0891B2)',
    bgColor: 'rgba(8, 145, 178, 0.08)',
  },
]

const PILLAR_CONFIG: Record<string, { label: string; color: string }> = {
  book: { label: 'Book', color: 'var(--color-primary)' },
  guide: { label: 'Guide', color: 'var(--color-step-3, #059669)' },
  workbook: { label: 'Workbook', color: 'var(--color-step-2, #D97706)' },
  workshop: { label: 'Workshop', color: 'var(--color-step-6, #0891B2)' },
}

type KnowledgeHubLandingProps = {
  recentReadHistory: ReadHistoryWithContent[]
  bookmarkCount: number
  readingSessions?: ReadingSessionWithContent[]
}

export const KnowledgeHubLanding = ({
  recentReadHistory,
  bookmarkCount,
  readingSessions = [],
}: KnowledgeHubLandingProps) => {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Knowledge Hub</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Everything you need to master the PIPS methodology — from theory to practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/knowledge/bookmarks">
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark size={14} />
              Bookmarks
              {bookmarkCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {bookmarkCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <ContentSearchBar />

      {/* 4-Pillar Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PILLAR_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.pillar} href={card.href}>
              <Card className="group h-full cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: card.bgColor }}
                    >
                      <Icon size={20} style={{ color: card.color }} />
                    </div>
                    <CardTitle className="text-base">{card.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {card.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                    Explore <ArrowRight size={12} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Continue Reading */}
      {readingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen size={16} className="text-[var(--color-primary)]" />
              Continue Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {readingSessions.map((session) => {
                const config = PILLAR_CONFIG[session.pillar]
                const href = `/knowledge/${session.pillar}/${session.slug}`
                const progressPercent = Math.round(session.scrollPosition * 100)

                return (
                  <Link key={session.pillar} href={href}>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]">
                      <div className="flex min-w-0 items-center gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] capitalize"
                          style={{
                            borderColor: config?.color,
                            color: config?.color,
                          }}
                        >
                          {config?.label ?? session.pillar}
                        </Badge>
                        <div className="min-w-0">
                          <span className="block truncate text-[var(--color-text-primary)]">
                            {session.title}
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--color-border)]">
                              <div
                                className="h-full rounded-full bg-[var(--color-primary)]"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-[var(--color-text-tertiary)]">
                              {progressPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        size={12}
                        className="shrink-0 text-[var(--color-text-tertiary)]"
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Read */}
      {recentReadHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={16} className="text-[var(--color-text-tertiary)]" />
              Recently Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentReadHistory.map((item) => {
                const config = PILLAR_CONFIG[item.pillar]
                const href = `/knowledge/${item.pillar}/${item.slug}`

                return (
                  <Link key={item.content_node_id} href={href}>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]">
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] capitalize"
                          style={{
                            borderColor: config?.color,
                            color: config?.color,
                          }}
                        >
                          {config?.label ?? item.pillar}
                        </Badge>
                        <span className="truncate text-[var(--color-text-primary)]">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {item.read_count > 1 && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                            <Eye size={11} />
                            {item.read_count}x
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {new Date(item.last_read_at).toLocaleDateString()}
                        </span>
                        <ArrowRight size={12} className="text-[var(--color-text-tertiary)]" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const ContentSearchBar = () => {
  return (
    <search className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      />
      <input
        type="search"
        aria-label="Search the Knowledge Hub"
        placeholder="Search the Knowledge Hub — chapters, tools, concepts..."
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const value = (e.target as HTMLInputElement).value.trim()
            if (value) {
              window.location.href = `/knowledge/search?q=${encodeURIComponent(value)}`
            }
          }
        }}
      />
    </search>
  )
}
