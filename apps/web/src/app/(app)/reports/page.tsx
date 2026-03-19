import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  BarChart3,
  Users,
  Target,
  FileText,
  ArrowRight,
  Briefcase,
  BookOpen,
  Clock,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { getReportsHubData } from './actions'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'View reporting insights across your projects, team, and methodology usage.',
}

/** Format a dollar amount with K/M suffix for compact display */
const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${value.toLocaleString()}`
}

/** Format hours with K suffix if large */
const formatHours = (value: number): string => {
  if (value >= 1_000) return `${Math.round(value / 1_000)}K hrs`
  return `${value} hrs`
}

type ReportCategoryCard = {
  title: string
  description: string
  href: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  preview: string
}

type ReportCategory = {
  heading: string
  subheading: string
  cards: ReportCategoryCard[]
}

const ReportsPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  const data = await getReportsHubData(currentOrg.orgId)

  const depthColor =
    data.avgMethodologyDepth >= 70
      ? '#059669'
      : data.avgMethodologyDepth >= 40
        ? '#D97706'
        : '#DC2626'

  const CATEGORIES: ReportCategory[] = [
    {
      heading: 'ROI & Savings',
      subheading: 'Measure financial impact and business value',
      cards: [
        {
          title: 'ROI Dashboard',
          description:
            'Track financial impact, savings trends, and methodology-outcome correlation.',
          href: '/reports/roi-dashboard',
          icon: TrendingUp,
          iconColor: '#D97706',
          iconBg: 'rgba(245, 158, 11, 0.12)',
          preview:
            data.projectedSavingsPreview > 0
              ? `${formatCurrency(data.projectedSavingsPreview)} projected savings`
              : `${data.totalMeasurablesTracked} measurables tracked`,
        },
        {
          title: 'Portfolio Value',
          description: 'View all projects with value narratives and outcome summaries.',
          href: '/reports/portfolio-value',
          icon: Briefcase,
          iconColor: '#4F46E5',
          iconBg: 'rgba(79, 70, 229, 0.12)',
          preview:
            data.totalProjectsCompleted > 0
              ? `${data.totalProjectsCompleted} projects completed`
              : `${data.activeProjects} active projects`,
        },
        {
          title: 'Executive Summary',
          description: 'One-click printable report with hero KPIs for stakeholders.',
          href: '/reports/executive-summary',
          icon: FileText,
          iconColor: '#0891B2',
          iconBg: 'rgba(8, 145, 178, 0.12)',
          preview: `${data.totalProjectsCompleted + data.activeProjects} total projects tracked`,
        },
      ],
    },
    {
      heading: 'Methodology & Quality',
      subheading: 'Analyze PIPS adoption, depth, and process quality',
      cards: [
        {
          title: 'Methodology Report',
          description: 'Depth scores, step completion rates, and tool usage analytics.',
          href: '/reports/methodology',
          icon: BookOpen,
          iconColor: '#059669',
          iconBg: 'rgba(5, 150, 105, 0.12)',
          preview:
            data.formsCompleted > 0 ? `${data.formsCompleted} forms completed` : 'No forms yet',
        },
        {
          title: 'Team Report',
          description: 'Per-team performance metrics and individual contribution tracking.',
          href: '/reports/team',
          icon: Users,
          iconColor: '#6366F1',
          iconBg: 'rgba(99, 102, 241, 0.12)',
          preview: `${data.totalMembers} team member${data.totalMembers !== 1 ? 's' : ''}`,
        },
        {
          title: 'Project Report',
          description: 'Individual project analytics, cycle times, and velocity trends.',
          href: '/reports/projects',
          icon: BarChart3,
          iconColor: '#2563EB',
          iconBg: 'rgba(37, 99, 235, 0.12)',
          preview:
            data.avgCycleTimeDays !== null
              ? `${data.avgCycleTimeDays}d avg cycle time`
              : `${data.activeProjects} active projects`,
        },
      ],
    },
  ]

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="reports-heading"
        >
          Reports
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          ROI tracking, methodology insights, and performance analytics for your organization.
        </p>
      </div>

      {/* Hero KPI banner */}
      <div
        className="mb-8 overflow-hidden rounded-xl p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, #1B1340 0%, #4F46E5 100%)',
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Target size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Organization Impact
          </span>
        </div>
        <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl">
          Your PIPS ROI at a Glance
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-3xl font-bold text-white md:text-4xl">
              {data.totalProjectsCompleted}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Projects Completed
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white md:text-4xl">
              {data.totalMeasurablesTracked}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Measurables Tracked
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold md:text-4xl" style={{ color: '#FCD34D' }}>
              {data.projectedAnnualSavings > 0 ? formatCurrency(data.projectedAnnualSavings) : '—'}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Projected Annual Savings
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold md:text-4xl" style={{ color: '#6EE7B7' }}>
              {data.hoursSavedAnnually > 0 ? formatHours(data.hoursSavedAnnually) : '—'}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Hours Saved Annually
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Avg Methodology Depth
              </div>
              <div
                className="mt-1 text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {data.avgMethodologyDepth}%
              </div>
            </div>
            <span
              className="mt-0.5 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: depthColor }}
            >
              {data.avgMethodologyDepth >= 70
                ? 'Strong'
                : data.avgMethodologyDepth >= 40
                  ? 'Good'
                  : 'Low'}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Avg Cycle Time
          </div>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {data.avgCycleTimeDays !== null ? data.avgCycleTimeDays : '—'}
            </span>
            {data.avgCycleTimeDays !== null && (
              <span className="mb-0.5 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                days
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <Clock size={11} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              per completed project
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Achievement Rate
          </div>
          <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {data.achievementRate !== null ? `${data.achievementRate}%` : '—'}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              projects with results data
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Forms Completed
          </div>
          <div className="mt-1 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {data.formsCompleted}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <Layers size={11} style={{ color: 'var(--color-text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              PIPS methodology tools
            </span>
          </div>
        </Card>
      </div>

      {/* Report categories */}
      <div className="space-y-8">
        {CATEGORIES.map((category) => (
          <section key={category.heading}>
            <div className="mb-4">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {category.heading}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {category.subheading}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.cards.map((card) => {
                const Icon = card.icon
                return (
                  <Link key={card.href} href={card.href} className="group">
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: card.iconBg }}
                          >
                            <Icon size={20} style={{ color: card.iconColor }} />
                          </div>
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                            style={{ color: 'var(--color-text-tertiary)' }}
                          />
                        </div>
                        <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary">{card.preview}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ReportsPage
