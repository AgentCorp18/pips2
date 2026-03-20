'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateTicket } from '@/app/(app)/tickets/actions'
import { DatePicker } from '@/components/ui/date-picker'
import Link from 'next/link'
import {
  Pencil,
  Check,
  X,
  Calendar,
  User,
  Tag,
  FolderKanban,
  ArrowUpRight,
  Layers,
  ShieldAlert,
} from 'lucide-react'
import { FormattedDate } from '@/components/ui/formatted-date'
import { RichTextEditorLazy as RichTextEditor } from '@/components/ui/rich-text-editor-lazy'
import { InlineMarkdown } from '@/components/ui/inline-markdown'
import { CycleTimeBadge } from './cycle-time-badge'
import type { TicketStatus, TicketPriority, TicketType } from '@/types/tickets'

/* ============================================================
   Config
   ============================================================ */

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
]

const TYPE_OPTIONS: { value: TicketType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'pips_project', label: 'PIPS Project' },
  { value: 'ceo_request', label: 'CEO Request' },
]

const STATUS_COLORS: Record<TicketStatus, string> = {
  backlog: 'bg-gray-100 text-gray-700',
  todo: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  in_review: 'bg-purple-100 text-purple-700',
  blocked: 'bg-red-100 text-red-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
  none: 'bg-gray-100 text-gray-500',
}

/* ============================================================
   Types
   ============================================================ */

type OrgMember = {
  user_id: string
  display_name: string
}

type TicketData = {
  id: string
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  assignee_id: string | null
  due_date: string | null
  started_at: string | null
  resolved_at: string | null
  tags: string[]
  project: { id: string; title: string } | null
  assignee: { id: string; display_name: string; avatar_url: string | null } | null
  reporter: { id: string; display_name: string; avatar_url: string | null }
  created_at: string
  updated_at: string
}

type ParentTicketInfo = {
  id: string
  title: string
  sequenceId: string
}

type OrgProject = {
  id: string
  title: string
}

type LinkedInitiative = {
  id: string
  title: string
}

type TicketDetailClientProps = {
  ticket: TicketData
  sequenceId: string
  members: OrgMember[]
  orgProjects: OrgProject[]
  linkedInitiative: LinkedInitiative | null
  parentTicket?: ParentTicketInfo
}

/* ============================================================
   Component
   ============================================================ */

