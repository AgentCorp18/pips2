'use server'

import { createClient } from '@/lib/supabase/server'
import { generateCSV } from '@/lib/csv'

/* ============================================================
   Shared helpers
   ============================================================ */

type ExportResult = {
  csv?: string
  error?: string
}

const getUserOrg = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, orgId: null as string | null }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return { supabase, orgId: membership?.org_id ?? null }
}

/* ============================================================
   exportProjectsCSV
   ============================================================ */

export const exportProjectsCSV = async (): Promise<ExportResult> => {
  const { supabase, orgId } = await getUserOrg()

  if (!orgId) {
    return { error: 'You must be signed in to an organization' }
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      title,
      status,
      current_step,
      created_at,
      updated_at,
      profiles!projects_owner_id_fkey ( display_name )
    `,
    )
    .eq('org_id', orgId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to export projects:', error.message)
    return { error: 'Failed to export projects. Please try again.' }
  }

  const headers = ['ID', 'Name', 'Status', 'Current Step', 'Owner', 'Created At', 'Updated At']

  const rows = (projects ?? []).map((p) => {
    const profilesRaw = p.profiles as unknown
    const ownerProfile = Array.isArray(profilesRaw)
      ? ((profilesRaw[0] as { display_name: string } | undefined) ?? null)
      : (profilesRaw as { display_name: string } | null)

    return [
      p.id,
      p.title,
      p.status ?? '',
      String(p.current_step ?? ''),
      ownerProfile?.display_name ?? '',
      p.created_at ?? '',
      p.updated_at ?? '',
    ]
  })

  return { csv: generateCSV(headers, rows) }
}

/* ============================================================
   exportTicketsCSV
   ============================================================ */

export const exportTicketsCSV = async (projectId?: string): Promise<ExportResult> => {
  const { supabase, orgId } = await getUserOrg()

  if (!orgId) {
    return { error: 'You must be signed in to an organization' }
  }

  let query = supabase
    .from('tickets')
    .select(
      `
      id,
      sequence_number,
      title,
      status,
      priority,
      type,
      due_date,
      created_at,
      assignee:profiles!tickets_assignee_id_fkey ( display_name ),
      project:projects!tickets_project_id_fkey ( title )
    `,
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data: tickets, error } = await query

  if (error) {
    console.error('Failed to export tickets:', error.message)
    return { error: 'Failed to export tickets. Please try again.' }
  }

  const headers = [
    'ID',
    'Sequence #',
    'Title',
    'Status',
    'Priority',
    'Type',
    'Assignee',
    'Project',
    'Created At',
    'Due Date',
  ]

  const rows = (tickets ?? []).map((t) => {
    const assignee = t.assignee as unknown as {
      display_name: string
    } | null
    const project = t.project as unknown as { title: string } | null

    return [
      t.id,
      String(t.sequence_number ?? ''),
      t.title,
      t.status ?? '',
      t.priority ?? '',
      t.type ?? '',
      assignee?.display_name ?? '',
      project?.title ?? '',
      t.created_at ?? '',
      t.due_date ?? '',
    ]
  })

  return { csv: generateCSV(headers, rows) }
}
