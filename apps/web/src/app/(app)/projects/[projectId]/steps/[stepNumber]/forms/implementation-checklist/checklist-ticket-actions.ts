'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'

type ChecklistItem = {
  text: string
  assignee: string
  completed: boolean
}

type CreateTicketsResult = {
  created: number
  error?: string
}

/**
 * Bulk-create tickets from implementation checklist items.
 * Only incomplete items with non-empty text are converted into tickets.
 */
export const createTicketsFromChecklist = async (
  projectId: string,
  items: ChecklistItem[],
): Promise<CreateTicketsResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { created: 0, error: 'You must be signed in' }
  }

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    return { created: 0, error: 'You must belong to an organization' }
  }

  // Filter to incomplete items with text
  const incomplete = items.filter((item) => !item.completed && item.text.trim().length > 0)

  if (incomplete.length === 0) {
    return { created: 0, error: 'No incomplete items to create tickets from' }
  }

  // Load org members to match assignees by display_name
  const { data: orgMembers } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey(full_name, display_name)')
    .eq('org_id', currentOrg.orgId)

  const memberMap = new Map<string, string>()
  if (orgMembers) {
    for (const member of orgMembers) {
      const profiles = member.profiles as unknown as {
        full_name: string
        display_name: string | null
      } | null
      const name = profiles?.display_name || profiles?.full_name
      if (name) {
        memberMap.set(name.toLowerCase(), member.user_id)
      }
    }
  }

  // Build ticket rows
  const ticketRows = incomplete.map((item) => {
    const assigneeName = item.assignee.trim().toLowerCase()
    const assigneeId = assigneeName ? (memberMap.get(assigneeName) ?? null) : null

    return {
      org_id: currentOrg.orgId,
      project_id: projectId,
      title: item.text.trim(),
      type: 'task' as const,
      status: 'todo' as const,
      priority: 'medium' as const,
      pips_step: 'implement' as const,
      assignee_id: assigneeId,
      reporter_id: user.id,
      tags: [] as string[],
    }
  })

  const { error: insertError } = await supabase.from('tickets').insert(ticketRows)

  if (insertError) {
    console.error('Failed to create tickets from checklist:', insertError.message)
    return { created: 0, error: 'Failed to create tickets. Please try again.' }
  }

  revalidatePath('/tickets')
  revalidatePath(`/projects/${projectId}/steps/5`)

  return { created: ticketRows.length }
}
