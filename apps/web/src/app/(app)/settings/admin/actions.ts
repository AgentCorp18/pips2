'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserOrg } from '@/lib/permissions'
import type { OrgRole } from '@pips/shared'

export type AdminMember = {
  id: string
  user_id: string
  role: OrgRole
  joined_at: string
  full_name: string | null
  email: string
  team_count: number
  project_count: number
}

export type AdminStats = {
  memberCount: number
  teamCount: number
  projectCount: number
  activeProjectCount: number
  ticketCount: number
  openTicketCount: number
  formCount: number
}

export type AdminTeam = {
  id: string
  name: string
  member_count: number
}

export type AdminProject = {
  id: string
  title: string
  status: string
  current_step: string
  owner_name: string
  member_count: number
}

export const getAdminData = async () => {
  const membership = await getUserOrg()
  if (!membership) return null

  const role = membership.role as OrgRole
  if (role !== 'owner' && role !== 'admin') return null

  const orgId = membership.org_id as string
  const supabase = await createClient()

  // Fetch all data in parallel
  const [membersResult, teamsResult, projectsResult, ticketsResult, formsResult] =
    await Promise.all([
      supabase
        .from('org_members')
        .select('id, user_id, role, joined_at, profiles(full_name, email)')
        .eq('org_id', orgId)
        .order('joined_at', { ascending: true }),
      supabase.from('teams').select('id, name').eq('org_id', orgId).order('name'),
      supabase
        .from('projects')
        .select(
          'id, title, status, current_step, owner_id, profiles!projects_owner_id_fkey(full_name)',
        )
        .eq('org_id', orgId)
        .order('created_at', { ascending: false }),
      supabase.from('tickets').select('id, status').eq('org_id', orgId),
      supabase.from('project_forms').select('id').eq('org_id', orgId),
    ])

  const members = membersResult.data ?? []
  const teams = teamsResult.data ?? []
  const projects = projectsResult.data ?? []
  const tickets = ticketsResult.data ?? []
  const forms = formsResult.data ?? []

  // Get team member counts
  const teamIds = teams.map((t) => t.id)
  const { data: teamMembers } = teamIds.length
    ? await supabase.from('team_members').select('team_id').in('team_id', teamIds)
    : { data: [] }

  // Get project member counts
  const projectIds = projects.map((p) => p.id)
  const { data: projectMembers } = projectIds.length
    ? await supabase
        .from('project_members')
        .select('project_id, user_id')
        .in('project_id', projectIds)
    : { data: [] }

  // Build team member counts
  const teamMemberCounts: Record<string, number> = {}
  for (const tm of teamMembers ?? []) {
    teamMemberCounts[tm.team_id] = (teamMemberCounts[tm.team_id] ?? 0) + 1
  }

  // Build project member counts + per-user project counts
  const projectMemberCounts: Record<string, number> = {}
  const userProjectCounts: Record<string, number> = {}
  for (const pm of projectMembers ?? []) {
    projectMemberCounts[pm.project_id] = (projectMemberCounts[pm.project_id] ?? 0) + 1
    userProjectCounts[pm.user_id] = (userProjectCounts[pm.user_id] ?? 0) + 1
  }

  // Build per-user team counts
  const userTeamCounts: Record<string, number> = {}
  const { data: allTeamMembers } = teamIds.length
    ? await supabase.from('team_members').select('user_id').in('team_id', teamIds)
    : { data: [] }
  for (const tm of allTeamMembers ?? []) {
    userTeamCounts[tm.user_id] = (userTeamCounts[tm.user_id] ?? 0) + 1
  }

  type ProfileData = { full_name: string | null; email: string }

  const adminMembers: AdminMember[] = members.map((m) => {
    const profileRaw = m.profiles as unknown
    const profile = Array.isArray(profileRaw)
      ? (profileRaw[0] as ProfileData | undefined)
      : (profileRaw as ProfileData | null)
    return {
      id: m.id,
      user_id: m.user_id,
      role: m.role as OrgRole,
      joined_at: m.joined_at as string,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? '',
      team_count: userTeamCounts[m.user_id] ?? 0,
      project_count: userProjectCounts[m.user_id] ?? 0,
    }
  })

  const adminTeams: AdminTeam[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    member_count: teamMemberCounts[t.id] ?? 0,
  }))

  type OwnerProfile = { full_name: string | null }

  const adminProjects: AdminProject[] = projects.map((p) => {
    const ownerRaw = p.profiles as unknown
    const owner = Array.isArray(ownerRaw)
      ? (ownerRaw[0] as OwnerProfile | undefined)
      : (ownerRaw as OwnerProfile | null)
    return {
      id: p.id,
      title: p.title as string,
      status: p.status ?? 'active',
      current_step: (p.current_step as string) ?? 'identify',
      owner_name: owner?.full_name ?? 'Unknown',
      member_count: projectMemberCounts[p.id] ?? 0,
    }
  })

  const activeProjectCount = projects.filter((p) => p.status === 'active').length
  const openTicketCount = tickets.filter(
    (t) => t.status !== 'done' && t.status !== 'cancelled',
  ).length

  const stats: AdminStats = {
    memberCount: members.length,
    teamCount: teams.length,
    projectCount: projects.length,
    activeProjectCount,
    ticketCount: tickets.length,
    openTicketCount,
    formCount: forms.length,
  }

  return {
    role,
    orgId,
    stats,
    members: adminMembers,
    teams: adminTeams,
    projects: adminProjects,
  }
}
