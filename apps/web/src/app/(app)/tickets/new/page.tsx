import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TicketCreateForm } from '@/components/tickets/ticket-create-form'
import { getParentTicket } from '../actions'

export const metadata: Metadata = {
  title: 'New Ticket - PIPS',
  description: 'Create a new ticket',
}

type NewTicketPageProps = {
  searchParams: Promise<{ parent?: string }>
}

const NewTicketPage = async ({ searchParams }: NewTicketPageProps) => {
  const { parent: parentId } = await searchParams
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

  // Fetch parent ticket if creating a sub-ticket
  let parentContext: { id: string; title: string; sequenceId: string } | null = null
  if (parentId) {
    const parentData = await getParentTicket(parentId)
    if (parentData) {
      const { data: parentOrgSettings } = await supabase
        .from('org_settings')
        .select('ticket_prefix')
        .eq('org_id', parentData.org_id)
        .single()
      const prefix = parentOrgSettings?.ticket_prefix ?? 'TKT'
      parentContext = {
        id: parentData.id,
        title: parentData.title,
        sequenceId: `${prefix}-${parentData.sequence_number}`,
      }
    }
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
    .select('id, title')
    .eq('org_id', membership.org_id)
    .neq('status', 'archived')
    .order('title')

  const projects = (projectsRaw ?? []).map((p) => ({
    id: p.id,
    name: p.title as string,
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{parentContext ? 'Create Sub-Ticket' : 'Create New Ticket'}</CardTitle>
          {parentContext && (
            <CardDescription>
              Creating sub-ticket under{' '}
              <span className="font-mono font-medium">{parentContext.sequenceId}</span>{' '}
              {parentContext.title}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <TicketCreateForm members={members} projects={projects} parentId={parentContext?.id} />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewTicketPage
