import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, Ticket, Users, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - PIPS',
  description: 'Your PIPS dashboard overview',
}

const PLACEHOLDER_CARDS = [
  {
    title: 'Active Projects',
    value: '0',
    description: 'No projects yet',
    icon: FolderKanban,
    color: 'var(--color-step-1)',
  },
  {
    title: 'Open Tickets',
    value: '0',
    description: 'No tickets yet',
    icon: Ticket,
    color: 'var(--color-step-2)',
  },
  {
    title: 'Team Members',
    value: '1',
    description: 'Just you for now',
    icon: Users,
    color: 'var(--color-step-3)',
  },
  {
    title: 'Improvements',
    value: '0',
    description: 'Start your first PIPS cycle',
    icon: TrendingUp,
    color: 'var(--color-step-4)',
  },
]

const DashboardPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('name, slug, plan')
    .eq('id', membership.org_id)
    .single()

  if (!org) {
    redirect('/onboarding')
  }

  const roleLabel = membership.role as string

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Welcome header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {org.name}
          </h1>
          <Badge variant="secondary">
            {roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}
          </Badge>
          <Badge variant="outline">{org.plan} plan</Badge>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Welcome to your PIPS dashboard. Here is an overview of your workspace.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEHOLDER_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {card.title}
                </CardTitle>
                <Icon size={18} style={{ color: card.color }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {card.value}
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Getting started card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Get started with PIPS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-step-1)' }}
              >
                1
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Create your first project to organize improvement work
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-step-2)' }}
              >
                2
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Invite your team members to collaborate
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--color-step-3)' }}
              >
                3
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Start your first PIPS cycle — identify a process to improve
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
