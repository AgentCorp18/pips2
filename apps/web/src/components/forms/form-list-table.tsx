'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { SortableHeader, type SortDirection } from '@/components/ui/sortable-header'

/* ============================================================
   Types
   ============================================================ */

export type FormRow = {
  id: string
  formType: string
  formDisplayName: string
  step: string
  stepNumber: number
  stepName: string
  stepColor: string
  projectId: string
  projectName: string
  creatorName: string
  creatorAvatar: string | null
  createdAt: string
  updatedAt: string
  dataFieldCount: number
  formSlug: string
}

type FormListTableProps = {
  forms: FormRow[]
  total: number
  page: number
  perPage: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

/* ============================================================
   Helpers
   ============================================================ */

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ============================================================
   Component
   ============================================================ */

export const FormListTable = ({
  forms,
  total,
  page,
  perPage,
  sortBy,
  sortOrder,
}: FormListTableProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)
  const totalPages = Math.ceil(total / perPage)

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, val] of Object.entries(updates)) {
        if (val) params.set(key, val)
        else params.delete(key)
      }
      router.replace(`/forms?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleSort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc'
    updateParams({ sort_by: column, sort_order: newOrder })
  }

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) })
  }

  const handleRowClick = (form: FormRow) => {
    router.push(`/projects/${form.projectId}/steps/${form.stepNumber}/forms/${form.formSlug}`)
  }

  const currentDirection: SortDirection = sortOrder === 'asc' ? 'asc' : 'desc'

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form Type</TableHead>
              <SortableHeader
                label="Step"
                sortKey="step"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
              />
              <TableHead className="hidden md:table-cell">Project</TableHead>
              <TableHead className="hidden lg:table-cell">Creator</TableHead>
              <SortableHeader
                label="Created"
                sortKey="created_at"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableHeader
                label="Last Modified"
                sortKey="updated_at"
                currentSort={sortBy}
                currentDirection={currentDirection}
                onSort={handleSort}
                className="hidden xl:table-cell"
              />
              <TableHead className="hidden sm:table-cell">Fields</TableHead>
              <TableHead className="w-10" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow
                key={form.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(form)}
              >
                {/* Form Type */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: form.stepColor }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {form.formDisplayName}
                    </span>
                  </div>
                </TableCell>

                {/* Step */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: form.stepColor }}
                    >
                      {form.stepNumber}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {form.stepName}
                    </span>
                  </div>
                </TableCell>

                {/* Project */}
                <TableCell className="hidden md:table-cell">
                  <Link
                    href={`/projects/${form.projectId}`}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {form.projectName}
                  </Link>
                </TableCell>

                {/* Creator */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {form.creatorName}
                  </span>
                </TableCell>

                {/* Created */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatDate(form.createdAt)}
                  </span>
                </TableCell>

                {/* Last Modified */}
                <TableCell className="hidden xl:table-cell">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    {formatDate(form.updatedAt)}
                  </span>
                </TableCell>

                {/* Fields */}
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    {form.dataFieldCount}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/knowledge/guide/tools/${form.formSlug}`}
                    className="flex h-7 w-7 items-center justify-center rounded hover:bg-[var(--color-surface)] transition-colors"
                    title="View knowledge guide"
                    aria-label={`Knowledge guide for ${form.formDisplayName}`}
                  >
                    <BookOpen size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-3 flex items-center justify-between pb-16 text-sm text-muted-foreground">
          <span>
            Showing {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="px-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
