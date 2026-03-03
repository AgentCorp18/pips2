'use server'

import { createClient } from '@/lib/supabase/server'

/* ============================================================
   Types
   ============================================================ */

export type ProjectStats = {
  ticketsCreated: number
  ticketsCompleted: number
  daysActive: number
}

export type ProjectMember = {
  userId: string
  displayName: string
  avatarUrl: string | null
  role: string
}

export type ProjectActivity = {
  id: string
  action: string
  entityType: string
  description: string
  createdAt: string
  userName: string | null
}

/* ============================================================
   getProjectStats
   ============================================================ */

export const getProjectStats = async (projectId: string): Promise<ProjectStats> => {
  const supabase = await createClient()

  const [createdRes, completedRes, projectRes] = await Promise.all([
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'done'),
    supabase.from('projects').select('created_at').eq('id', projectId).single(),
  ])

  const createdAt = projectRes.data?.created_at ? new Date(projectRes.data.created_at) : new Date()
  const daysActive = Math.max(
    1,
    Math.ceil((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    ticketsCreated: createdRes.count ?? 0,
    ticketsCompleted: completedRes.count ?? 0,
    daysActive,
  }
}

/* ============================================================
   getProjectMembers
   ============================================================ */

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('project_members')
    .select(
      `
      user_id,
      role,
      profiles!project_members_user_id_fkey ( display_name, avatar_url )
    `,
    )
    .eq('project_id', projectId)

  if (!members || members.length === 0) return []

  return members.map((m) => {
    const profile = m.profiles as unknown as {
      display_name: string
      avatar_url: string | null
    } | null

    return {
      userId: m.user_id,
      displayName: profile?.display_name ?? 'Unknown',
      avatarUrl: profile?.avatar_url ?? null,
      role: m.role,
    }
  })
}

/* ============================================================
   getProjectActivity
   ============================================================ */

export const getProjectActivity = async (
  projectId: string,
  limit = 10,
): Promise<ProjectActivity[]> => {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_log')
    .select('id, action, entity_type, entity_id, new_data, user_id, created_at')
    .eq('entity_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!logs || logs.length === 0) return []

  const userIds = [...new Set(logs.map((l) => l.user_id).filter(Boolean))] as string[]
  const userMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds)

    if (profiles) {
      for (const p of profiles) {
        userMap.set(p.id, p.display_name)
      }
    }
  }

  return logs.map((log) => {
    const userName = log.user_id ? (userMap.get(log.user_id) ?? 'Unknown') : 'System'
    const newData = log.new_data as Record<string, unknown> | null
    const title = (newData?.title as string) ?? log.entity_type

    let description = ''
    switch (log.action) {
      case 'insert':
        description = `Created ${log.entity_type} "${title}"`
        break
      case 'update':
        description = `Updated ${log.entity_type} "${title}"`
        break
      case 'delete':
        description = `Deleted ${log.entity_type} "${title}"`
        break
      default:
        description = `${log.action} on ${log.entity_type}`
    }

    return {
      id: log.id,
      action: log.action,
      entityType: log.entity_type,
      description,
      createdAt: log.created_at,
      userName,
    }
  })
}
