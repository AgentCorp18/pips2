import type { DiagramType } from '@pips/shared'
import { cn } from '@/lib/utils'

type StepDiagramProps = {
  diagramType: DiagramType
  stepColor: string
  className?: string
}

const ProblemFramework = ({ color }: { color: string }) => (
  <svg
    data-testid="step-diagram-problem-framework"
    viewBox="0 0 400 200"
    className="w-full"
    role="img"
    aria-label="Problem framework funnel diagram"
  >
    {/* Funnel shape */}
    <polygon points="40,30 360,30 280,100 120,100" fill={color} opacity={0.15} />
    <polygon points="120,100 280,100 240,170 160,170" fill={color} opacity={0.3} />
    <rect x="160" y="170" width="80" height="25" rx="4" fill={color} opacity={0.5} />
    {/* Labels */}
    <text x="200" y="60" textAnchor="middle" fontSize="13" fontWeight="600" fill={color}>
      Symptoms
    </text>
    <text x="200" y="135" textAnchor="middle" fontSize="12" fontWeight="600" fill={color}>
      Root Problem
    </text>
    <text x="200" y="187" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">
      Clear Statement
    </text>
    {/* Arrows */}
    <line
      x1="200"
      y1="68"
      x2="200"
      y2="95"
      stroke={color}
      strokeWidth="1.5"
      markerEnd="url(#arrow)"
    />
    <line
      x1="200"
      y1="143"
      x2="200"
      y2="165"
      stroke={color}
      strokeWidth="1.5"
      markerEnd="url(#arrow)"
    />
    <defs>
      <marker
        id="arrow"
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

const Fishbone = ({ color }: { color: string }) => (
  <svg
    data-testid="step-diagram-fishbone"
    viewBox="0 0 400 200"
    className="w-full"
    role="img"
    aria-label="Fishbone cause and effect diagram"
  >
    {/* Spine */}
    <line x1="60" y1="100" x2="340" y2="100" stroke={color} strokeWidth="2.5" />
    {/* Effect box */}
    <rect x="310" y="80" width="80" height="40" rx="6" fill={color} />
    <text x="350" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">
      Effect
    </text>
    {/* Upper bones */}
    <line x1="120" y1="40" x2="160" y2="100" stroke={color} strokeWidth="1.5" opacity={0.7} />
    <line x1="220" y1="40" x2="240" y2="100" stroke={color} strokeWidth="1.5" opacity={0.7} />
    {/* Lower bones */}
    <line x1="140" y1="160" x2="180" y2="100" stroke={color} strokeWidth="1.5" opacity={0.7} />
    <line x1="240" y1="160" x2="260" y2="100" stroke={color} strokeWidth="1.5" opacity={0.7} />
    {/* Cause labels */}
    <rect x="90" y="22" width="60" height="22" rx="4" fill={color} opacity={0.15} />
    <text x="120" y="37" textAnchor="middle" fontSize="10" fill={color} fontWeight="500">
      People
    </text>
    <rect x="190" y="22" width="60" height="22" rx="4" fill={color} opacity={0.15} />
    <text x="220" y="37" textAnchor="middle" fontSize="10" fill={color} fontWeight="500">
      Process
    </text>
    <rect x="110" y="158" width="60" height="22" rx="4" fill={color} opacity={0.15} />
    <text x="140" y="173" textAnchor="middle" fontSize="10" fill={color} fontWeight="500">
      Tools
    </text>
    <rect x="210" y="158" width="70" height="22" rx="4" fill={color} opacity={0.15} />
    <text x="245" y="173" textAnchor="middle" fontSize="10" fill={color} fontWeight="500">
      Materials
    </text>
  </svg>
)

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
