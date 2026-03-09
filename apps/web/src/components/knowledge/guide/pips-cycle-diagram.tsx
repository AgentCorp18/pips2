import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PIPS_STEPS } from '@pips/shared'

type PipsCycleDiagramProps = {
  size?: 'sm' | 'md' | 'lg'
  activeStep?: number
  interactive?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: 200,
  md: 300,
  lg: 400,
} as const

const CENTER = 200
const RADIUS = 140

// Hexagonal positions (top-center start, clockwise)
const nodePositions = Array.from({ length: 6 }, (_, i) => {
  const angle = Math.PI / 2 + (i * (2 * Math.PI)) / 6
  return {
    x: CENTER - RADIUS * Math.cos(angle),
    y: CENTER - RADIUS * Math.sin(angle),
  }
})

const NODE_RADIUS = 36

// Abbreviated step names to fit in circles
const abbreviate = (name: string) => {
  if (name === 'Select & Plan') return 'Select'
  return name
}

// Create curved arrow path between two nodes
const arrowPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / dist
  const uy = dy / dist

  const startX = from.x + ux * NODE_RADIUS
  const startY = from.y + uy * NODE_RADIUS
  const endX = to.x - ux * (NODE_RADIUS + 6)
  const endY = to.y - uy * (NODE_RADIUS + 6)

  // Control point perpendicular offset for curve
  const mx = (startX + endX) / 2
  const my = (startY + endY) / 2
  const offset = 20
  const cx = mx + uy * offset
  const cy = my - ux * offset

  return `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`
}

export const PipsCycleDiagram = ({
  size = 'md',
  activeStep,
  interactive = false,
  className,
}: PipsCycleDiagramProps) => {
  const px = SIZE_MAP[size]

  return (
    <svg
      data-testid="pips-cycle-diagram"
      viewBox="0 0 400 400"
      width={px}
      height={px}
      className={cn('mx-auto', className)}
      role="img"
      aria-label="PIPS 6-step cycle diagram"
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--color-muted-foreground, #94a3b8)" />
        </marker>
      </defs>

      {/* Arrow paths between consecutive nodes */}
      {nodePositions.map((pos, i) => {
        const next = nodePositions[(i + 1) % 6]!
        return (
          <path
            key={`arrow-${i}`}
            d={arrowPath(pos, next)}
            fill="none"
            stroke="var(--color-muted-foreground, #94a3b8)"
            strokeWidth={1.5}
            markerEnd="url(#arrowhead)"
            opacity={0.5}
          />
        )
      })}

      {/* Step nodes */}
      {PIPS_STEPS.map((step, i) => {
        const pos = nodePositions[i]!
        const isActive = activeStep === step.number
        const opacity = activeStep != null ? (isActive ? 1 : 0.4) : 1

        const node = (
          <g key={step.number} opacity={opacity} data-testid={`pips-cycle-node-${step.number}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={NODE_RADIUS}
              fill={step.color}
              stroke={step.color}
              strokeWidth={isActive ? 3 : 1.5}
            />
            <text
              x={pos.x}
              y={pos.y - 8}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              {step.number}
            </text>
            <text
              x={pos.x}
              y={pos.y + 10}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="500"
            >
              {abbreviate(step.name)}
            </text>
          </g>
        )

        if (interactive) {
          return (
            <Link key={step.number} href={`/knowledge/guide/step/${step.number}`}>
              {node}
            </Link>
          )
        }

        return node
      })}
    </svg>
  )
}
