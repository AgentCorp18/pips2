import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { InitiativeCard } from '@/components/initiatives/initiative-card'
import { InitiativesFilters } from '@/components/initiatives/initiatives-filters'
import { Plus } from 'lucide-react'
import type { InitiativeStatus, DeadlineStatus } from '@/types/initiatives'
import { InitiativesEmptyState } from '@/components/initiatives/initiatives-empty-state'

export const metadata: Metadata = {
  title: 'Initiatives',
  description: 'Strategic goals that group multiple PIPS projects and track aggregated progress.',
}

type InitiativesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/* ============================================================
   Deadline Status Helpers
   ============================================================ */

const computeDeadlineStatus = (
  targetEnd: string | null,
  stepProgress: number,
): DeadlineStatus | undefined => {
  if (!targetEnd) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(targetEnd)
  end.setHours(0, 0, 0, 0)

  if (end < today) return 'overdue'

  const daysUntilEnd = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  if (daysUntilEnd <= 14 && stepProgress < 80) return 'at_risk'

  return 'on_track'
}

const InitiativesPage = async ({ searchParams }: InitiativesPageProps) => {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const currentOrg = await getCurrentOrg(supabase, user.id)
  if (!currentOrg) redirect('/onboarding')

  // Parse filter/sort params
  const searchQuery = typeof params.search === 'string' ? params.search.trim() : ''
  const statusFilter =
    typeof params.status === 'string' ? (params.status as InitiativeStatus) : null
  const sortParam = typeof params.sort === 'string' ? params.sort : 'newest'

  // Build the query — include archived when the user explicitly filters by archived status
  let query = supabase
    .from('initiatives')
    .select(
      `
      *,
      owner:profiles!initiatives_owner_id_fkey ( id, display_name, avatar_url ),
      initiative_projects (
        id,
        project_id,
        project:projects!initiative_projects_project_id_fkey (
          project_steps ( status )
        )
      )
    `,
    )
    .eq('org_id', currentOrg.orgId)

  // Only filter out archived items when the user hasn't selected "archived" explicitly
  if (statusFilter !== 'archived') {
    query = query.is('archived_at', null)
  }

  // Status filter
  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  // Apply DB-level sort where possible
  if (sortParam === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else if (sortParam === 'name_az') {
    query = query.order('title', { ascending: true })
  } else {
    // newest (default) and most_projects both start with created_at desc; most_projects is sorted in JS
    query = query.order('created_at', { ascending: false })
  }

  const { data: initiatives } = await query

  // Collect all project IDs to batch-fetch savings data
  const allProjectIds = (initiatives ?? []).flatMap((i) =>
    (i.initiative_projects ?? [])
      .map((ip: Record<string, unknown>) => ip.project_id as string)
      .filter(Boolean),
  )

  // Batch-fetch realised savings (results_metrics) for all linked projects
  const savingsMap = new Map<string, number>()
  if (allProjectIds.length > 0) {
    const { data: savingsForms } = await supabase
      .from('project_forms')
      .select('project_id, data')
      .in('project_id', allProjectIds)
      .eq('form_type', 'results_metrics')

    for (const form of savingsForms ?? []) {
      const data = form.data as Record<string, unknown> | null
      const val = Number(data?.financial_savings_annual ?? 0)
      if (!isNaN(val) && val > 0) {
        savingsMap.set(
          form.project_id as string,
          (savingsMap.get(form.project_id as string) ?? 0) + val,
        )
      }
    }
  }

  const items = (initiatives ?? []).map((i) => {
    const links = i.initiative_projects ?? []
    const project_count = links.length

    let step_progress = 0
    if (project_count > 0) {
      let totalProgress = 0
      for (const link of links) {
        const steps =
          (link.project as unknown as { project_steps: Array<{ status: string }> } | null)
            ?.project_steps ?? []
        const completedSteps = steps.filter(
          (s) => s.status === 'completed' || s.status === 'skipped',
        ).length
        totalProgress += (completedSteps / 6) * 100
      }
      step_progress = Math.round(totalProgress / project_count)
    }

    // Sum realised savings across linked projects
    const totalSavings = links.reduce((sum: number, link: Record<string, unknown>) => {
      return sum + (savingsMap.get(link.project_id as string) ?? 0)
    }, 0)

    const deadlineStatus = computeDeadlineStatus(i.target_end, step_progress)

    return {
      ...i,
      project_count,
      step_progress,
      totalSavings,
      deadlineStatus,
      owner: i.owner ?? { id: i.owner_id, display_name: 'Unknown', avatar_url: null },
    }
  })

  // Client-side search filter (title match)
  const filtered = searchQuery
    ? items.filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : items

  // Sort by most_projects in JS (DB sort handled all others)
  const sorted =
    sortParam === 'most_projects'
      ? [...filtered].sort((a, b) => b.project_count - a.project_count)
      : filtered

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6 lg:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-display text-2xl font-bold md:text-3xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Initiatives
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Strategic goals that group multiple PIPS projects together
          </p>
        </div>
        <Link href="/initiatives/new">
          <Button data-testid="create-initiative-button">
            <Plus size={16} className="mr-1.5" />
            New Initiative
          </Button>
        </Link>
      </div>

      {/* Search / Filter / Sort */}
      <InitiativesFilters />

      {sorted.length === 0 ? (
        <InitiativesEmptyState isFiltered={!!(searchQuery || statusFilter)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((initiative) => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </div>
      )}
    </div>
  )
}

export default InitiativesPage
