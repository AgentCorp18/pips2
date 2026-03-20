'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Link2, Unlink, ShieldAlert, Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  addTicketLink,
  removeTicketLink,
  searchTickets,
} from '@/app/(app)/tickets/[ticketId]/link-actions'
import type { LinkedTicket, TicketLinksData } from '@/app/(app)/tickets/[ticketId]/link-actions'

/* ============================================================
   Types
   ============================================================ */

type TicketLinksProps = {
  ticketId: string
  orgId: string
  ticketPrefix: string
  initialLinks: TicketLinksData
}

/* ============================================================
   Helpers
   ============================================================ */

const formatId = (prefix: string, sequenceNumber: number) => `${prefix}-${sequenceNumber}`

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  backlog: { label: 'Backlog', className: 'bg-gray-100 text-gray-700' },
  todo: { label: 'Todo', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  in_review: { label: 'In Review', className: 'bg-purple-100 text-purple-700' },
  blocked: { label: 'Blocked', className: 'bg-red-100 text-red-700' },
  done: { label: 'Done', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
}

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }

/* ============================================================
   TicketLinks component
   ============================================================ */

export const TicketLinks = ({ ticketId, orgId, ticketPrefix, initialLinks }: TicketLinksProps) => {
  const [links, setLinks] = useState<TicketLinksData>(initialLinks)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Add form state
  const [searchQuery, setSearchQuery] = useState('')
  const [linkType, setLinkType] = useState<'blocks' | 'related'>('related')
  const [searchResults, setSearchResults] = useState<LinkedTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<LinkedTicket | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedTicket(null)
    setSearchError(null)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    startTransition(async () => {
      const result = await searchTickets(orgId, query, ticketId)
      setIsSearching(false)
      if (result.error) {
        setSearchError(result.error)
        setSearchResults([])
      } else {
        setSearchResults(result.data ?? [])
      }
    })
  }

  const handleSelectTicket = (ticket: LinkedTicket) => {
    setSelectedTicket(ticket)
    setSearchQuery(formatId(ticketPrefix, ticket.sequence_number) + ' – ' + ticket.title)
    setSearchResults([])
  }

  const handleAddLink = () => {
    if (!selectedTicket) return
    setAddError(null)

    startTransition(async () => {
      const result = await addTicketLink(ticketId, selectedTicket.id, linkType)
      if (result.error) {
        setAddError(result.error)
        return
      }

      // Update local state optimistically
      const newEntry: LinkedTicket = { ...selectedTicket, linkId: '' }
      setLinks((prev) => {
        if (linkType === 'blocks') {
          return { ...prev, blocking: [...prev.blocking, newEntry] }
        }
        return { ...prev, related: [...prev.related, newEntry] }
      })

      // Reset form
      setShowAddForm(false)
      setSearchQuery('')
      setSelectedTicket(null)
      setSearchResults([])
    })
  }

  const handleRemove = (linkId: string, section: 'blocking' | 'blockedBy' | 'related') => {
    startTransition(async () => {
      const result = await removeTicketLink(linkId)
      if (result.error) {
        console.error('Failed to remove link:', result.error)
        return
      }

      setLinks((prev) => ({
        ...prev,
        [section]: prev[section].filter((l) => l.linkId !== linkId),
      }))
    })
  }

  const hasAnyLinks =
    links.blocking.length > 0 || links.blockedBy.length > 0 || links.related.length > 0

  return (
    <div className="space-y-4" data-testid="ticket-links">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Link2 size={14} aria-hidden="true" />
          Linked Tickets
          {hasAnyLinks && (
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {links.blocking.length + links.blockedBy.length + links.related.length}
            </span>
          )}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAddForm((v) => !v)
            setAddError(null)
            setSearchQuery('')
            setSelectedTicket(null)
            setSearchResults([])
          }}
          data-testid="add-ticket-link-button"
          aria-expanded={showAddForm}
        >
          {showAddForm ? (
            <>
              <X size={14} className="mr-1" aria-hidden="true" />
              Cancel
            </>
          ) : (
            <>
              <Plus size={14} className="mr-1" aria-hidden="true" />
              Add Link
            </>
          )}
        </Button>
      </div>

      {/* Add Link form */}
      {showAddForm && (
        <div
          className="space-y-3 rounded-md border p-4"
          style={{ borderColor: 'var(--color-border)' }}
          data-testid="add-link-form"
        >
          {/* Link type selector */}
          <div>
            <label
              className="mb-1 block text-xs font-medium"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Link type
            </label>
            <Select
              value={linkType}
              onValueChange={(v) => setLinkType(v as 'blocks' | 'related')}
              disabled={isPending}
            >
              <SelectTrigger className="w-full" size="sm" data-testid="link-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blocks">Blocks</SelectItem>
                <SelectItem value="related">Related to</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ticket search */}
          <div className="relative">
            <label
              className="mb-1 block text-xs font-medium"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Search tickets
            </label>
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-tertiary)' }}
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="TKT-123 or ticket title..."
                className="pl-8"
                disabled={isPending}
                data-testid="ticket-link-search-input"
                autoComplete="off"
              />
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <ul
                className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-md"
                style={{ borderColor: 'var(--color-border)' }}
                data-testid="ticket-link-search-results"
                role="listbox"
              >
                {searchResults.map((t) => (
                  <li key={t.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--color-primary-subtle)]"
                      onClick={() => handleSelectTicket(t)}
                    >
                      <span
                        className="shrink-0 font-mono text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        {formatId(ticketPrefix, t.sequence_number)}
                      </span>
                      <span
                        className="min-w-0 flex-1 truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {t.title}
                      </span>
                      <Badge
                        className={`shrink-0 text-xs ${getStatusConfig(t.status).className}`}
                        variant="secondary"
                      >
                        {getStatusConfig(t.status).label}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {isSearching && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
                data-testid="ticket-link-searching"
              >
                Searching...
              </p>
            )}

            {searchError && (
              <p className="mt-1 text-xs text-red-600" data-testid="ticket-link-search-error">
                {searchError}
              </p>
            )}
          </div>

          {addError && (
            <p className="text-xs text-red-600" data-testid="ticket-link-add-error">
              {addError}
            </p>
          )}

          <Button
            size="sm"
            onClick={handleAddLink}
            disabled={!selectedTicket || isPending}
            data-testid="confirm-add-link-button"
          >
            Add Link
          </Button>
        </div>
      )}

      {/* No links empty state */}
      {!hasAnyLinks && !showAddForm && (
        <p
          className="py-4 text-center text-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
          data-testid="ticket-links-empty"
        >
          No linked tickets yet
        </p>
      )}

      {/* Blocks section — tickets this one blocks */}
      {links.blocking.length > 0 && (
        <LinkSection
          title="Blocks"
          icon={<ShieldAlert size={13} style={{ color: '#DC2626' }} aria-hidden="true" />}
          tickets={links.blocking}
          ticketPrefix={ticketPrefix}
          onRemove={(linkId) => handleRemove(linkId, 'blocking')}
          isPending={isPending}
          testId="blocking-section"
        />
      )}

      {/* Blocked By section — tickets blocking this one */}
      {links.blockedBy.length > 0 && (
        <BlockedBySection
          tickets={links.blockedBy}
          ticketPrefix={ticketPrefix}
          isPending={isPending}
          testId="blocked-by-section"
        />
      )}

      {/* Related section */}
      {links.related.length > 0 && (
        <LinkSection
          title="Related To"
          icon={<Link2 size={13} aria-hidden="true" />}
          tickets={links.related}
          ticketPrefix={ticketPrefix}
          onRemove={(linkId) => handleRemove(linkId, 'related')}
          isPending={isPending}
          testId="related-section"
        />
      )}
    </div>
  )
}