export const TicketDetailClient = ({
  ticket,
  sequenceId,
  members,
  orgProjects,
  linkedInitiative,
  parentTicket,
}: TicketDetailClientProps) => {
  const [isPending, startTransition] = useTransition()

  // Inline editing states
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(ticket.title)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descDraft, setDescDraft] = useState(ticket.description ?? '')

  const saveField = (field: string, value: unknown) => {
    startTransition(async () => {
      await updateTicket(ticket.id, { [field]: value })
    })
  }

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== ticket.title) {
      startTransition(async () => {
        const result = await updateTicket(ticket.id, { title: titleDraft.trim() })
        if (result?.error) {
          console.error('Failed to save title:', result.error)
          return // Keep edit mode open so the user can retry
        }
        setEditingTitle(false)
      })
    } else {
      setTitleDraft(ticket.title) // Revert draft if empty
      setEditingTitle(false)
    }
  }

  const saveDescription = () => {
    if (descDraft !== (ticket.description ?? '')) {
      startTransition(async () => {
        const result = await updateTicket(ticket.id, { description: descDraft })
        if (result?.error) {
          console.error('Failed to save description:', result.error)
          return // Keep edit mode open so the user can retry
        }
        setEditingDesc(false)
      })
    } else {
      setEditingDesc(false)
    }
  }

  return (
    <div className="grid gap-4 sm:gap-8 lg:grid-cols-[1fr_300px]">
      {/* Main content */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <span
            className="mb-1 block font-mono text-sm font-medium"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {sequenceId}
          </span>

          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                data-testid="ticket-title-edit-input"
                className="text-xl font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') {
                    setTitleDraft(ticket.title)
                    setEditingTitle(false)
                  }
                }}
              />
              <Button size="icon-sm" variant="ghost" onClick={saveTitle} aria-label="Save title">
                <Check size={16} />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Cancel editing title"
                onClick={() => {
                  setTitleDraft(ticket.title)
                  setEditingTitle(false)
                }}
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <h1
              className="group flex cursor-pointer items-center gap-2 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="ticket-detail-title"
              onClick={() => setEditingTitle(true)}
            >
              {ticket.title}
              <Pencil size={14} className="opacity-0 transition-opacity group-hover:opacity-50" />
            </h1>
          )}

          <div className="mt-2 flex items-center gap-2">
            <Badge
              className={STATUS_COLORS[ticket.status]}
              variant="secondary"
              data-testid="ticket-status-badge"
            >
              {STATUS_OPTIONS.find((o) => o.value === ticket.status)?.label}
            </Badge>
            <Badge
              className={PRIORITY_COLORS[ticket.priority]}
              variant="secondary"
              data-testid="ticket-priority-badge"
            >
              {PRIORITY_OPTIONS.find((o) => o.value === ticket.priority)?.label}
            </Badge>
          </div>

          {/* Blocked indicator — prominent callout when ticket is blocked */}
          {ticket.status === 'blocked' && (
            <div
              className="mt-3 flex items-center gap-2 rounded-md border px-3 py-2"
              style={{ borderColor: '#F87171', backgroundColor: '#FEF2F2' }}
              data-testid="ticket-blocked-indicator"
            >
              <ShieldAlert size={15} style={{ color: '#DC2626' }} aria-hidden="true" />
              <span className="text-sm font-medium" style={{ color: '#DC2626' }}>
                This ticket is blocked
              </span>
            </div>
          )}

          {/* Cycle Time */}
          <div className="mt-2">
            <CycleTimeBadge
              ticket={{
                status: ticket.status,
                started_at: ticket.started_at,
                resolved_at: ticket.resolved_at,
                created_at: ticket.created_at,
              }}
            />
          </div>

          {parentTicket && (
            <div className="mt-3 flex items-center gap-1.5" data-testid="parent-ticket-link">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                Parent:
              </span>
              <Link
                href={`/tickets/${parentTicket.id}`}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors hover:bg-[var(--color-primary-subtle)]"
                style={{ color: 'var(--color-primary)' }}
              >
                <span className="font-mono">{parentTicket.sequenceId}</span>
                <span className="max-w-[200px] truncate">{parentTicket.title}</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h2 className="mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Description
          </h2>
          {editingDesc ? (
            <div className="space-y-2">
              <RichTextEditor
                content={descDraft}
                onChange={setDescDraft}
                placeholder="Add a description..."
                disabled={isPending}
                data-testid="ticket-description-editor"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveDescription} disabled={isPending}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDescDraft(ticket.description ?? '')
                    setEditingDesc(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="group cursor-pointer rounded-md border p-4 transition-colors hover:border-[var(--color-primary-light)]"
              style={{ borderColor: 'var(--color-border)' }}
              onClick={() => setEditingDesc(true)}
            >
              {ticket.description ? (
                <InlineMarkdown content={ticket.description} />
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--color-text-tertiary)' }}>
                  Click to add a description...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className="space-y-4 rounded-lg border p-4"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Status */}
        <SidebarField label="Status">
          <Select
            value={ticket.status}
            onValueChange={(v) => saveField('status', v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarField>

        {/* Priority */}
        <SidebarField label="Priority">
          <Select
            value={ticket.priority}
            onValueChange={(v) => saveField('priority', v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarField>

        {/* Type */}
        <SidebarField label="Type">
          <Select
            value={ticket.type}
            onValueChange={(v) => saveField('type', v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarField>

        {/* Assignee */}
        <SidebarField label="Assignee" icon={<User size={14} />}>
          <Select
            value={ticket.assignee_id ?? ''}
            onValueChange={(v) => saveField('assignee_id', v || null)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarField>

        {/* Reporter */}
        <SidebarField label="Reporter" icon={<User size={14} />}>
          <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {ticket.reporter.display_name}
          </p>
        </SidebarField>

        {/* Project */}
        <SidebarField label="Project" icon={<FolderKanban size={14} />}>
          <Select
            value={ticket.project?.id ?? '__none__'}
            onValueChange={(v) => saveField('project_id', v === '__none__' ? null : v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full" size="sm" data-testid="ticket-project-select">
              <SelectValue placeholder="No project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {orgProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SidebarField>

        {/* Linked Initiative */}
        {linkedInitiative && (
          <SidebarField label="Initiative" icon={<Layers size={14} />}>
            <Link
              href={`/initiatives/${linkedInitiative.id}`}
              className="inline-flex items-center gap-1 text-sm transition-colors hover:underline"
              style={{ color: 'var(--color-primary)' }}
              data-testid="ticket-linked-initiative"
            >
              {linkedInitiative.title}
              <ArrowUpRight size={12} />
            </Link>
          </SidebarField>
        )}

        {/* Due Date */}
        <SidebarField label="Due Date" icon={<Calendar size={14} />}>
          <DatePicker
            name="due_date"
            value={ticket.due_date ?? ''}
            onChange={(v) => saveField('due_date', v || null)}
            disabled={isPending}
          />
        </SidebarField>

        {/* Tags */}
        {ticket.tags.length > 0 && (
          <SidebarField label="Tags" icon={<Tag size={14} />}>
            <div className="flex flex-wrap gap-1" data-testid="ticket-tags">
              {ticket.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs"
                  data-testid={`ticket-tag-${tag}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </SidebarField>
        )}

        {/* Dates */}
        <div
          className="border-t pt-3 text-xs"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <p>
            Created <FormattedDate date={ticket.created_at} />
          </p>
          <p>
            Updated <FormattedDate date={ticket.updated_at} />
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   SidebarField helper
   ============================================================ */

const SidebarField = ({
  label,
  icon,
  children,
}: {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) => (
  <div>
    <div
      className="mb-1 flex items-center gap-1.5 text-xs font-medium"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      {icon}
      {label}
    </div>
    {children}
  </div>
)
