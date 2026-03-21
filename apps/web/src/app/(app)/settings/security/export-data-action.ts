'use server'

import { createClient } from '@/lib/supabase/server'

export type DataExportResult = {
  data?: string // JSON string
  filename?: string
  error?: string
}

export const exportUserData = async (): Promise<DataExportResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Collect all user data in parallel
  const [profile, memberships, projects, tickets, forms, comments, notifications, auditLog] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, display_name, avatar_url, created_at')
        .eq('id', user.id)
        .single(),
      supabase.from('org_members').select('*, organizations(name, slug)').eq('user_id', user.id),
      supabase
        .from('projects')
        .select('id, title, description, status, current_step, created_at')
        .eq('owner_id', user.id),
      supabase
        .from('tickets')
        .select('id, title, description, status, priority, type, created_at')
        .eq('reporter_id', user.id),
      supabase
        .from('project_forms')
        .select('id, step, form_type, title, data, created_at')
        .eq('created_by', user.id),
      supabase.from('comments').select('id, body, created_at').eq('author_id', user.id),
      supabase
        .from('notifications')
        .select('id, type, title, message, read, created_at')
        .eq('user_id', user.id),
      supabase
        .from('audit_log')
        .select('id, action, resource_type, resource_id, created_at')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500),
    ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
    profile: profile.data,
    organizations: memberships.data ?? [],
    projects: projects.data ?? [],
    tickets: tickets.data ?? [],
    forms: forms.data ?? [],
    comments: comments.data ?? [],
    notifications: notifications.data ?? [],
    auditLog: auditLog.data ?? [],
  }

  const filename = `pips-data-export-${new Date().toISOString().slice(0, 10)}.json`

  return {
    data: JSON.stringify(exportData, null, 2),
    filename,
  }
}