/* ============================================================
   LinkSection — reusable section for Blocks + Related
   ============================================================ */

type LinkSectionProps = {
  title: string
  icon: React.ReactNode
  tickets: LinkedTicket[]
  ticketPrefix: string
  onRemove: (linkId: string) => void
  isPending: boolean
  testId: string
}

const LinkSection = ({
  title,
  icon,
  tickets,
  ticketPrefix,
  onRemove,
  isPending,
  testId,
}: LinkSectionProps) => (
  <div data-testid={testId}>
    <h3
      className="mb-2 flex items-center gap-1.5 text-xs font-medium"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      {icon}
      {title}
    </h3>
    <ul className="space-y-1.5">
      {tickets.map((ticket) => (
        <LinkedTicketRow
          key={ticket.id + ticket.linkId}
          ticket={ticket}
          ticketPrefix={ticketPrefix}
          onRemove={() => onRemove(ticket.linkId)}
          isPending={isPending}
          showRemove
        />
      ))}
    </ul>
  </div>
)

/* ============================================================
   BlockedBySection — read-only list of tickets blocking this one
   ============================================================ */

type BlockedBySectionProps = {
  tickets: LinkedTicket[]
  ticketPrefix: string
  isPending: boolean
  testId: string
}

const BlockedBySection = ({ tickets, ticketPrefix, testId }: BlockedBySectionProps) => (
  <div data-testid={testId}>
    <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#DC2626' }}>
      <ShieldAlert size={13} aria-hidden="true" />
      Blocked By
    </h3>
    <ul className="space-y-1.5">
      {tickets.map((ticket) => (
        <LinkedTicketRow
          key={ticket.id + ticket.linkId}
          ticket={ticket}
          ticketPrefix={ticketPrefix}
          onRemove={() => {}}
          isPending={false}
          showRemove={false}
        />
      ))}
    </ul>
  </div>
)

/* ============================================================
   LinkedTicketRow — single linked ticket row
   ============================================================ */

type LinkedTicketRowProps = {
  ticket: LinkedTicket
  ticketPrefix: string
  onRemove: () => void
  isPending: boolean
  showRemove: boolean
}

const LinkedTicketRow = ({
  ticket,
  ticketPrefix,
  onRemove,
  isPending,
  showRemove,
}: LinkedTicketRowProps) => {
  const statusConfig = getStatusConfig(ticket.status)
  const isDone = ticket.status === 'done' || ticket.status === 'cancelled'

  return (
    <li className="flex items-center gap-2">
      <Link
        href={`/tickets/${ticket.id}`}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md border p-2 text-sm transition-colors hover:border-[var(--color-primary-light)]"
        style={{ borderColor: 'var(--color-border)' }}
        data-testid={`linked-ticket-${ticket.id}`}
      >
        <span
          className="shrink-0 font-mono text-xs"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {formatId(ticketPrefix, ticket.sequence_number)}
        </span>
        <span
          className={`min-w-0 flex-1 truncate ${isDone ? 'line-through' : ''}`}
          style={{ color: isDone ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}
        >
          {ticket.title}
        </span>
        <Badge className={`shrink-0 text-xs ${statusConfig.className}`} variant="secondary">
          {statusConfig.label}
        </Badge>
      </Link>

      {showRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          disabled={isPending}
          aria-label={`Remove link to ${ticket.title}`}
          data-testid={`remove-link-${ticket.id}`}
        >
          <Unlink size={13} aria-hidden="true" />
        </Button>
      )}
    </li>
  )
}
