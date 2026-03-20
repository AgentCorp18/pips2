'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Search,
  FolderKanban,
  Ticket,
  Plus,
  LayoutDashboard,
  FileText,
  Target,
  BookOpen,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  ClipboardList,
  Keyboard,
  CalendarDays,
  TrendingUp,
  Briefcase,
  Clock,
  UserCircle,
  Hash,
  Archive,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { globalSearch } from '@/app/(app)/search/actions'
import type { SearchResultGroup } from '@/types/search'
import { getRecentItems, type RecentItem } from '@/lib/recent-items'

const DEBOUNCE_MS = 300

const QUICK_ACTIONS = [
  {
    id: 'create-project',
    label: 'Create Project',
    icon: Plus,
    href: '/projects/new',
    group: 'Create',
  },
  {
    id: 'create-initiative',
    label: 'Create Initiative',
    icon: Target,
    href: '/initiatives/new',
    group: 'Create',
  },
  {
    id: 'create-ticket',
    label: 'Create Ticket',
    icon: FileText,
    href: '/tickets/new',
    group: 'Create',
  },
  {
    id: 'go-dashboard',
    label: 'Go to Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    group: 'Navigate',
  },
  {
    id: 'go-projects',
    label: 'Go to Projects',
    icon: FolderKanban,
    href: '/projects',
    group: 'Navigate',
  },
  {
    id: 'go-initiatives',
    label: 'Go to Initiatives',
    icon: Target,
    href: '/initiatives',
    group: 'Navigate',
  },
  {
    id: 'go-tickets',
    label: 'Go to Tickets',
    icon: Ticket,
    href: '/tickets',
    group: 'Navigate',
  },
  {
    id: 'go-calendar',
    label: 'Go to Calendar',
    icon: CalendarDays,
    href: '/tickets/calendar',
    group: 'Navigate',
  },
  {
    id: 'go-teams',
    label: 'Go to Teams',
    icon: Users,
    href: '/teams',
    group: 'Navigate',
  },
  {
    id: 'go-chat',
    label: 'Go to Chat',
    icon: MessageSquare,
    href: '/chat',
    group: 'Navigate',
  },
  {
    id: 'go-reports',
    label: 'Go to Reports Hub',
    icon: BarChart3,
    href: '/reports',
    group: 'Navigate',
  },
  {
    id: 'go-roi-dashboard',
    label: 'Go to ROI Dashboard',
    icon: TrendingUp,
    href: '/reports/roi-dashboard',
    group: 'Navigate',
  },
  {
    id: 'go-portfolio-value',
    label: 'Go to Portfolio Value',
    icon: Briefcase,
    href: '/reports/portfolio-value',
    group: 'Navigate',
  },
  {
    id: 'go-executive-summary',
    label: 'Go to Executive Summary',
    icon: FileText,
    href: '/reports/executive-summary',
    group: 'Navigate',
  },
  {
    id: 'go-knowledge',
    label: 'Go to Knowledge Hub',
    icon: BookOpen,
    href: '/knowledge',
    group: 'Navigate',
  },
  {
    id: 'go-forms',
    label: 'Go to Forms',
    icon: FileText,
    href: '/forms',
    group: 'Navigate',
  },
  {
    id: 'go-settings',
    label: 'Go to Settings',
    icon: Settings,
    href: '/settings',
    group: 'Navigate',
  },
]

const RESULT_TYPE_ICONS: Record<string, typeof FolderKanban> = {
  project: FolderKanban,
  ticket: Ticket,
  form: ClipboardList,
  member: UserCircle,
  channel: Hash,
  archived_project: Archive,
}

/** Colored pill badges for search result types */
const TYPE_BADGE_STYLES: Record<string, string> = {
  project:
    'bg-[color-mix(in_srgb,#4F46E5_12%,transparent)] text-[#4F46E5] border border-[color-mix(in_srgb,#4F46E5_25%,transparent)]',
  ticket:
    'bg-[color-mix(in_srgb,#059669_12%,transparent)] text-[#059669] border border-[color-mix(in_srgb,#059669_25%,transparent)]',
  initiative:
    'bg-[color-mix(in_srgb,#D97706_12%,transparent)] text-[#D97706] border border-[color-mix(in_srgb,#D97706_25%,transparent)]',
  form: 'bg-[color-mix(in_srgb,#0891B2_12%,transparent)] text-[#0891B2] border border-[color-mix(in_srgb,#0891B2_25%,transparent)]',
  member:
    'bg-[color-mix(in_srgb,#7C3AED_12%,transparent)] text-[#7C3AED] border border-[color-mix(in_srgb,#7C3AED_25%,transparent)]',
  channel:
    'bg-[color-mix(in_srgb,#2563EB_12%,transparent)] text-[#2563EB] border border-[color-mix(in_srgb,#2563EB_25%,transparent)]',
  archived_project:
    'bg-[color-mix(in_srgb,#6B7280_12%,transparent)] text-[#6B7280] border border-[color-mix(in_srgb,#6B7280_25%,transparent)]',
}

const TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  ticket: 'Ticket',
  initiative: 'Initiative',
  form: 'Form',
  member: 'Team Member',
  channel: 'Channel',
  archived_project: 'Archived',
}

