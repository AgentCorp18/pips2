import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAuditLog, type AuditLogEntry } from './actions'

export const metadata: Metadata = {
  title: 'Audit Log',
  description: 'View your organization audit trail',
}

const ALLOWED_ROLES: OrgRole[] = ['owner', 'admin']

const ACTION_BADGE_VARIANT: Record<string, { className: string; label: string }> = {
  insert: { className: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Create' },
  update: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Update' },
  delete: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Delete' },
}

const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

const formatEntityType = (entityType: string): string => {
  return entityType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const truncateId = (id: string | null): string => {
  if (!id) return '-'
  if (id.length <= 8) return id
  return `${id.slice(0, 8)}...`
}

const ActionBadge = ({ action }: { action: string }) => {
  const config = ACTION_BADGE_VARIANT[action] ?? {
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    label: action,
  }

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

const DetailsCell = ({ entry }: { entry: AuditLogEntry }) => {
  if (entry.action === 'delete' && entry.old_data) {
    const name =
      (entry.old_data.name as string) ??
      (entry.old_data.title as string) ??
      (entry.old_data.full_name as string)
    if (name) {
      return <span className="text-sm text-muted-foreground">Deleted: {name}</span>
    }
  }

  if (entry.action === 'update' && entry.old_data && entry.new_data) {
    const changedKeys = Object.keys(entry.new_data).filter(
      (key) =>
        key !== 'updated_at' &&
        JSON.stringify(entry.new_data?.[key]) !== JSON.stringify(entry.old_data?.[key]),
    )
    if (changedKeys.length > 0) {
      return (
        <span className="text-sm text-muted-foreground">
          Changed: {changedKeys.slice(0, 3).join(', ')}
          {changedKeys.length > 3 ? ` +${changedKeys.length - 3} more` : ''}
        </span>
      )
    }
  }

  if (entry.action === 'insert' && entry.new_data) {
    const name =
      (entry.new_data.name as string) ??
      (entry.new_data.title as string) ??
      (entry.new_data.full_name as string)
    if (name) {
      return <span className="text-sm text-muted-foreground">Created: {name}</span>
    }
  }

  return <span className="text-sm text-muted-foreground">-</span>
}

type AuditLogPageProps = {
  searchParams: Promise<{ page?: string }>
}

const AuditLogPage = async ({ searchParams }: AuditLogPageProps) => {
  const membership = await getUserOrg()
  if (!membership) redirect('/login')

  const role = membership.role as OrgRole

  if (!ALLOWED_ROLES.includes(role)) {
    redirect('/settings')
  }

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const limit = 25

  const result = await getAuditLog(currentPage, limit)

  if (result.error) {
    redirect('/settings')
  }

  const totalPages = Math.max(1, Math.ceil(result.total / limit))
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="audit-log-heading"
        >
          Audit Log
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Track all changes made within your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg" data-testid="audit-log-card-title">
            Activity History
          </CardTitle>
          <CardDescription>
            {result.total} total {result.total === 1 ? 'entry' : 'entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                No audit log entries yet
              </p>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Activity will appear here as changes are made in your organization.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <span
                          className="text-sm"
                          title={new Date(entry.created_at).toLocaleString()}
                        >
                          {formatRelativeTime(entry.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{entry.user_display_name ?? 'System'}</span>
                      </TableCell>
                      <TableCell>
                        <ActionBadge action={entry.action} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatEntityType(entry.entity_type)}</span>
                      </TableCell>
                      <TableCell>
                        <code
                          className="rounded px-1.5 py-0.5 text-xs"
                          style={{
                            backgroundColor: 'var(--color-surface-secondary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                          title={entry.entity_id ?? undefined}
                        >
                          {truncateId(entry.entity_id)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <DetailsCell entry={entry} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!hasPrev} asChild={hasPrev}>
                      {hasPrev ? (
                        <Link href={`/settings/audit-log?page=${currentPage - 1}`}>
                          <ChevronLeft />
                          Previous
                        </Link>
                      ) : (
                        <span>
                          <ChevronLeft />
                          Previous
                        </span>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" disabled={!hasNext} asChild={hasNext}>
                      {hasNext ? (
                        <Link href={`/settings/audit-log?page=${currentPage + 1}`}>
                          Next
                          <ChevronRight />
                        </Link>
                      ) : (
                        <span>
                          Next
                          <ChevronRight />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AuditLogPage
