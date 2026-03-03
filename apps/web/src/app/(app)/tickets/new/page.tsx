import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketCreateForm } from '@/components/tickets/ticket-create-form'

export const metadata: Metadata = {
  title: 'New Ticket - PIPS',
  description: 'Create a new ticket',
}

const NewTicketPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    redirect('/onboarding')
  }

  // Fetch org members for assignee selector
  const { data: membersRaw } = await supabase
    .from('org_members')
    .select('user_id, profiles!org_members_user_id_fkey ( display_name )')
    .eq('org_id', membership.org_id)

  const members = (membersRaw ?? []).map((m) => {
    const profile = m.profiles as unknown as { display_name: string } | null
    return {
      user_id: m.user_id,
      display_name: profile?.display_name ?? 'Unknown',
    }
  })

  // Fetch projects for project selector
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, name')
    .eq('org_id', membership.org_id)
    .is('archived_at', null)
    .order('name')

  const projects = (projectsRaw ?? []).map((p) => ({
    id: p.id,
    name: p.name,
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketCreateForm members={members} projects={projects} />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewTicketPage
