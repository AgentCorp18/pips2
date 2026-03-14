'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Search, FolderKanban, Ticket, Plus, LayoutDashboard, FileText, Target } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { globalSearch } from '@/app/(app)/search/actions'
import type { SearchResultGroup } from '@/types/search'

const DEBOUNCE_MS = 300

const QUICK_ACTIONS = [
  {
    id: 'create-project',
    label: 'Create Project',
    icon: Plus,
    href: '/projects/new',
  },
  {
    id: 'create-initiative',
    label: 'Create Initiative',
    icon: Target,
    href: '/initiatives/new',
  },
  {
    id: 'create-ticket',
    label: 'Create Ticket',
    icon: FileText,
    href: '/tickets/new',
  },
  {
    id: 'go-dashboard',
    label: 'Go to Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
]

const RESULT_TYPE_ICONS = {
  project: FolderKanban,
  ticket: Ticket,
} as const

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<SearchResultGroup[]>([])
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
              placeholder="Search projects, tickets..."
              className="flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            <kbd className="hidden shrink-0 rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-tertiary)] sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <Command.List className="max-h-72 overflow-y-auto p-2">
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
                  heading={group.label}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)]"
                >
                  {group.results.map((result) => {
                    const Icon = RESULT_TYPE_ICONS[result.type]
                    return (
                      <Command.Item
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result.url)}
                        className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm aria-selected:bg-[var(--color-primary-subtle)] [&[aria-selected]]:text-[var(--color-text-primary)]"
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
                      </Command.Item>
                    )
                  })}
                </Command.Group>
              ))}

            {/* Quick actions (shown when no search query) */}
            {!hasQuery && (
              <Command.Group
                heading="Quick Actions"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--color-text-tertiary)]"
              >
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon
                  return (
                    <Command.Item
                      key={action.id}
                      value={action.id}
                      onSelect={() => handleSelect(action.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-sm aria-selected:bg-[var(--color-primary-subtle)] [&[aria-selected]]:text-[var(--color-text-primary)]"
                    >
                      <Icon size={16} className="shrink-0 text-[var(--color-text-tertiary)]" />
                      <span className="text-[var(--color-text-primary)]">{action.label}</span>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}
          </Command.List>

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
