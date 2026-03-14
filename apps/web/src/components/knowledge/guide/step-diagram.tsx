import type { DiagramType } from '@pips/shared'
import { cn } from '@/lib/utils'

type StepDiagramProps = {
  diagramType: DiagramType
  stepColor: string
  className?: string
}

const ProblemFramework = ({ color }: { color: string }) => {
  const steps = [
    { label: 'As-Is State', desc: 'Current situation', x: 55 },
    { label: 'Desired State', desc: 'Target outcome', x: 165 },
    { label: 'Gap', desc: 'What must change', x: 275 },
    { label: 'Impact', desc: 'Why it matters', x: 385 },
  ]

  return (
    <svg
      data-testid="step-diagram-problem-framework"
      viewBox="0 0 440 200"
      className="w-full"
      role="img"
      aria-label="Problem statement structure: As-Is State, Desired State, Gap, and Impact"
    >
      <defs>
        <marker
          id="pf-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
        <linearGradient id="pf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text
        x="220"
        y="22"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={color}
        opacity={0.7}
        fontFamily="sans-serif"
      >
        PROBLEM STATEMENT STRUCTURE
      </text>

      {/* Background bar connecting all steps */}
      <rect x="20" y="50" width="400" height="90" rx="12" fill={color} opacity={0.06} />

      {/* Steps */}
      {steps.map((step, i) => (
        <g key={step.label}>
          {/* Step number circle */}
          <circle cx={step.x} cy={72} r="14" fill={color} opacity={0.85 - i * 0.1} />
          <text
            x={step.x}
            y={77}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="white"
            fontFamily="sans-serif"
          >
            {i + 1}
          </text>

          {/* Label */}
          <text
            x={step.x}
            y={108}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={color}
            fontFamily="sans-serif"
          >
            {step.label}
          </text>

          {/* Description */}
          <text
            x={step.x}
            y={124}
            textAnchor="middle"
            fontSize="10"
            fill={color}
            opacity={0.6}
            fontFamily="sans-serif"
          >
            {step.desc}
          </text>

          {/* Arrow to next step */}
          {i < steps.length - 1 && (
            <line
              x1={step.x + 20}
              y1={72}
              x2={steps[i + 1]!.x - 20}
              y2={72}
              stroke={color}
              strokeWidth="1.5"
              markerEnd="url(#pf-arrow)"
            />
          )}
        </g>
      ))}

      {/* Bottom summary bar */}
      <rect x="55" y="150" width="330" height="30" rx="8" fill={color} opacity={0.2} />
      <text
        x="220"
        y="170"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill={color}
        fontFamily="sans-serif"
      >
        {'As-Is → Desired → Gap → Impact = Clear Problem Statement'}
      </text>
    </svg>
  )
}

/**
 * Fishbone (Ishikawa) diagram — upgraded visual with gradient spine,
 * distinct category colors/icons, sub-cause branches, and prominent effect box.
 * Designed for dark mode. Brand: Primary #4F46E5, Step 2 #F59E0B, Deep #1B1340.
 */

const FISHBONE_CATEGORIES = [
  { label: 'People', x: 115, top: true, boneEnd: 168, icon: 'people' as const },
  { label: 'Process', x: 270, top: true, boneEnd: 310, icon: 'process' as const },
  { label: 'Equipment', x: 420, top: true, boneEnd: 448, icon: 'equipment' as const },
  { label: 'Materials', x: 115, top: false, boneEnd: 168, icon: 'materials' as const },
  { label: 'Measurement', x: 270, top: false, boneEnd: 310, icon: 'measurement' as const },
  { label: 'Environment', x: 420, top: false, boneEnd: 448, icon: 'environment' as const },
]

const BRANCH_COLORS = ['#2563eb', '#d97706', '#059669', '#4338ca', '#ca8a04', '#0891b2']

