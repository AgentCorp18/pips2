'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/permissions'
import { calculateProjectHealth } from '@pips/shared'
import type { HealthScore } from '@pips/shared'

const TOTAL_FORM_TYPES = 25

/**
 * Fetch all data needed to compute the health score for a project,
 * then return the calculated HealthScore.
 *
 * Returns null when the project does not exist or the caller lacks access.
 */
export const getProjectHealth = async (projectId: string): Promise<HealthScore | null> => {
  const membership = await getUserOrg()
  if (!membership) return null

  const orgId = membership.org_id as string
  const supabase = await createClient()

  // Defense-in-depth: verify the project belongs to the caller's org
  const { data: project } = await supabase
    .from('projects')
    .select('id, created_at')
    .eq('id', projectId)
    .eq('org_id', orgId)
    .maybeSingle()

  if (!project) return null

  // Run all queries in parallel for performance
  const [formsRes, ticketsTotalRes, ticketsDoneRes, lastActivityRes] = await Promise.all([
    // Distinct form types that have been filled out
    supabase.from('project_forms').select('form_type').eq('project_id', projectId),

    // Total tickets
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('org_id', orgId),

    // Done tickets
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('org_id', orgId)
      .eq('status', 'done'),

    // Most recent update across tickets and forms
    Promise.all([
      supabase
        .from('tickets')
        .select('updated_at')
        .eq('project_id', projectId)
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false })
        .limit(1),
      supabase
        .from('project_forms')
        .select('updated_at')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })
        .limit(1),
    ]),
  ])

  // --- Methodology depth (form coverage proxy) ---
  const forms = formsRes.data ?? []
  const distinctFormTypes = new Set(forms.map((f) => f.form_type)).size
  const formsCompletedPercent = Math.round((distinctFormTypes / TOTAL_FORM_TYPES) * 100)

  // We reuse form coverage as methodologyDepthPercent for simplicity.
  // The real calculateMethodologyDepth() uses weighted scoring but for health
  // scoring a simple coverage ratio is sufficient and avoids redundant queries.
  const methodologyDepthPercent = formsCompletedPercent

  // --- Ticket completion ---
  const totalTickets = ticketsTotalRes.count ?? 0
  const doneTickets = ticketsDoneRes.count ?? 0
  const ticketCompletionPercent =
    totalTickets > 0 ? Math.round((doneTickets / totalTickets) * 100) : 0

  // --- Activity freshness ---
  const [ticketActivityRes, formActivityRes] = lastActivityRes
  const latestTicketDate = ticketActivityRes.data?.[0]?.updated_at ?? null
  const latestFormDate = formActivityRes.data?.[0]?.updated_at ?? null

  // Pick the most recent of ticket activity, form activity, or project creation
  const activityDates: Date[] = [new Date(project.created_at)]
  if (latestTicketDate) activityDates.push(new Date(latestTicketDate))
  if (latestFormDate) activityDates.push(new Date(latestFormDate))

  const lastActivity = new Date(Math.max(...activityDates.map((d) => d.getTime())))
  const daysSinceLastActivity = Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
  )

  return calculateProjectHealth({
    methodologyDepthPercent,
    daysSinceLastActivity,
    ticketCompletionPercent,
    formsCompletedPercent,
  })
}
