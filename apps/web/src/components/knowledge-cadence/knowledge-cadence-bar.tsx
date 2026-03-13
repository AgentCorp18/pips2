'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Compass,
  ClipboardList,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ContentPillar, ProductContext } from '@pips/shared'
import { PILLAR_META } from '@pips/shared'
import { getContentForContext, type ContentNodeRow } from '@/app/(app)/knowledge/actions'

const PILLAR_ICONS: Record<ContentPillar, typeof BookOpen> = {
  book: BookOpen,
  guide: Compass,
  workbook: ClipboardList,
  workshop: Users,
}

const PILLAR_COLORS: Record<ContentPillar, string> = {
  book: 'var(--color-primary)',
  guide: '#059669',
  workbook: '#D97706',
  workshop: '#0891B2',
}

const PILLAR_BG: Record<ContentPillar, string> = {
  book: 'rgba(79, 70, 229, 0.08)',
  guide: 'rgba(5, 150, 105, 0.08)',
  workbook: 'rgba(217, 119, 6, 0.08)',
  workshop: 'rgba(8, 145, 178, 0.08)',
}

type KnowledgeCadenceBarProps = {
  context: ProductContext
  defaultCollapsed?: boolean
}

export const KnowledgeCadenceBar = ({
  context,
  defaultCollapsed = false,
}: KnowledgeCadenceBarProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [nodes, setNodes] = useState<ContentNodeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true)
      const results = await getContentForContext(context.steps, context.tools)
      setNodes(results)
      setLoading(false)
    }
    loadContent()
  }, [context.steps, context.tools])

  // Group by pillar — pick the best match per pillar
  const byPillar: Record<ContentPillar, ContentNodeRow | null> = {
    book: null,
    guide: null,
    workbook: null,
    workshop: null,
  }

  for (const node of nodes) {
    const pillar = node.pillar as ContentPillar
    if (!byPillar[pillar]) {
      byPillar[pillar] = node
    }
  }

  const hasPillars = Object.values(byPillar).some((v) => v !== null)
  if (!loading && !hasPillars) return null

  return (
    <Card className="border-[var(--color-border)]" data-testid="cadence-bar">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-expanded={!collapsed}
        aria-controls="cadence-bar-content"
        data-testid="cadence-bar-toggle"
        className="flex w-full items-center justify-between rounded px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          PIPS Knowledge
        </span>
        {collapsed ? (
          <ChevronDown size={14} className="text-[var(--color-text-tertiary)]" aria-hidden="true" />
        ) : (
          <ChevronUp size={14} className="text-[var(--color-text-tertiary)]" aria-hidden="true" />
        )}
      </button>

      {!collapsed && (
        <CardContent id="cadence-bar-content" className="px-4 pb-4 pt-0">
          {loading ? (
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              aria-busy="true"
              aria-label="Loading knowledge recommendations"
            >
              {(['book', 'guide', 'workbook', 'workshop'] as ContentPillar[]).map((p) => (
                <div
                  key={p}
                  className="h-24 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)]"
                />
              ))}
            </div>
          ) : (
            <nav
              aria-label="Related knowledge content"
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {(['book', 'guide', 'workbook', 'workshop'] as ContentPillar[]).map((pillar) => (
                <PillarCard key={pillar} pillar={pillar} node={byPillar[pillar]} />
              ))}
            </nav>
          )}
        </CardContent>
      )}
    </Card>
  )
}

type PillarCardProps = {
  pillar: ContentPillar
  node: ContentNodeRow | null
}

const PillarCard = ({ pillar, node }: PillarCardProps) => {
  const Icon = PILLAR_ICONS[pillar]
  const color = PILLAR_COLORS[pillar]
  const bg = PILLAR_BG[pillar]
  const meta = PILLAR_META[pillar]

  // Build the href based on pillar and node
  const href = node
    ? `/knowledge/${pillar === 'book' ? `book/${node.slug}` : pillar}`
    : `/knowledge/${pillar}`

  const actionLabel =
    pillar === 'book'
      ? 'Read'
      : pillar === 'guide'
        ? 'Open'
        : pillar === 'workbook'
          ? 'Start'
          : 'Begin'

  return (
    <Link
      href={href}
      aria-label={node ? `${meta.label}: ${node.title}` : `${meta.label} — coming soon`}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      <div
        className="group flex h-full flex-col justify-between rounded-lg border border-[var(--color-border)] p-3 transition-all hover:shadow-sm"
        style={{ borderColor: node ? color : undefined }}
      >
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{ backgroundColor: bg }}
            >
              <Icon size={12} style={{ color }} aria-hidden="true" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {meta.label}
            </span>
          </div>
          {node ? (
            <p className="mt-2 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
              {node.title}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-[var(--color-text-tertiary)]">Coming soon</p>
          )}
        </div>
        {node && (
          <div
            className="mt-2 flex items-center gap-1 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color }}
          >
            {actionLabel} <ArrowRight size={10} />
          </div>
        )}
      </div>
    </Link>
  )
}
