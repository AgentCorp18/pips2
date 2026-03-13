import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAuditLog } from './actions'
import { AuditLogTable } from './audit-log-table'

export const metadata: Metadata = {
  title: 'Audit Log',
  description: 'View your organization audit trail',
}

const ALLOWED_ROLES: OrgRole[] = ['owner', 'admin']

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
              <AuditLogTable entries={result.entries} />

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
