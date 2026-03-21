'use server'

import { requireAuth } from '@/lib/action-utils'
import { trackServerEvent } from '@/lib/analytics'
import { getFormDisplayName } from '@/lib/form-utils'
import { stepEnumToNumber } from '@pips/shared'
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
 * Global search across projects and tickets for the command palette.
 * Uses full-text search (tsvector) for tickets and projects,
 * with ilike fallback for project names.
 *
 * The orgId parameter is ignored — the authenticated user's org context
 * is always resolved via requireAuth() to prevent cross-org enumeration.
 */
export const globalSearch = async (
  query: string,
  _orgId?: string,
): Promise<GlobalSearchResponse> => {
  const auth = await requireAuth()
  if (!auth.success) return { groups: [], total: 0 }
  const { supabase, orgId } = auth.ctx

  const trimmed = query.trim()
  if (!trimmed) {
    return { groups: [], total: 0 }
  }

  // Check if query looks like a ticket sequence ID (e.g. "TKT-123", "TKT123", or just "123")
  const ticketIdMatch = trimmed.match(/^(?:[A-Za-z]+-?)?(\d+)$/)
  let ticketBySeqResult: SearchResult | null = null
  if (ticketIdMatch?.[1]) {
    const seqNum = parseInt(ticketIdMatch[1], 10)
    // Get prefix first to validate the prefix portion if given
    const { data: prefixData } = await supabase
      .from('org_settings')
      .select('ticket_prefix')
      .eq('org_id', orgId)
      .single()
    const prefix = (prefixData?.ticket_prefix as string | undefined) ?? 'TKT'
    const prefixMatch = trimmed.match(/^([A-Za-z]+)-?(\d+)$/)
    const isValidTicketId = !prefixMatch || prefixMatch[1]?.toUpperCase() === prefix.toUpperCase()
    if (isValidTicketId) {
      const { data: ticketBySeq } = await supabase
        .from('tickets')
        .select(
          'id, title, sequence_number, status, project:projects!tickets_project_id_fkey(title)',
        )
        .eq('org_id', orgId)
        .eq('sequence_number', seqNum)
        .maybeSingle()
      if (ticketBySeq) {
        const rawProject = ticketBySeq.project as unknown
        const projectData = Array.isArray(rawProject)
          ? ((rawProject[0] as { title: string } | undefined) ?? null)
          : (rawProject as { title: string } | null)
        const subtitle = projectData
          ? `${prefix}-${ticketBySeq.sequence_number as number} · ${projectData.title}`
          : `${prefix}-${ticketBySeq.sequence_number as number}`
        ticketBySeqResult = {
          id: ticketBySeq.id as string,
          type: 'ticket' as const,
          title: ticketBySeq.title as string,
          subtitle,
          url: `/tickets/${ticketBySeq.id as string}`,
        }
      }
    }
  }

  // Sanitize input: strip PostgREST special characters to prevent filter injection
  const sanitized = trimmed.replace(/[%_(),.\\'"]/g, '')
  if (!sanitized) {
    // If we found a ticket by sequence number, return it even if sanitized is empty
    if (ticketBySeqResult) {
      trackServerEvent('search.executed', { query_text: trimmed.slice(0, 100), result_count: 1 })
      return {
        groups: [{ type: 'ticket', label: 'Tickets', results: [ticketBySeqResult] }],
        total: 1,
      }
    }
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
    .eq('org_id', orgId)
    .is('archived_at', null)
    .or(`title.ilike.%${sanitized}%,search_vector.fts.${ftsQuery}`)
    .limit(LIMIT_PER_TYPE)

  // Search tickets: full-text search on search_vector
  const ticketsPromise = supabase
    .from('tickets')
    .select('id, title, sequence_number, status, project:projects!tickets_project_id_fkey(title)')
    .eq('org_id', orgId)
    .textSearch('search_vector', ftsQuery, { type: 'plain' })
    .limit(LIMIT_PER_TYPE)

  // Search forms: ilike on title, joined through projects for org scoping
  const formsPromise = supabase
    .from('project_forms')
    .select(
      'id, form_type, step, title, project_id, project:projects!inner(id, title, org_id, status)',
    )
    .eq('project.org_id', orgId)
    .neq('project.status', 'archived')
    .ilike('title', `%${sanitized}%`)
    .limit(LIMIT_PER_TYPE)

  // Search org members: ilike on display_name / full_name via profiles
  const membersPromise = supabase
    .from('org_members')
    .select(
      'id, user_id, profile:profiles!org_members_user_id_fkey(display_name, full_name, email)',
    )
    .eq('org_id', orgId)
    .or(
      `profile.display_name.ilike.%${sanitized}%,profile.full_name.ilike.%${sanitized}%,profile.email.ilike.%${sanitized}%`,
    )
    .limit(LIMIT_PER_TYPE)

  // Search chat channels: ilike on name
  const channelsPromise = supabase
    .from('chat_channels')
    .select('id, name, description')
    .eq('org_id', orgId)
    .ilike('name', `%${sanitized}%`)
    .limit(LIMIT_PER_TYPE)

  // Search archived projects: ilike on title
  const archivedProjectsPromise = supabase
    .from('projects')
    .select('id, title, current_step')
    .eq('org_id', orgId)
    .eq('status', 'archived')
    .ilike('title', `%${sanitized}%`)
    .limit(LIMIT_PER_TYPE)

  // Get org ticket prefix for display
  const prefixPromise = supabase
    .from('org_settings')
    .select('ticket_prefix')
    .eq('org_id', orgId)
    .single()

  const [
    projectsResult,
    ticketsResult,
    formsResult,
    membersResult,
    channelsResult,
    archivedResult,
    prefixResult,
  ] = await Promise.all([
    projectsPromise,
    ticketsPromise,
    formsPromise,
    membersPromise,
    channelsPromise,
    archivedProjectsPromise,
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
  const ticketResultsMapped: SearchResult[] = (ticketsResult.data ?? []).map((t) => {
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
  // Prepend sequence-ID match as first result, deduplicating if already in text results
  const ticketResults: SearchResult[] = ticketBySeqResult
    ? [ticketBySeqResult, ...ticketResultsMapped.filter((r) => r.id !== ticketBySeqResult!.id)]
    : ticketResultsMapped

  // Map forms to search results
  const formResults: SearchResult[] = (formsResult.data ?? []).map((f) => {
    const rawProject = f.project as unknown
    const projectData = Array.isArray(rawProject)
      ? ((rawProject[0] as { id: string; title: string } | undefined) ?? null)
      : (rawProject as { id: string; title: string } | null)
    const formTypeLabel = getFormDisplayName(f.form_type as string)
    const subtitle = projectData ? `${formTypeLabel} · ${projectData.title}` : formTypeLabel
    const projectId = (projectData?.id ?? (f.project_id as string)) as string
    const stepNumber = stepEnumToNumber(f.step as string)
    const formSlug = (f.form_type as string).replace(/_/g, '-')
    return {
      id: f.id as string,
      type: 'form' as const,
      title: (f.title as string) || formTypeLabel,
      subtitle,
      url: `/projects/${projectId}/steps/${stepNumber}/forms/${formSlug}`,
    }
  })

  // Map members to search results
  type ProfileRow = { display_name: string | null; full_name: string | null; email: string | null }
  const memberResults: SearchResult[] = (membersResult.data ?? []).map((m) => {
    const rawProfile = m.profile as unknown
    const profile = Array.isArray(rawProfile)
      ? ((rawProfile[0] as ProfileRow | undefined) ?? null)
      : (rawProfile as ProfileRow | null)
    const name = profile?.display_name ?? profile?.full_name ?? profile?.email ?? 'Team Member'
    const subtitle = profile?.email ? profile.email : 'Team Member'
    return {
      id: m.id as string,
      type: 'member' as const,
      title: name,
      subtitle,
      url: '/settings/members',
    }
  })

  // Map channels to search results
  const channelResults: SearchResult[] = (channelsResult.data ?? []).map((c) => ({
    id: c.id as string,
    type: 'channel' as const,
    title: `#${c.name as string}`,
    subtitle: (c.description as string | null) ?? 'Chat channel',
    url: `/chat/${c.id}`,
  }))

  // Map archived projects to search results
  const archivedProjectResults: SearchResult[] = (archivedResult.data ?? []).map((p) => ({
    id: p.id as string,
    type: 'archived_project' as const,
    title: p.title as string,
    subtitle: `Step ${p.current_step}: ${PIPS_STEP_LABELS[p.current_step as number] ?? 'Unknown'} · Archived`,
    url: `/projects/${p.id}`,
  }))

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

  if (memberResults.length > 0) {
    groups.push({ type: 'member', label: 'Team Members', results: memberResults })
  }

  if (channelResults.length > 0) {
    groups.push({ type: 'channel', label: 'Channels', results: channelResults })
  }

  if (archivedProjectResults.length > 0) {
    groups.push({
      type: 'archived_project',
      label: 'Archived Projects',
      results: archivedProjectResults,
    })
  }

  const total =
    projectResults.length +
    ticketResults.length +
    formResults.length +
    memberResults.length +
    channelResults.length +
    archivedProjectResults.length

  trackServerEvent('search.executed', {
    query_text: trimmed.slice(0, 100),
    result_count: total,
  })

  return { groups, total }
}
