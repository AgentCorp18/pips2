import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  CheckCircle2,
  TicketCheck,
  FileText,
  Brain,
  Lightbulb,
  BookOpen,
  Timer,
  Target,
} from 'lucide-react'
import type { OrgImpactSummary as OrgImpactSummaryData } from '@/app/(app)/dashboard/actions'

type OrgImpactSummaryProps = {
  data: OrgImpactSummaryData
}

const depthColor = (score: number | null): string => {
  if (score === null) return 'var(--color-text-tertiary)'
  if (score >= 70) return '#22C55E'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

const depthVariant = (
  score: number | null,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (score === null) return 'outline'
  if (score >= 70) return 'default'
  if (score >= 40) return 'secondary'
  return 'destructive'
}

type MetricCardProps = {
  icon: typeof Trophy
  iconBg: string
  iconColor: string
  value: string
  label: string
  testId: string
  badge?: React.ReactNode
}

const MetricCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  testId,
  badge,
}: MetricCardProps) => (
  <Card data-testid={testId}>
    <CardContent className="flex items-center gap-3 py-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {value}
          </p>
          {badge}
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {label}
        </p>
      </div>
    </CardContent>
  </Card>
)

export const OrgImpactSummary = ({ data }: OrgImpactSummaryProps) => {
  const depthScore = data.avgMethodologyDepth
  const depthBadge =
    depthScore !== null ? (
      <Badge variant={depthVariant(depthScore)} className="text-xs py-0 px-1.5">
        {depthScore}/100
      </Badge>
    ) : undefined

  return (
    <div data-testid="org-impact-summary">
      <Card className="mb-4" style={{ borderColor: 'var(--color-primary)', borderWidth: 1 }}>
        <CardHeader className="pb-3">
          <CardTitle
            className="flex items-center gap-2 text-base"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Trophy size={18} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            Your PIPS Impact
          </CardTitle>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Cumulative results from your process improvement work
          </p>
        </CardHeader>

        {/* Hero number */}
        <CardContent className="pb-0">
          <div
            className="mb-6 flex items-center gap-4 rounded-lg p-4"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div>
              <p
                className="text-5xl font-bold"
                style={{ color: 'var(--color-primary)' }}
                data-testid="impact-hero-projects-completed"
              >
                {data.projectsCompleted}
              </p>
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Projects Completed
              </p>
            </div>
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)', opacity: 0.12 }}
              />
              <Target size={32} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={CheckCircle2}
              iconBg="rgba(34, 197, 94, 0.12)"
              iconColor="#22C55E"
              value={String(data.projectsCompleted)}
              label="Projects Completed"
              testId="impact-projects-completed"
            />
            <MetricCard
              icon={TicketCheck}
              iconBg="rgba(59, 130, 246, 0.12)"
              iconColor="#3B82F6"
              value={String(data.ticketsResolved)}
              label="Tickets Resolved"
              testId="impact-tickets-resolved"
            />
            <MetricCard
              icon={FileText}
              iconBg="rgba(168, 85, 247, 0.12)"
              iconColor="#8B5CF6"
              value={String(data.formsCompleted)}
              label="Forms Completed"
              testId="impact-forms-completed"
            />
            <MetricCard
              icon={Target}
              iconBg={
                depthScore !== null && depthScore >= 70
                  ? 'rgba(34, 197, 94, 0.12)'
                  : depthScore !== null && depthScore >= 40
                    ? 'rgba(234, 179, 8, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)'
              }
              iconColor={depthColor(depthScore)}
              value={depthScore !== null ? `${depthScore}` : '--'}
              label="Avg Methodology Depth"
              testId="impact-avg-methodology-depth"
              badge={depthBadge}
            />
            <MetricCard
              icon={Brain}
              iconBg="rgba(245, 158, 11, 0.12)"
              iconColor="#D97706"
              value={String(data.rootCausesIdentified)}
              label="Root Causes Found"
              testId="impact-root-causes"
            />
            <MetricCard
              icon={Lightbulb}
              iconBg="rgba(16, 185, 129, 0.12)"
              iconColor="#059669"
              value={String(data.solutionsEvaluated)}
              label="Solutions Evaluated"
              testId="impact-solutions-evaluated"
            />
            <MetricCard
              icon={BookOpen}
              iconBg="rgba(14, 165, 233, 0.12)"
              iconColor="#0891B2"
              value={String(data.lessonsDocumented)}
              label="Lessons Documented"
              testId="impact-lessons-documented"
            />
            <MetricCard
              icon={Timer}
              iconBg="rgba(139, 92, 246, 0.12)"
              iconColor="#4338CA"
              value={data.avgCycleTimeDays !== null ? `${data.avgCycleTimeDays}d` : '--'}
              label="Avg Cycle Time"
              testId="impact-avg-cycle-time"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
