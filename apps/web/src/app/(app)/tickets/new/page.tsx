import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TicketCreateForm } from '@/components/tickets/ticket-create-form'
import { getParentTicket } from '../actions'

export const metadata: Metadata = {
  title: 'New Ticket',
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

  // Get user's active org (respects org switcher cookie)
  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  // Validate parent search param is a well-formed UUID before hitting the DB
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const validatedParentId = parentId && UUID_REGEX.test(parentId) ? parentId : undefined

  // Fetch parent ticket if creating a sub-ticket
  let parentContext: { id: string; title: string; sequenceId: string } | null = null
  if (validatedParentId) {
    const parentData = await getParentTicket(validatedParentId)
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
    .select('user_id, profiles!org_members_user_id_fkey ( full_name, display_name )')
    .eq('org_id', currentOrg.orgId)

  const members = (membersRaw ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      full_name: string
      display_name: string | null
    } | null
    return {
      user_id: m.user_id,
      display_name: profile?.display_name || profile?.full_name || 'Unknown',
    }
  })

  // Fetch projects for project selector
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select('id, title')
    .eq('org_id', currentOrg.orgId)
    .neq('status', 'archived')
    .order('title')

  const projects = (projectsRaw ?? []).map((p) => ({
    id: p.id,
    name: p.title as string,
  }))

  const isAdminOrOwner = currentOrg.role === 'admin' || currentOrg.role === 'owner'

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle data-testid="new-ticket-heading">
            {parentContext ? 'Create Sub-Ticket' : 'Create New Ticket'}
          </CardTitle>
          {parentContext && (
            <CardDescription>
              Creating sub-ticket under{' '}
              <span className="font-mono font-medium">{parentContext.sequenceId}</span>{' '}
              {parentContext.title}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <TicketCreateForm
            members={members}
            projects={projects}
            parentId={parentContext?.id}
            initialExpanded
            isAdminOrOwner={isAdminOrOwner}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default NewTicketPage