/** Tiny SVG icon paths for each category (rendered inside 16x16 viewBox) */
const CategoryIcon = ({ type, x, y }: { type: string; x: number; y: number }) => {
  const icons: Record<string, React.ReactNode> = {
    people: (
      <>
        <circle cx={x} cy={y - 3} r="3" fill="white" />
        <path d={`M${x - 4},${y + 5} a5,5 0 0,1 8,0`} fill="white" />
      </>
    ),
    process: (
      <>
        <rect x={x - 4} y={y - 4} width="8" height="6" rx="1" fill="white" />
        <path d={`M${x - 2},${y + 3} L${x},${y + 6} L${x + 2},${y + 3}`} fill="white" />
      </>
    ),
    equipment: (
      <>
        <rect x={x - 2} y={y - 5} width="4" height="7" rx="1" fill="white" />
        <rect x={x - 4} y={y + 2} width="8" height="3" rx="1" fill="white" />
      </>
    ),
    materials: (
      <>
        <rect
          x={x - 4}
          y={y - 4}
          width="8"
          height="8"
          rx="1"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
        <line x1={x - 2} y1={y} x2={x + 2} y2={y} stroke="white" strokeWidth="1" />
      </>
    ),
    measurement: (
      <>
        <line x1={x - 4} y1={y + 4} x2={x + 4} y2={y + 4} stroke="white" strokeWidth="1.5" />
        <line x1={x - 4} y1={y + 4} x2={x - 4} y2={y - 4} stroke="white" strokeWidth="1.5" />
        <polyline
          points={`${x - 3},${y + 1} ${x - 1},${y - 2} ${x + 1},${y + 1} ${x + 3},${y - 3}`}
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
      </>
    ),
    environment: (
      <>
        <circle cx={x} cy={y} r="4.5" fill="none" stroke="white" strokeWidth="1.5" />
        <path
          d={`M${x - 2},${y - 1} Q${x},${y - 4} ${x + 2},${y - 1}`}
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <line x1={x - 3} y1={y + 2} x2={x + 3} y2={y + 2} stroke="white" strokeWidth="1" />
      </>
    ),
  }
  return <>{icons[type]}</>
}

const Fishbone = ({ color }: { color: string }) => {
  const spineY = 160
  const spineX1 = 30
  const spineX2 = 510

  return (
    <svg
      data-testid="step-diagram-fishbone"
      viewBox="0 0 650 320"
      className="w-full"
      role="img"
      aria-label="Fishbone cause and effect diagram"
    >
      <defs>
        {/* Spine gradient: deep brand purple to step color */}
        <linearGradient id="fb-spine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        {/* Effect box gradient */}
        <linearGradient id="fb-effect-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        {/* Glow filter for the effect box */}
        <filter id="fb-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle drop shadow for category badges */}
        <filter id="fb-badge-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1B1340" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background subtle grid lines for polish */}
      <line
        x1={spineX1}
        y1={spineY}
        x2={spineX2}
        y2={spineY}
        stroke="#4F46E5"
        strokeWidth="1"
        opacity="0.06"
      />

      {/* === Main Spine === */}
      <line
        x1={spineX1}
        y1={spineY}
        x2={spineX2}
        y2={spineY}
        stroke="url(#fb-spine-grad)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Spine arrow head pointing to Effect box */}
      <polygon
        points={`${spineX2},${spineY} ${spineX2 - 12},${spineY - 8} ${spineX2 - 12},${spineY + 8}`}
        fill={color}
      />

      {/* === Effect Box === */}
      <g filter="url(#fb-glow)">
        <rect x="520" y={spineY - 32} width="115" height="64" rx="12" fill="url(#fb-effect-grad)" />
      </g>
      <text
        x="577"
        y={spineY - 5}
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        fill="rgba(255,255,255,0.7)"
        fontFamily="sans-serif"
      >
        PROBLEM
      </text>
      <text
        x="577"
        y={spineY + 14}
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill="white"
        fontFamily="sans-serif"
      >
        Effect
      </text>

      {/* === Category Bones === */}
      {FISHBONE_CATEGORIES.map((cat, i) => {
        const branchColor = BRANCH_COLORS[i] ?? color
        const topY = 42
        const bottomY = 278
        const yStart = cat.top ? topY : bottomY
        const yEnd = spineY

        // Sub-cause offsets for 3 small branches per bone
        const subCauses = [0.3, 0.5, 0.7]
        const boneAngle = cat.top ? 1 : -1

        return (
          <g key={cat.label}>
            {/* Main bone — thicker, with rounded caps */}
            <line
              x1={cat.x}
              y1={yStart}
              x2={cat.boneEnd}
              y2={yEnd}
              stroke={branchColor}
              strokeWidth="3"
              strokeLinecap="round"
              opacity={0.85}
            />

            {/* Sub-cause branches (3 per bone) */}
            {subCauses.map((t, si) => {
              const mx = cat.x + (cat.boneEnd - cat.x) * t
              const my = yStart + (yEnd - yStart) * t
              // Sub-branches go horizontally toward the left
              const subLen = 22 + si * 4
              return (
                <g key={si}>
                  <line
                    x1={mx}
                    y1={my}
                    x2={mx - subLen}
                    y2={my + boneAngle * 2}
                    stroke={branchColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={0.35}
                  />
                  {/* Tiny dot at end of sub-cause */}
                  <circle
                    cx={mx - subLen}
                    cy={my + boneAngle * 2}
                    r="2"
                    fill={branchColor}
                    opacity={0.3}
                  />
                </g>
              )
            })}

            {/* Category badge — rounded rect with icon + label */}
            <g filter="url(#fb-badge-shadow)">
              <rect
                x={cat.x - 58}
                y={cat.top ? yStart - 36 : yStart + 6}
                width="116"
                height="32"
                rx="8"
                fill={branchColor}
              />
            </g>
            {/* Icon inside badge */}
            <CategoryIcon type={cat.icon} x={cat.x - 38} y={cat.top ? yStart - 20 : yStart + 22} />
            {/* Label text */}
            <text
              x={cat.x + 10}
              y={cat.top ? yStart - 16 : yStart + 26}
              textAnchor="middle"
              fontSize="12"
              fill="white"
              fontWeight="700"
              fontFamily="sans-serif"
            >
              {cat.label}
            </text>
          </g>
        )
      })}

      {/* Spine start cap (small circle) */}
      <circle cx={spineX1} cy={spineY} r="4" fill="#4F46E5" />
    </svg>
  )
}

