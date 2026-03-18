'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { trackServerEvent } from '@/lib/analytics'
import type { SearchResult, SearchResultGroup, GlobalSearchResponse } from '@/types/search'

const LIMIT_PER_TYPE = 5
const PIPS_STEP_LABELS: Record<number, string> = {
  1: 'Identify',
  2: 'Analyze',
  3: 'Generate',
  4: 'Select & Plan',
  5: 'Implement',
  6: 'Evaluate',
}

const FORM_TYPE_LABELS: Record<string, string> = {
  problem_statement: 'Problem Statement',
  impact_assessment: 'Impact Assessment',
  fishbone: 'Fishbone Diagram',
  five_why: '5-Why Analysis',
  force_field: 'Force Field Analysis',
  checksheet: 'Checksheet',
  brainstorming: 'Brainstorming',
  brainwriting: 'Brainwriting',
  paired_comparisons: 'Paired Comparisons',
  criteria_matrix: 'Criteria Matrix',
  balance_sheet: 'Balance Sheet',
  raci: 'RACI Chart',
  implementation_plan: 'Implementation Plan',
  implementation_checklist: 'Implementation Checklist',
  milestone_tracker: 'Milestone Tracker',
  before_after: 'Before/After Comparison',
  evaluation: 'Evaluation Summary',
  lessons_learned: 'Lessons Learned',
}

/**
 * Resolve the current user's org ID from their membership.
 * Respects the org switcher cookie.
 * Returns null if not authenticated or not a member.
 */
const resolveOrgId = async (): Promise<string | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const currentOrg = await getCurrentOrg(supabase, user.id)

  return currentOrg?.orgId ?? null
}

/**
 * Global search across projects and tickets for the command palette.
 * Uses full-text search (tsvector) for tickets and projects,
 * with ilike fallback for project names.
 *
 * If orgId is not provided, it will be resolved from the current user.
 */
export const globalSearch = async (
  query: string,
  orgId?: string,
): Promise<GlobalSearchResponse> => {
  const trimmed = query.trim()
  if (!trimmed) {
    return { groups: [], total: 0 }
  }

  const resolvedOrgId = orgId ?? (await resolveOrgId())
  if (!resolvedOrgId) {
    return { groups: [], total: 0 }
  }

  const supabase = await createClient()

  // Sanitize input: strip PostgREST special characters to prevent filter injection
  const sanitized = trimmed.replace(/[%_(),.\\'"]/g, '')
  if (!sanitized) {
    return { groups: [], total: 0 }
  }

  // Build query string for full-text search (plain text, AND terms)
  const ftsQuery = sanitized
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `'${word}'`)
    .join(' & ')

  // Search projects: full-text search + ilike fallback on name
  const projectsPromise = supabase
    .from('projects')
    .select('id, title, current_step, status')
    .eq('org_id', resolvedOrgId)
    .is('archived_at', null)
    .or(`title.ilike.%${sanitized}%,search_vector.fts.${ftsQuery}`)
    .limit(LIMIT_PER_TYPE)

  // Search tickets: full-text search on search_vector
  const ticketsPromise = supabase
    .from('tickets')
    .select('id, title, sequence_number, status, project:projects!tickets_project_id_fkey(title)')
    .eq('org_id', resolvedOrgId)
    .textSearch('search_vector', ftsQuery, { type: 'plain' })
    .limit(LIMIT_PER_TYPE)

  // Search forms: ilike on title, joined through projects for org scoping
  const formsPromise = supabase
    .from('project_forms')
    .select(
      'id, form_type, step, title, project_id, project:projects!inner(id, title, org_id, status)',
    )
    .eq('project.org_id', resolvedOrgId)
    .neq('project.status', 'archived')
    .ilike('title', `%${sanitized}%`)
    .limit(LIMIT_PER_TYPE)

  // Get org ticket prefix for display
  const prefixPromise = supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', resolvedOrgId)
    .single()

  const [projectsResult, ticketsResult, formsResult, prefixResult] = await Promise.all([
    projectsPromise,
    ticketsPromise,
    formsPromise,
    prefixPromise,
  ])

  const ticketPrefix = (prefixResult.data?.ticket_prefix as string | undefined) ?? 'TKT'

  // Map projects to search results
  const projectResults: SearchResult[] = (projectsResult.data ?? []).map((p) => ({
    id: p.id as string,
    type: 'project' as const,
    title: p.title as string,
    subtitle: `Step ${p.current_step}: ${PIPS_STEP_LABELS[p.current_step as number] ?? 'Unknown'}`,
    url: `/projects/${p.id}`,
  }))

  // Map tickets to search results
  const ticketResults: SearchResult[] = (ticketsResult.data ?? []).map((t) => {
    const rawProject = t.project as unknown
    const projectData = Array.isArray(rawProject)
      ? ((rawProject[0] as { title: string } | undefined) ?? null)
      : (rawProject as { title: string } | null)
    const subtitle = projectData
      ? `${ticketPrefix}-${t.sequence_number} · ${projectData.title}`
      : `${ticketPrefix}-${t.sequence_number}`
    return {
      id: t.id as string,
      type: 'ticket' as const,
      title: t.title as string,
      subtitle,
      url: `/tickets/${t.id}`,
    }
  })

  // Map forms to search results
  const formResults: SearchResult[] = (formsResult.data ?? []).map((f) => {
    const rawProject = f.project as unknown
    const projectData = Array.isArray(rawProject)
      ? ((rawProject[0] as { id: string; title: string } | undefined) ?? null)
      : (rawProject as { id: string; title: string } | null)
    const formTypeLabel =
      FORM_TYPE_LABELS[f.form_type as string] ??
      (f.form_type as string)
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    const subtitle = projectData ? `${formTypeLabel} · ${projectData.title}` : formTypeLabel
    const projectId = (projectData?.id ?? (f.project_id as string)) as string
    return {
      id: f.id as string,
      type: 'form' as const,
      title: (f.title as string) || formTypeLabel,
      subtitle,
      url: `/projects/${projectId}/steps/${f.step as string}/forms/${f.form_type as string}`,
    }
  })

  const groups: SearchResultGroup[] = []

  if (projectResults.length > 0) {
    groups.push({
      type: 'project',
      label: 'Projects',
      results: projectResults,
    })
  }

  if (ticketResults.length > 0) {
    groups.push({ type: 'ticket', label: 'Tickets', results: ticketResults })
  }

  if (formResults.length > 0) {
    groups.push({ type: 'form', label: 'Forms', results: formResults })
  }

  const total = projectResults.length + ticketResults.length + formResults.length

  trackServerEvent('search.executed', {
    query_text: trimmed.slice(0, 100),
    result_count: total,
  })

  return { groups, total }
}
