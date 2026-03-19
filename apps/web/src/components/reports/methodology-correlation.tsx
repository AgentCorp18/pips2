'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MethodologyCorrelation as MethodologyCorrelationData } from '@/app/(app)/reports/roi-dashboard/actions'

/* ============================================================
   Types
   ============================================================ */

type MethodologyCorrelationProps = {
  data: MethodologyCorrelationData
}

/* ============================================================
   Scatter plot — pure CSS/div based for zero-bundle overhead
   ============================================================ */

const CHART_WIDTH = 400
const CHART_HEIGHT = 240
const PAD = { top: 16, right: 16, bottom: 36, left: 48 }

const toChartX = (depth: number) => {
  const usable = CHART_WIDTH - PAD.left - PAD.right
  return PAD.left + (depth / 100) * usable
}

const toChartY = (value: number, max: number) => {
  const usable = CHART_HEIGHT - PAD.top - PAD.bottom
  const clamped = Math.min(value, max)
  return PAD.top + usable - (clamped / max) * usable
}

const depthColor = (depth: number): string => {
  if (depth > 60) return '#10B981'
  if (depth > 30) return '#F59E0B'
  return '#6366F1'
}

/* ============================================================
   Component
   ============================================================ */

export const MethodologyCorrelation = ({ data }: MethodologyCorrelationProps) => {
  const { dataPoints, insights, multiplier, avgRoiHighDepth, avgRoiLowDepth } = data

  const hasRoiData = dataPoints.some((d) => d.roiPercent !== null)
  const hasFormsData = dataPoints.some((d) => d.formsCompleted > 0)

  // Decide which Y-axis to use: ROI if available, otherwise forms completed
  const useRoi = hasRoiData
  const yLabel = useRoi ? 'ROI %' : 'Forms Completed'

  const yValues = dataPoints
    .map((d) => (useRoi ? d.roiPercent : d.formsCompleted))
    .filter((v): v is number => v !== null && v > 0)
  const yMax = yValues.length > 0 ? Math.max(...yValues) * 1.15 : 10

  const plotPoints = dataPoints
    .map((d) => {
      const yVal = useRoi ? d.roiPercent : d.formsCompleted
      if (yVal === null || yVal === 0) return null
      return {
        x: toChartX(d.methodologyDepthPercent),
        y: toChartY(yVal, yMax),
        color: depthColor(d.methodologyDepthPercent),
        title: d.projectTitle,
        depth: d.methodologyDepthPercent,
        yVal,
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)

  // X-axis ticks: 0, 25, 50, 75, 100
  const xTicks = [0, 25, 50, 75, 100]
  const yTickCount = 4

  return (
    <div className="space-y-6">
      {/* PIPS Advantage hero stat */}
      {multiplier !== null && avgRoiHighDepth !== null && avgRoiLowDepth !== null && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg, #4F46E515 0%, #10B98115 100%)' }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            The PIPS Advantage
          </p>
          <p className="mt-2 text-5xl font-bold" style={{ color: '#10B981' }}>
            {multiplier}x
          </p>
          <p className="mt-2 text-base" style={{ color: 'var(--color-text-primary)' }}>
            better outcomes with thorough methodology
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            High-depth projects: <strong>{avgRoiHighDepth}% ROI</strong> vs {avgRoiLowDepth}% for
            low-depth projects
          </p>
        </div>
      )}

      {/* Scatter plot */}
      <Card>
        <CardHeader>
          <CardTitle
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Depth vs {yLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasFormsData ? (
            <div
              className="flex h-48 items-center justify-center text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No methodology data yet. Use PIPS tools in projects to see correlation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                className="w-full"
                style={{ maxHeight: 260 }}
                aria-label={`Scatter plot: Methodology Depth vs ${yLabel}`}
                role="img"
              >
                {/* Grid lines */}
                {Array.from({ length: yTickCount + 1 }, (_, i) => {
                  const y = PAD.top + ((CHART_HEIGHT - PAD.top - PAD.bottom) / yTickCount) * i
                  const val = Math.round(((yTickCount - i) / yTickCount) * yMax)
                  return (
                    <g key={i}>
                      <line
                        x1={PAD.left}
                        y1={y}
                        x2={CHART_WIDTH - PAD.right}
                        y2={y}
                        stroke="var(--color-border)"
                        strokeDasharray="4 4"
                        strokeWidth={0.8}
                      />
                      <text
                        x={PAD.left - 4}
                        y={y + 4}
                        textAnchor="end"
                        fontSize={10}
                        fill="var(--color-text-tertiary)"
                      >
                        {val}
                      </text>
                    </g>
                  )
                })}

                {/* X axis */}
                <line
                  x1={PAD.left}
                  y1={CHART_HEIGHT - PAD.bottom}
                  x2={CHART_WIDTH - PAD.right}
                  y2={CHART_HEIGHT - PAD.bottom}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />

                {/* X ticks */}
                {xTicks.map((tick) => {
                  const x = toChartX(tick)
                  return (
                    <g key={tick}>
                      <text
                        x={x}
                        y={CHART_HEIGHT - PAD.bottom + 14}
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--color-text-tertiary)"
                      >
                        {tick}%
                      </text>
                    </g>
                  )
                })}

                {/* Axis labels */}
                <text
                  x={CHART_WIDTH / 2}
                  y={CHART_HEIGHT - 2}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--color-text-secondary)"
                >
                  Methodology Depth (%)
                </text>
                <text
                  x={10}
                  y={CHART_HEIGHT / 2}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--color-text-secondary)"
                  transform={`rotate(-90, 10, ${CHART_HEIGHT / 2})`}
                >
                  {yLabel}
                </text>

                {/* Depth threshold line at 60% */}
                <line
                  x1={toChartX(60)}
                  y1={PAD.top}
                  x2={toChartX(60)}
                  y2={CHART_HEIGHT - PAD.bottom}
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="6 3"
                  opacity={0.5}
                />
                <text
                  x={toChartX(60) + 4}
                  y={PAD.top + 10}
                  fontSize={9}
                  fill="#10B981"
                  opacity={0.7}
                >
                  60% threshold
                </text>

                {/* Data points */}
                {plotPoints.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={6}
                      fill={pt.color}
                      opacity={0.8}
                      stroke="white"
                      strokeWidth={1.5}
                    >
                      <title>
                        {pt.title} — Depth: {pt.depth}% | {yLabel}: {pt.yVal}
                        {useRoi ? '%' : ''}
                      </title>
                    </circle>
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: '#10B981' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    High depth (&gt;60%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: '#F59E0B' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Moderate depth (31–60%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: '#6366F1' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Low depth (0–30%)
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Hover a dot for project details
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insight cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="rounded-xl border p-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {insight.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {insight.value}
            </p>
            <p
              className="mt-1 text-xs leading-snug"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