const DivergeConverge = ({ color }: { color: string }) => (
  <svg
    data-testid="step-diagram-diverge-converge"
    viewBox="0 0 400 200"
    className="w-full"
    role="img"
    aria-label="Diverge and converge diamond diagram"
  >
    {/* Diamond shape */}
    <polygon
      points="50,100 200,20 350,100 200,180"
      fill={color}
      opacity={0.1}
      stroke={color}
      strokeWidth="1.5"
    />
    {/* Center divider */}
    <line
      x1="200"
      y1="20"
      x2="200"
      y2="180"
      stroke={color}
      strokeWidth="1"
      strokeDasharray="4 3"
      opacity={0.5}
    />
    {/* Labels */}
    <text x="125" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill={color}>
      Diverge
    </text>
    <text x="125" y="112" textAnchor="middle" fontSize="10" fill={color} opacity={0.7}>
      Brainstorm
    </text>
    <text x="275" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill={color}>
      Converge
    </text>
    <text x="275" y="112" textAnchor="middle" fontSize="10" fill={color} opacity={0.7}>
      Select
    </text>
    {/* Start/End dots */}
    <circle cx="50" cy="100" r="6" fill={color} />
    <circle cx="350" cy="100" r="6" fill={color} />
  </svg>
)

const FlowchartPhases = ({ color }: { color: string }) => (
  <svg
    data-testid="step-diagram-flowchart-phases"
    viewBox="0 0 400 120"
    className="w-full"
    role="img"
    aria-label="Flowchart with phases diagram"
  >
    {/* Boxes */}
    <rect
      x="10"
      y="35"
      width="70"
      height="35"
      rx="6"
      fill={color}
      opacity={0.2}
      stroke={color}
      strokeWidth="1.5"
    />
    <text x="45" y="57" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>
      Evaluate
    </text>
    {/* Arrow */}
    <line
      x1="80"
      y1="52"
      x2="110"
      y2="52"
      stroke={color}
      strokeWidth="1.5"
      markerEnd="url(#farrow)"
    />
    {/* Decision diamond */}
    <polygon
      points="145,32 175,52 145,72 115,52"
      fill={color}
      opacity={0.25}
      stroke={color}
      strokeWidth="1.5"
    />
    <text x="145" y="56" textAnchor="middle" fontSize="9" fontWeight="600" fill={color}>
      OK?
    </text>
    {/* Arrow */}
    <line
      x1="175"
      y1="52"
      x2="205"
      y2="52"
      stroke={color}
      strokeWidth="1.5"
      markerEnd="url(#farrow)"
    />
    <rect
      x="205"
      y="35"
      width="55"
      height="35"
      rx="6"
      fill={color}
      opacity={0.2}
      stroke={color}
      strokeWidth="1.5"
    />
    <text x="232" y="57" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>
      Plan
    </text>
    {/* Arrow */}
    <line
      x1="260"
      y1="52"
      x2="290"
      y2="52"
      stroke={color}
      strokeWidth="1.5"
      markerEnd="url(#farrow)"
    />
    <rect
      x="290"
      y="35"
      width="60"
      height="35"
      rx="6"
      fill={color}
      opacity={0.2}
      stroke={color}
      strokeWidth="1.5"
    />
    <text x="320" y="57" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>
      Assign
    </text>
    {/* Arrow marker */}
    <defs>
      <marker
        id="farrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
      </marker>
    </defs>
  </svg>
)

