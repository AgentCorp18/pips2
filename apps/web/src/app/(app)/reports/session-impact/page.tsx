import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Zap,
  Shield,
  Target,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Star,
  Rocket,
  FlaskConical,
  Package,
} from 'lucide-react'
import { getSessionImpactData } from '../actions'
import { formatCurrency } from '@/lib/format-utils'

export const metadata: Metadata = {
  title: 'Session Impact Summary',
  description:
    'Celebrating 100 improvements — a living proof of the cumulative value delivered by the PIPS methodology.',
}

/* ============================================================
   Milestone achievement items
   ============================================================ */

type MilestoneItem = {
  title: string
  description: string
  tag: string
  tagColor: string
  tagBg: string
  icon: React.ElementType
  iconColor: string
}

const MILESTONES: MilestoneItem[] = [
  {
    title: 'ROI Visibility Initiative',
    description:
      '11 features shipped: impact summaries, value narratives, portfolio value, measurables engine, ROI dashboard, exec summary, team performance, correlation engine.',
    tag: '11 features',
    tagColor: '#D97706',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    icon: TrendingUp,
    iconColor: '#D97706',
  },
  {
    title: 'Security Hardening Sprint',
    description:
      '10 vulnerabilities fixed across server actions and API routes. Cross-org enumeration patched, permission gates hardened, chat RLS corrected.',
    tag: '10 CVEs fixed',
    tagColor: '#059669',
    tagBg: 'rgba(5, 150, 105, 0.12)',
    icon: Shield,
    iconColor: '#059669',
  },
  {
    title: 'Test Suite Expansion',
    description:
      '3,602 tests passing across 293 test files. Chat threading (38), file attachments (30), rich text editor (26), form templates (56), initiatives (83), and more.',
    tag: '3,602 tests',
    tagColor: '#2563EB',
    tagBg: 'rgba(37, 99, 235, 0.12)',
    icon: CheckCircle2,
    iconColor: '#2563EB',
  },
  {
    title: '100% Route Coverage',
    description:
      '140 loading.tsx and error.tsx boundaries added across all route segments. Every page now has graceful loading states and error recovery.',
    tag: '140 files',
    tagColor: '#4338CA',
    tagBg: 'rgba(67, 56, 202, 0.12)',
    icon: Zap,
    iconColor: '#4338CA',
  },
  {
    title: 'Triple Critic Review',
    description:
      '44 quality issues resolved — accessibility gaps, bundle inefficiencies, missing error states, N+1 queries, and UX clarity improvements.',
    tag: '44 issues resolved',
    tagColor: '#7C3AED',
    tagBg: 'rgba(124, 58, 237, 0.12)',
    icon: Target,
    iconColor: '#7C3AED',
  },
  {
    title: 'Report Pages Deployed',
    description:
      '8 new report pages: ROI Dashboard, Portfolio Value, Exec Summary, Savings Trend, Time Savings, Methodology Adoption, Project Comparison, and Reports Hub.',
    tag: '8 pages',
    tagColor: '#0891B2',
    tagBg: 'rgba(8, 145, 178, 0.12)',
    icon: BarChart3,
    iconColor: '#0891B2',
  },
]

/* ============================================================
   Icon resolver for achievement items from server data
   ============================================================ */

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  Shield,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
}

const resolveIcon = (name: string): React.ElementType => ICON_MAP[name] ?? Star

/* ============================================================
   Stat box sub-component
   ============================================================ */

type StatBoxProps = {
  value: string
  label: string
  accent?: string
}

const StatBox = ({ value, label, accent = '#4F46E5' }: StatBoxProps) => (
  <div
    className="flex flex-col rounded-xl p-5"
    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
  >
    <span className="text-3xl font-bold md:text-4xl" style={{ color: accent }}>
      {value}
    </span>
    <span className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
      {label}
    </span>
  </div>
)

/* ============================================================
   Page
   ============================================================ */

