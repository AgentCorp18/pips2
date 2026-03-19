'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserOrg, requirePermission } from '@/lib/permissions'

interface ActionResult {
  success: boolean
  error?: string
}

export type TeamWithCount = {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  member_count: number
}

export type TeamMember = {
  id: string
  user_id: string
  role: string
  joined_at: string
  profiles: {
    full_name: string
    display_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

export type TeamDetail = {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  org_id: string
  members: TeamMember[]
}

export const getTeams = async (): Promise<TeamWithCount[]> => {
  const supabase = await createClient()

  const membership = await getUserOrg()
  if (!membership) return []

  const orgId = membership.org_id as string

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, description, color, created_at, team_members(id)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  return (teams ?? []).map((t) => ({
    id: t.id as string,
    name: t.name as string,
    description: t.description as string | null,
    color: (t.color as string) ?? '#4F46E5',
    created_at: t.created_at as string,
    member_count: Array.isArray(t.team_members) ? t.team_members.length : 0,
  }))
}

export const createTeam = async (name: string, description?: string): Promise<ActionResult> => {
  try {
    const membership = await getUserOrg()
    if (!membership) return { success: false, error: 'Not authenticated' }

    const orgId = membership.org_id as string
    await requirePermission(orgId, 'org.teams.manage')

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const trimmedName = name.trim()
    if (!trimmedName) return { success: false, error: 'Team name is required' }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        org_id: orgId,
        name: trimmedName,
        description: description?.trim() || null,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'A team with that name already exists' }
      }
      console.error('Failed to create team:', error.message)
      return { success: false, error: 'Failed to create team. Please try again.' }
    }

    // Auto-create a chat channel for the team (best-effort)
    if (team) {
      try {
        const { data: channel } = await supabase
          .from('chat_channels')
          .insert({
            org_id: orgId,
            type: 'team',
            name: trimmedName,
            entity_id: team.id,
            created_by: user.id,
          })
          .select('id')
          .single()

        if (channel) {
          await supabase.from('chat_channel_members').insert({
            channel_id: channel.id,
            user_id: user.id,
          })
        }
      } catch {
        // Non-critical — team was created successfully
      }
    }

    revalidatePath('/teams')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to create team:', message)
    return { success: false, error: 'Failed to create team. Please try again.' }
  }
}

export const deleteTeam = async (teamId: string): Promise<ActionResult> => {
  try {
    const membership = await getUserOrg()
    if (!membership) return { success: false, error: 'Not authenticated' }

    const orgId = membership.org_id as string
    await requirePermission(orgId, 'org.teams.manage')

    const supabase = await createClient()

    // Verify the team belongs to the user's org
    const { data: team } = await supabase
      .from('teams')
      .select('id, org_id')
      .eq('id', teamId)
      .eq('org_id', orgId)
      .single()

    if (!team) return { success: false, error: 'Team not found' }

    const { error } = await supabase.from('teams').delete().eq('id', teamId)

    if (error) {
      console.error('Failed to delete team:', error.message)
      return { success: false, error: 'Failed to delete team. Please try again.' }
    }

    revalidatePath('/teams')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to delete team:', message)
    return { success: false, error: 'Failed to delete team. Please try again.' }
  }
}

export const getTeamDetail = async (teamId: string): Promise<TeamDetail | null> => {
  const supabase = await createClient()

  const membership = await getUserOrg()
  if (!membership) return null

  const orgId = membership.org_id as string

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, description, color, created_at, org_id')
    .eq('id', teamId)
    .eq('org_id', orgId)
    .single()

  if (!team) return null

  const { data: members } = await supabase
    .from('team_members')
    .select('id, user_id, role, joined_at, profiles(full_name, display_name, email, avatar_url)')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true })

  const teamMembers: TeamMember[] = (members ?? []).map((m) => ({
    id: m.id as string,
    user_id: m.user_id as string,
    role: m.role as string,
    joined_at: m.joined_at as string,
    profiles: (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as TeamMember['profiles'],
  }))

  return {
    id: team.id as string,
    name: team.name as string,
    description: team.description as string | null,
    color: (team.color as string) ?? '#4F46E5',
    created_at: team.created_at as string,
    org_id: team.org_id as string,
    members: teamMembers,
  }
}

