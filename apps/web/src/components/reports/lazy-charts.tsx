'use client'

/**
 * Lazy-loaded Recharts chart wrappers.
 *
 * Each export is a next/dynamic wrapper around the corresponding chart component.
 * Using ssr: false defers the ~80KB recharts bundle to client-side only,
 * keeping the initial HTML payload smaller.
 *
 * Pages should import charts from this file instead of the chart files directly.
 * Type re-exports are included so callers don't need to change their type imports.
 */

import dynamic from 'next/dynamic'

/* ============================================================
   Skeleton placeholder — shared across all chart loading states
   ============================================================ */

const ChartSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`${height} animate-pulse rounded-lg bg-muted`} />
)

/* ============================================================
   Lazy chart components
   ============================================================ */

export const LazyProjectsByStepChart = dynamic(
  () =>
    import('@/components/dashboard/projects-by-step-chart').then((mod) => ({
      default: mod.ProjectsByStepChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton height="h-72" /> },
)

export const LazyRoiTrendChart = dynamic(
  () =>
    import('@/components/reports/roi-trend-chart').then((mod) => ({
      default: mod.RoiTrendChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyCycleTimeTrendChart = dynamic(
  () =>
    import('@/components/reports/cycle-time-trend-chart').then((mod) => ({
      default: mod.CycleTimeTrendChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyTicketVelocityChart = dynamic(
  () =>
    import('@/components/reports/ticket-velocity-chart').then((mod) => ({
      default: mod.TicketVelocityChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyToolPopularityChart = dynamic(
  () =>
    import('@/components/reports/tool-popularity-chart').then((mod) => ({
      default: mod.ToolPopularityChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyStepDurationChart = dynamic(
  () =>
    import('@/components/reports/step-duration-chart').then((mod) => ({
      default: mod.StepDurationChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyStepFunnelChart = dynamic(
  () =>
    import('@/components/reports/step-funnel-chart').then((mod) => ({
      default: mod.StepFunnelChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyStepProgressChart = dynamic(
  () =>
    import('@/components/reports/step-progress-chart').then((mod) => ({
      default: mod.StepProgressChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyTeamContributionsChart = dynamic(
  () =>
    import('@/components/reports/team-contributions-chart').then((mod) => ({
      default: mod.TeamContributionsChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyActivityTimelineChart = dynamic(
  () =>
    import('@/components/reports/activity-timeline-chart').then((mod) => ({
      default: mod.ActivityTimelineChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

export const LazyFormCompletionChart = dynamic(
  () =>
    import('@/components/reports/form-completion-chart').then((mod) => ({
      default: mod.FormCompletionChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

/* ============================================================
   Type re-exports — callers keep the same import source
   ============================================================ */

export type { RoiTrendDataPoint } from '@/components/reports/roi-trend-chart'
export type { CycleTimeTrendData } from '@/components/reports/cycle-time-trend-chart'
export type { TicketVelocityData } from '@/components/reports/ticket-velocity-chart'
export type { ToolPopularityData } from '@/components/reports/tool-popularity-chart'
export type { StepDurationData } from '@/components/reports/step-duration-chart'
export type { StepFunnelData } from '@/components/reports/step-funnel-chart'
export type { StepProgressData } from '@/components/reports/step-progress-chart'
export type { TeamContributionData } from '@/components/reports/team-contributions-chart'
export type { ActivityTimelineData } from '@/components/reports/activity-timeline-chart'
export type { FormCompletionData } from '@/components/reports/form-completion-chart'