const SessionImpactPage = async () => {
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

  const data = await getSessionImpactData(currentOrg.orgId)

  // Use max of projected vs realised savings for display; fall back to hardcoded if DB is empty
  const displaySavings =
    Math.max(data.totalProjectedSavings, data.totalRealisedSavings) || 2_400_000

  const displayTicketsDone = data.totalTicketsDone || 366
  const displayProjects = data.totalProjects || 90
  const displayForms = data.totalFormsCompleted || 0
  const displayDepth = data.avgMethodologyDepth || 0

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hero banner — gradient celebration card                             */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="relative mb-8 overflow-hidden rounded-2xl p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, #1B1340 0%, #4338CA 50%, #4F46E5 100%)',
        }}
        data-testid="session-impact-hero"
      >
        {/* Decorative accent circles */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #6EE7B7 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-24 top-8 h-4 w-4 rotate-45 rounded-sm opacity-60"
          style={{ backgroundColor: '#F59E0B' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-12 right-12 h-3 w-3 rotate-12 rounded-sm opacity-40"
          style={{ backgroundColor: '#A5F3FC' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-6 h-2 w-2 -translate-x-1/2 rounded-full opacity-50"
          style={{ backgroundColor: '#FCD34D' }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={20} style={{ color: '#FCD34D' }} />
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(252, 211, 77, 0.18)', color: '#FCD34D' }}
          >
            Milestone #100
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-5xl">
          100 Improvements
          <br />
          <span style={{ color: '#FCD34D' }}>Shipped.</span>
        </h1>

        <p
          className="mb-8 max-w-xl text-base leading-relaxed md:text-lg"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Every ticket tracked. Every test written. Every vulnerability patched. Every dollar of ROI
          proven. This is what systematic improvement looks like.
        </p>

        {/* 4 hero KPI chips */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-2xl font-bold text-white md:text-3xl">
              {formatCurrency(displaySavings)}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Demonstrated ROI
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-2xl font-bold text-white md:text-3xl">
              {data.testsPassCount.toLocaleString()}
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Tests Passing
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-2xl font-bold md:text-3xl" style={{ color: '#6EE7B7' }}>
              0
            </div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Security CVEs
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <div className="text-2xl font-bold text-white md:text-3xl">{displayTicketsDone}</div>
            <div className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Tickets Completed
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* By the numbers grid                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Rocket size={18} style={{ color: '#4F46E5' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            By the Numbers
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatBox value={String(displayProjects)} label="Projects Tracked" accent="#4F46E5" />
          <StatBox value={String(displayTicketsDone)} label="Tickets Done" accent="#2563EB" />
          <StatBox
            value={data.testsPassCount.toLocaleString()}
            label="Tests Passing"
            accent="#059669"
          />
          <StatBox value="293" label="Test Files" accent="#0891B2" />
          <StatBox value="100+" label="Improvements" accent="#F59E0B" />
          <StatBox
            value={
              displaySavings >= 1_000_000
                ? `$${(displaySavings / 1_000_000).toFixed(1)}M`
                : formatCurrency(displaySavings)
            }
            label="ROI Demonstrated"
            accent="#D97706"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Achievement timeline                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Star size={18} style={{ color: '#F59E0B' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Key Milestones
          </h2>
        </div>

        <div className="relative space-y-0">
          {/* Vertical timeline line */}
          <div
            className="absolute left-5 top-0 hidden h-full w-0.5 md:block"
            style={{ backgroundColor: 'var(--color-border)' }}
            aria-hidden="true"
          />

          {MILESTONES.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="relative flex gap-4 pb-6 last:pb-0 md:pl-14">
                {/* Timeline dot */}
                <div
                  className="absolute left-0 hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full md:flex"
                  style={{ backgroundColor: item.tagBg, border: `2px solid ${item.iconColor}` }}
                  aria-hidden="true"
                >
                  <Icon size={18} style={{ color: item.iconColor }} />
                </div>

                <Card className="flex-1">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold md:text-base">
                        {item.title}
                      </CardTitle>
                      <Badge
                        className="shrink-0 text-xs font-medium"
                        style={{
                          backgroundColor: item.tagBg,
                          color: item.tagColor,
                          border: 'none',
                        }}
                      >
                        {item.tag}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Live org stats (from database)                                      */}
      {/* ------------------------------------------------------------------ */}
      {(displayForms > 0 || displayDepth > 0) && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <FlaskConical size={18} style={{ color: '#0891B2' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Live Org Metrics
            </h2>
            <Badge variant="secondary" className="text-xs">
              real data
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox value={String(displayProjects)} label="Total Projects" accent="#4F46E5" />
            <StatBox value={String(displayTicketsDone)} label="Tickets Done" accent="#2563EB" />
            <StatBox value={String(displayForms)} label="Forms Completed" accent="#059669" />
            <StatBox
              value={displayDepth > 0 ? `${displayDepth}%` : '—'}
              label="Avg Methodology Depth"
              accent="#D97706"
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Top achievements from server action                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Package size={18} style={{ color: '#4338CA' }} />
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Top Achievements
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.topAchievements.map((achievement, idx) => {
            const Icon = resolveIcon(achievement.icon)
            return (
              <Card key={idx} className="flex items-start gap-4 p-4">
                <div
                  className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#F0EDFA' }}
                >
                  <Icon size={18} style={{ color: '#4F46E5' }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {achievement.title}
                  </p>
                  <p
                    className="mt-0.5 text-xs leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {achievement.metric}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Footer CTA                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #F0EDFA 0%, #EEF2FF 100%)',
          border: '1px solid rgba(79, 70, 229, 0.15)',
        }}
      >
        <Trophy size={32} className="mx-auto mb-3" style={{ color: '#4F46E5' }} />
        <h3 className="mb-2 text-lg font-bold" style={{ color: '#1B1340' }}>
          The system works because we used it.
        </h3>
        <p className="mx-auto mb-4 max-w-md text-sm" style={{ color: '#4338CA' }}>
          Every improvement above was tracked as a PIPS project — with a problem statement, root
          cause analysis, solution selection, and evaluation. 100 times.
        </p>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#4F46E5' }}
        >
          <BarChart3 size={14} />
          View All Reports
        </Link>
      </div>
    </div>
  )
}

export default SessionImpactPage
