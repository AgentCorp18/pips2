import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { PIPS_STEPS, STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { stepEnumToNumber } from '@pips/shared'
import { getOrgForms, getFormStats } from './actions'
import { getFormDisplayName } from '@/lib/form-utils'
import { FormStatsBar } from '@/components/forms/form-stats-bar'
import { FormListTable } from '@/components/forms/form-list-table'
import type { FormRow } from '@/components/forms/form-list-table'
import { FormCard } from '@/components/forms/form-card'
import { FormListFilters } from '@/components/forms/form-list-filters'
import { FormEmptyState } from '@/components/forms/form-empty-state'
import { FormsViewToggle } from '@/components/forms/forms-view-toggle'
import type { FormsViewMode } from '@/components/forms/forms-view-toggle'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Forms',
  description:
    'Browse and manage all PIPS forms across your projects, or practice in sandbox mode.',
}

/** Convert form_type to URL-safe slug (underscores → hyphens) */
const toUrlSlug = (formType: string) => formType.replace(/_/g, '-')

type FormsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const FormsPage = async ({ searchParams }: FormsPageProps) => {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  // View mode
  const viewParam = typeof params.view === 'string' ? params.view : 'table'
  const view: FormsViewMode =
    viewParam === 'cards' ? 'cards' : viewParam === 'sandbox' ? 'sandbox' : 'table'

  // Pagination / sort
  const page = typeof params.page === 'string' ? Math.max(1, Number(params.page) || 1) : 1
  const sortBy = typeof params.sort_by === 'string' ? params.sort_by : 'updated_at'
  const sortOrder = typeof params.sort_order === 'string' ? params.sort_order : 'desc'

  // Filters
  const filters: Record<string, unknown> = { page, sort_by: sortBy, sort_order: sortOrder }
  if (params.form_type) {
    filters.form_type = Array.isArray(params.form_type) ? params.form_type : [params.form_type]
  }
  if (params.step) {
    filters.step = Array.isArray(params.step) ? params.step : [params.step]
  }
  if (typeof params.project_id === 'string') {
    filters.project_id = params.project_id
  }
  if (typeof params.created_by === 'string') {
    filters.created_by = params.created_by
  }
  if (typeof params.search === 'string') {
    filters.search = params.search
  }

  // Fetch forms and stats in parallel
  const [{ forms, total }, stats] = await Promise.all([
    view === 'sandbox'
      ? Promise.resolve({ forms: [], total: 0 })
      : getOrgForms(currentOrg.orgId, filters),
    getFormStats(currentOrg.orgId),
  ])

  // Fetch projects for filter dropdown
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, title')
    .eq('org_id', currentOrg.orgId)
    .order('title')

  const projects = (projectsRaw ?? []).map((p) => ({ id: p.id, name: p.title as string }))

  // Transform forms into display rows
  const formRows: FormRow[] = forms.map((form) => {
    const stepNum = stepEnumToNumber(form.step)
    const stepMeta = PIPS_STEPS[stepNum - 1]

    const creator = form.creator as unknown as {
      id: string
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null

    const project = form.project as unknown as {
      id: string
      title: string
    } | null

    const data = form.data as Record<string, unknown> | null
    const dataFieldCount = data
      ? Object.keys(data).filter((k) => {
          const v = data[k]
          return v !== null && v !== undefined && v !== ''
        }).length
      : 0

    const formType = form.form_type
    const formSlug = toUrlSlug(formType)

    return {
      id: form.id,
      formType,
      formDisplayName: getFormDisplayName(formType),
      step: form.step,
      stepNumber: stepNum,
      stepName: stepMeta?.name ?? '',
      stepColor: stepMeta?.color ?? '#4F46E5',
      projectId: project?.id ?? form.project_id,
      projectName: project?.title ?? 'Unknown project',
      creatorName: creator ? creator.display_name || creator.full_name || 'Unknown' : 'Unknown',
      creatorAvatar: creator?.avatar_url ?? null,
      createdAt: form.created_at,
      updatedAt: form.updated_at,
      dataFieldCount,
      formSlug,
    }
  })

  const perPage = 25

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            <FileText size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="forms-page-heading"
            >
              Forms
            </h1>
            {view !== 'sandbox' && (
              <p className="mt-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {stats.total} form{stats.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        <FormsViewToggle current={view} />
      </div>

      {/* Stats bar — only in table/cards views */}
      {view !== 'sandbox' && (
        <FormStatsBar
          total={stats.total}
          byFormType={stats.byFormType}
          recentCount={stats.recentCount}
        />
      )}

      {/* Filters — only in table/cards views */}
      {view !== 'sandbox' && (
        <div className="mb-4">
          <FormListFilters projects={projects} />
        </div>
      )}

      {/* Content */}
      {view === 'sandbox' ? (
        <SandboxView />
      ) : formRows.length > 0 ? (
        view === 'table' ? (
          <div className="mt-2">
            <FormListTable
              forms={formRows}
              total={total}
              page={page}
              perPage={perPage}
              sortBy={sortBy}
              sortOrder={sortOrder as 'asc' | 'desc'}
            />
          </div>
        ) : (
          <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {formRows.map((form) => (
              <FormCard
                key={form.id}
                id={form.id}
                formDisplayName={form.formDisplayName}
                stepNumber={form.stepNumber}
                stepName={form.stepName}
                stepColor={form.stepColor}
                projectName={form.projectName}
                projectId={form.projectId}
                creatorName={form.creatorName}
                updatedAt={form.updatedAt}
                dataFieldCount={form.dataFieldCount}
                formSlug={form.formSlug}
              />
            ))}
          </div>
        )
      ) : (
        <div className="mt-4">
          <FormEmptyState />
        </div>
      )}
    </div>
  )
}

/* ============================================================
   Sandbox view — form catalog organized by step
   ============================================================ */

const SandboxView = () => (
  <div>
    <div className="step-gradient-stripe mb-6 rounded-full" />
    <div className="space-y-8">
      {PIPS_STEPS.map((step) => {
        const content = STEP_CONTENT[step.number as PipsStepNumber]
        return (
          <div key={step.number}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: step.color }}
              >
                {step.number}
              </span>
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Step {step.number}: {step.name}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.forms.map((form) => (
                <Link
                  key={form.type}
                  href={`/forms/sandbox/${toUrlSlug(form.type)}`}
                  className="group block"
                >
                  <Card className="h-full transition-all hover:shadow-[var(--shadow-low)] group-hover:border-[var(--color-primary-light)]">
                    <CardContent className="flex h-full flex-col justify-between gap-2 p-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium group-hover:text-[var(--color-primary)]">
                            {form.name}
                          </p>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            Sandbox
                          </Badge>
                        </div>
                        <p
                          className="mt-1 text-xs leading-relaxed"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {form.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: step.color }}
                        />
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Step {step.number}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export default FormsPage