const MilestoneTimeline = ({ color }: { color: string }) => (
  <svg
    data-testid="step-diagram-milestone-timeline"
    viewBox="0 0 400 100"
    className="w-full"
    role="img"
    aria-label="Milestone timeline diagram"
  >
    {/* Timeline line */}
    <line x1="30" y1="50" x2="370" y2="50" stroke={color} strokeWidth="2" opacity={0.4} />
    {/* Milestones */}
    {[
      { x: 50, label: 'Kickoff' },
      { x: 135, label: 'Analysis' },
      { x: 220, label: 'Design' },
      { x: 305, label: 'Deliver' },
      { x: 370, label: 'Review' },
    ].map((m, i) => (
      <g key={i}>
        <circle cx={m.x} cy={50} r={8} fill={color} opacity={0.8 - i * 0.1} />
        <circle cx={m.x} cy={50} r={4} fill="white" />
        <text x={m.x} y={75} textAnchor="middle" fontSize="10" fontWeight="500" fill={color}>
          {m.label}
        </text>
      </g>
    ))}
  </svg>
)

const CycleReturn = ({ color }: { color: string }) => (
  <svg
    data-testid="step-diagram-cycle-return"
    viewBox="0 0 300 300"
    className="mx-auto w-full max-w-[300px]"
    role="img"
    aria-label="Cycle return diagram from Step 6 back to Step 1"
  >
    {/* Circular track */}
    <circle cx="150" cy="150" r="100" fill="none" stroke={color} strokeWidth="2" opacity={0.15} />
    {/* Arc arrow (partial circle) */}
    <path
      d="M 150 50 A 100 100 0 1 1 63 105"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      opacity={0.5}
      markerEnd="url(#carrow)"
    />
    {/* Step dots around circle */}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i * 60 - 90) * (Math.PI / 180)
      const x = 150 + 100 * Math.cos(angle)
      const y = 150 + 100 * Math.sin(angle)
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={16} fill={color} opacity={i === 0 ? 1 : 0.6} />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
            {i + 1}
          </text>
        </g>
      )
    })}
    {/* Center label */}
    <text x="150" y="148" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>
      Continuous
    </text>
    <text x="150" y="163" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>
      Improvement
    </text>
    <defs>
      <marker
        id="carrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
      </marker>
    </defs>
  </svg>
)

const DIAGRAM_MAP: Record<DiagramType, React.FC<{ color: string }>> = {
  'problem-framework': ProblemFramework,
  fishbone: Fishbone,
  'diverge-converge': DivergeConverge,
  'flowchart-phases': FlowchartPhases,
  'milestone-timeline': MilestoneTimeline,
  'cycle-return': CycleReturn,
}

export const StepDiagram = ({ diagramType, stepColor, className }: StepDiagramProps) => {
  const Diagram = DIAGRAM_MAP[diagramType]

  if (!Diagram) return null

  return (
    <div data-testid="step-diagram" className={cn('mx-auto max-w-lg', className)}>
      <Diagram color={stepColor} />
    </div>
  )
}
