'use server'

import { createClient } from '@/lib/supabase/server'
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

/**
 * Resolve the current user's org ID from their membership.
 * Returns null if not authenticated or not a member.
 */
const resolveOrgId = async (): Promise<string | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return membership?.org_id ?? null
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
    .select('id, name, current_step, status')
    .eq('org_id', resolvedOrgId)
    .is('archived_at', null)
    .or(`name.ilike.%${sanitized}%,search_vector.fts.${ftsQuery}`)
    .limit(LIMIT_PER_TYPE)

  // Search tickets: full-text search on search_vector
  const ticketsPromise = supabase
    .from('tickets')
    .select('id, title, sequence_number, status, project:projects!tickets_project_id_fkey(name)')
    .eq('org_id', resolvedOrgId)
    .textSearch('search_vector', ftsQuery, { type: 'plain' })
    .limit(LIMIT_PER_TYPE)

  // Get org ticket prefix for display
  const prefixPromise = supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', resolvedOrgId)
    .single()

  const [projectsResult, ticketsResult, prefixResult] = await Promise.all([
    projectsPromise,
    ticketsPromise,
    prefixPromise,
  ])

  const ticketPrefix = (prefixResult.data?.ticket_prefix as string | undefined) ?? 'TKT'

  // Map projects to search results
  const projectResults: SearchResult[] = (projectsResult.data ?? []).map((p) => ({
    id: p.id as string,
    type: 'project' as const,
    title: p.name as string,
    subtitle: `Step ${p.current_step}: ${PIPS_STEP_LABELS[p.current_step as number] ?? 'Unknown'}`,
    url: `/projects/${p.id}`,
  }))

  // Map tickets to search results
  const ticketResults: SearchResult[] = (ticketsResult.data ?? []).map((t) => {
    const rawProject = t.project as unknown
    const projectData = Array.isArray(rawProject)
      ? ((rawProject[0] as { name: string } | undefined) ?? null)
      : (rawProject as { name: string } | null)
    const subtitle = projectData
      ? `${ticketPrefix}-${t.sequence_number} · ${projectData.name}`
      : `${ticketPrefix}-${t.sequence_number}`
    return {
      id: t.id as string,
      type: 'ticket' as const,
      title: t.title as string,
      subtitle,
      url: `/tickets/${t.id}`,
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

  const total = projectResults.length + ticketResults.length

  return { groups, total }
}