export const addTeamMember = async (teamId: string, userId: string): Promise<ActionResult> => {
  try {
    const membership = await getUserOrg()
    if (!membership) return { success: false, error: 'Not authenticated' }

    const orgId = membership.org_id as string
    await requirePermission(orgId, 'org.teams.manage')

    const supabase = await createClient()

    // Verify the team belongs to this org
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('org_id', orgId)
      .single()

    if (!team) return { success: false, error: 'Team not found' }

    // Verify the user is a member of the org
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single()

    if (!orgMember) {
      return { success: false, error: 'User is not a member of this organization' }
    }

    const { error } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: userId,
    })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'User is already a member of this team' }
      }
      console.error('Failed to add team member:', error.message)
      return { success: false, error: 'Failed to add team member. Please try again.' }
    }

    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to add team member:', message)
    return { success: false, error: 'Failed to add team member. Please try again.' }
  }
}

/* ============================================================
   getTeamWorkload — ticket counts per member for workload heatmap
   ============================================================ */

export type TeamWorkloadMember = {
  user_id: string
  name: string
  avatar_url: string | null
  open_tickets: number
  in_progress: number
  completed: number
  overdue: number
}

export const getTeamWorkload = async (teamId: string): Promise<TeamWorkloadMember[]> => {
  const supabase = await createClient()

  const membership = await getUserOrg()
  if (!membership) return []

  const orgId = membership.org_id as string

  // Verify team belongs to org
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .eq('org_id', orgId)
    .single()

  if (!team) return []

  // Get team members
  const { data: members } = await supabase
    .from('team_members')
    .select('user_id, profiles(full_name, display_name, avatar_url)')
    .eq('team_id', teamId)

  if (!members || members.length === 0) return []

  const userIds = members.map((m) => m.user_id as string)

  // Get all tickets assigned to team members in this org
  const today = new Date().toISOString().split('T')[0] ?? ''

  const { data: tickets } = await supabase
    .from('tickets')
    .select('assignee_id, status, due_date')
    .eq('org_id', orgId)
    .in('assignee_id', userIds)

  // Build workload map
  const workloadMap = new Map<
    string,
    { open: number; in_progress: number; completed: number; overdue: number }
  >()

  for (const uid of userIds) {
    workloadMap.set(uid, { open: 0, in_progress: 0, completed: 0, overdue: 0 })
  }

  if (tickets) {
    for (const t of tickets) {
      if (!t.assignee_id) continue
      const entry = workloadMap.get(t.assignee_id as string)
      if (!entry) continue

      const status = t.status as string
      if (status === 'done' || status === 'cancelled') {
        entry.completed += 1
      } else {
        entry.open += 1
        if (status === 'in_progress' || status === 'in_review') {
          entry.in_progress += 1
        }
        if (t.due_date && (t.due_date as string) < today) {
          entry.overdue += 1
        }
      }
    }
  }

  return members.map((m) => {
    const profile = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as {
      full_name: string
      display_name: string | null
      avatar_url: string | null
    } | null

    const uid = m.user_id as string
    const workload = workloadMap.get(uid) ?? { open: 0, in_progress: 0, completed: 0, overdue: 0 }

    return {
      user_id: uid,
      name: profile?.display_name ?? profile?.full_name ?? 'Unknown',
      avatar_url: profile?.avatar_url ?? null,
      open_tickets: workload.open,
      in_progress: workload.in_progress,
      completed: workload.completed,
      overdue: workload.overdue,
    }
  })
}

export const removeTeamMember = async (teamId: string, userId: string): Promise<ActionResult> => {
  try {
    const membership = await getUserOrg()
    if (!membership) return { success: false, error: 'Not authenticated' }

    const orgId = membership.org_id as string
    await requirePermission(orgId, 'org.teams.manage')

    const supabase = await createClient()

    // Verify the team belongs to this org
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('org_id', orgId)
      .single()

    if (!team) return { success: false, error: 'Team not found' }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to remove team member:', error.message)
      return { success: false, error: 'Failed to remove team member. Please try again.' }
    }

    revalidatePath(`/teams/${teamId}`)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to remove team member:', message)
    return { success: false, error: 'Failed to remove team member. Please try again.' }
  }
}