const RECENT_ITEM_ICONS: Record<string, typeof FolderKanban> = {
  project: FolderKanban,
  ticket: Ticket,
  initiative: Target,
}

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<SearchResultGroup[]>([])
  const [isPending, startTransition] = useTransition()
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load recent items from localStorage when palette opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage on open is idiomatic
      setRecentItems(getRecentItems())
    }
  }, [open])

  // Reset state when dialog closes
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
      if (!nextOpen) {
        setQuery('')
        setGroups([])
      }
    },
    [onOpenChange],
  )

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!value.trim()) {
      setGroups([])
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const response = await globalSearch(value)
        setGroups(response.groups)
      })
    }, DEBOUNCE_MS)
  }, [])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleSelect = useCallback(
    (href: string) => {
      handleOpenChange(false)
      router.push(href)
    },
    [router, handleOpenChange],
  )

  const hasQuery = query.trim().length > 0
  const hasResults = groups.length > 0
  const showEmptyState = hasQuery && !hasResults && !isPending
  const hasRecentItems = recentItems.length > 0

  const GROUP_HEADING_CLASS =
    '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)]'

  const ITEM_CLASS =
    'flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm aria-selected:bg-[var(--color-primary-subtle)] [&[aria-selected]]:text-[var(--color-text-primary)]'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0 sm:max-w-lg">
        <Command className="flex flex-col" shouldFilter={false} loop>
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3">
            <Search size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
            <Command.Input
              value={query}
              onValueChange={handleSearch}
              placeholder="Search projects, tickets, members, channels..."
              className="flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            <kbd className="hidden shrink-0 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)] sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            {/* Loading indicator */}
            {isPending && hasQuery && (
              <div className="px-3 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                Searching...
              </div>
            )}

            {/* Empty state */}
            {showEmptyState && (
              <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
                No results found
              </Command.Empty>
            )}

            {/* Search results grouped by type */}
            {hasResults &&
              groups.map((group) => (
                <Command.Group
                  key={group.type}
                  heading={`${group.label} (${group.results.length})`}
                  className={GROUP_HEADING_CLASS}
                >
                  {group.results.map((result) => {
                    const Icon = RESULT_TYPE_ICONS[result.type] ?? FileText
                    const badgeClass = TYPE_BADGE_STYLES[result.type] ?? ''
                    const badgeLabel = TYPE_LABELS[result.type] ?? result.type
                    return (
                      <Command.Item
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result.url)}
                        className={ITEM_CLASS}
                      >
                        <Icon size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium text-[var(--color-text-primary)]">
                            {result.title}
                          </span>
                          <span className="truncate text-xs text-[var(--color-text-tertiary)]">
                            {result.subtitle}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                        >
                          {badgeLabel}
                        </span>
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              ))}

            {/* No-query view: Recent items + quick actions */}
            {!hasQuery && (
              <>
                {/* Recent Items */}
                {hasRecentItems && (
                  <Command.Group heading="Recent" className={GROUP_HEADING_CLASS}>
                    {recentItems.map((item) => {
                      const Icon = RECENT_ITEM_ICONS[item.type] ?? FileText
                      const badgeClass = TYPE_BADGE_STYLES[item.type] ?? ''
                      const badgeLabel = TYPE_LABELS[item.type] ?? item.type
                      return (
                        <Command.Item
                          key={`recent-${item.id}`}
                          value={`recent-${item.id}`}
                          onSelect={() => handleSelect(item.path)}
                          className={ITEM_CLASS}
                        >
                          <Icon size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
                          <span className="min-w-0 flex-1 truncate text-[var(--color-text-primary)]">
                            {item.title}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                          >
                            {badgeLabel}
                          </span>
                          <Clock
                            size={12}
                            className="shrink-0 text-[var(--color-text-tertiary)]"
                            aria-hidden="true"
                          />
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                )}

                {/* Quick actions */}
                {(['Create', 'Navigate'] as const).map((group) => (
                  <Command.Group key={group} heading={group} className={GROUP_HEADING_CLASS}>
                    {QUICK_ACTIONS.filter((a) => a.group === group).map((action) => {
                      const Icon = action.icon
                      return (
                        <Command.Item
                          key={action.id}
                          value={action.id}
                          onSelect={() => handleSelect(action.href)}
                          className={ITEM_CLASS}
                        >
                          <Icon size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
                          <span className="text-[var(--color-text-primary)]">{action.label}</span>
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                ))}
              </>
            )}
          </Command.List>

          {/* Keyboard shortcuts (shown when no query) */}
          {!hasQuery && (
            <div className="border-t border-[var(--color-border)] px-4 py-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-tertiary)]">
                <Keyboard size={12} />
                Keyboard Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Command palette</span>
                  <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5 text-[10px]">
                    ⌘K
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Submit comment</span>
                  <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5 text-[10px]">
                    ⌘↵
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Close dialog</span>
                  <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5 text-[10px]">
                    Esc
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span>Navigate results</span>
                  <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5 text-[10px]">
                    ↑↓
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--color-border)] px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
              <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5">↑↓</kbd>
              <span>navigate</span>
              <kbd className="rounded border border-[var(--color-border)] px-1 py-0.5">↵</kbd>
              <span>select</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
