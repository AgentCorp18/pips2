import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, Users, BookOpen, ArrowRight } from 'lucide-react'
import { getReportsHubStats } from './actions'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'View reporting insights across your projects, team, and methodology usage.',
}

const REPORT_CARDS = [
  {
    title: 'Project Health',
    description:
      'Track project progress, step distribution, and ticket velocity across your portfolio.',
    href: '/reports/projects',
    icon: FolderKanban,
    color: '#3B82F6',
    metricKey: 'activeProjects' as const,
    metricLabel: 'active projects',
  },
  {
    title: 'Team Activity',
    description: 'Monitor team engagement, individual contributions, and activity trends.',
    href: '/reports/team',
    icon: Users,
    color: '#6366F1',
    metricKey: 'totalMembers' as const,
    metricLabel: 'team members',
  },
  {
    title: 'Methodology Insights',
    description: 'Analyze PIPS methodology adoption, tool usage, and step completion patterns.',
    href: '/reports/methodology',
    icon: BookOpen,
    color: '#10B981',
    metricKey: 'formsCompleted' as const,
    metricLabel: 'forms completed',
  },
]

const ReportsPage = async () => {
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
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const stats = await getReportsHubStats(membership.org_id)

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="reports-heading"
        >
          Reports
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Gain insights into your projects, team performance, and methodology usage.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Overview KPI row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.activeProjects}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.openTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.totalMembers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Forms Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {stats.formsCompleted}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_CARDS.map((card) => {
          const Icon = card.icon
          const metricValue = stats[card.metricKey]

          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${card.color}15` }}
                    >
                      <Icon size={20} style={{ color: card.color }} />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-1"
                    />
                  </div>
                  <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {metricValue} {card.metricLabel}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ReportsPage
