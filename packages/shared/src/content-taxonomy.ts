/**
 * PIPS Content Taxonomy — Types for the Knowledge Hub
 *
 * Every piece of content is tagged across these dimensions,
 * enabling the "repeatable cadence" — when domains match,
 * content surfaces from all 4 pillars.
 */

/** PIPS methodology steps + meta categories */
export type ContentStep =
  | 'step-1'
  | 'step-2'
  | 'step-3'
  | 'step-4'
  | 'step-5'
  | 'step-6'
  | 'philosophy'
  | 'facilitation'
  | 'culture'
  | 'overview'

/** The 4 content pillars */
export type ContentPillar = 'book' | 'guide' | 'workbook' | 'workshop'

/** PIPS tools referenced across content */
export type ContentTool =
  | 'problem-statement'
  | 'fishbone'
  | 'five-why'
  | 'force-field'
  | 'brainstorming'
  | 'brainwriting'
  | 'checksheet'
  | 'list-reduction'
  | 'weighted-voting'
  | 'criteria-matrix'
  | 'paired-comparisons'
  | 'balance-sheet'
  | 'cost-benefit'
  | 'raci'
  | 'implementation-plan'
  | 'implementation-checklist'
  | 'milestone-tracker'
  | 'before-after'
  | 'evaluation'
  | 'lessons-learned'
  | 'interviewing'
  | 'surveying'
  | 'impact-assessment'

/** Core PIPS principles */
export type ContentPrinciple = 'data-over-opinions' | 'expand-then-contract' | 'close-the-loop'

/** Team roles in PIPS facilitation */
export type ContentRole =
  | 'leader'
  | 'process-guide'
  | 'scribe'
  | 'timekeeper'
  | 'presenter'
  | 'facilitator'

/** Content difficulty levels */
export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced'

/** Content type classification */
export type ContentType = 'conceptual' | 'procedural' | 'reference' | 'example' | 'exercise'

/** Access level gating */
export type ContentAccessLevel = 'public' | 'free-registered' | 'paid'

/** Tags that classify a content node across all dimensions */
export type ContentTags = {
  steps: ContentStep[]
  pillar: ContentPillar
  tools: ContentTool[]
  roles: ContentRole[]
  principles: ContentPrinciple[]
  difficulty: ContentDifficulty
  contentType: ContentType
}

/** A single piece of content in the Knowledge Hub */
export type ContentNode = {
  id: string
  pillar: ContentPillar
  title: string
  slug: string
  parentId: string | null
  tags: ContentTags
  summary: string
  bodyMd: string | null
  estimatedReadMinutes: number
  sourceFile: string
  sortOrder: number
  accessLevel: ContentAccessLevel
  relatedNodes: string[]
}

/**
 * Context declared by a product surface —
 * used to find matching content across all 4 pillars.
 */
export type ProductContext = {
  steps: ContentStep[]
  tools: ContentTool[]
  roles: ContentRole[]
  principles: ContentPrinciple[]
}

/** Training exercise types */
export type TrainingExerciseType =
  | 'fill-form'
  | 'multiple-choice'
  | 'scenario-practice'
  | 'reflection'

/** Training module progress status */
export type TrainingStatus = 'not_started' | 'in_progress' | 'completed'

/** Workshop session status */
export type WorkshopStatus = 'draft' | 'active' | 'paused' | 'completed'

// ---------------------------------------------------------------------------
// Book Chapter → Step/Tool mapping
// ---------------------------------------------------------------------------

export type ChapterMapping = {
  chapter: string
  title: string
  steps: ContentStep[]
  tools: ContentTool[]
  principles: ContentPrinciple[]
}

/** Maps each book chapter to its PIPS steps, tools, and principles */
export const BOOK_CHAPTER_MAP: ChapterMapping[] = [
  { chapter: 'foreword', title: 'Foreword', steps: ['overview'], tools: [], principles: [] },
  {
    chapter: 'introduction',
    title: 'Introduction',
    steps: ['overview'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch01',
    title: 'The Problem With Problems',
    steps: ['philosophy'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch02',
    title: 'What PIPS Is',
    steps: ['overview'],
    tools: [],
    principles: ['close-the-loop'],
  },
  {
    chapter: 'ch03',
    title: 'Three Principles',
    steps: ['philosophy'],
    tools: [],
    principles: ['data-over-opinions', 'expand-then-contract', 'close-the-loop'],
  },
  {
    chapter: 'ch04',
    title: 'Step 1: Identify',
    steps: ['step-1'],
    tools: ['problem-statement', 'list-reduction', 'weighted-voting'],
    principles: ['data-over-opinions'],
  },
  {
    chapter: 'ch05',
    title: 'Step 2: Analyze',
    steps: ['step-2'],
    tools: ['fishbone', 'five-why', 'force-field', 'checksheet'],
    principles: ['data-over-opinions'],
  },
  {
    chapter: 'ch06',
    title: 'Step 3: Generate',
    steps: ['step-3'],
    tools: ['brainstorming', 'brainwriting'],
    principles: ['expand-then-contract'],
  },
  {
    chapter: 'ch07',
    title: 'Step 4: Select & Plan',
    steps: ['step-4'],
    tools: ['criteria-matrix', 'paired-comparisons', 'balance-sheet', 'cost-benefit', 'raci'],
    principles: ['expand-then-contract'],
  },
  {
    chapter: 'ch08',
    title: 'Step 5: Implement',
    steps: ['step-5'],
    tools: ['milestone-tracker', 'implementation-checklist'],
    principles: [],
  },
  {
    chapter: 'ch09',
    title: 'Step 6: Evaluate',
    steps: ['step-6'],
    tools: ['before-after', 'evaluation', 'lessons-learned'],
    principles: ['close-the-loop'],
  },
  {
    chapter: 'ch10',
    title: 'Every Department',
    steps: ['culture'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch11',
    title: 'Scaling PIPS',
    steps: ['culture'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch12',
    title: 'Building Culture',
    steps: ['culture'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch13',
    title: "Facilitator's Playbook",
    steps: ['facilitation'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch14',
    title: 'When PIPS Fails',
    steps: ['philosophy'],
    tools: [],
    principles: [],
  },
  {
    chapter: 'ch15',
    title: 'Living System',
    steps: ['culture'],
    tools: [],
    principles: ['close-the-loop'],
  },
  {
    chapter: 'appendix-a',
    title: 'Toolkit Reference',
    steps: ['overview'],
    tools: [
      'problem-statement',
      'fishbone',
      'five-why',
      'force-field',
      'brainstorming',
      'brainwriting',
      'checksheet',
      'list-reduction',
      'weighted-voting',
      'criteria-matrix',
      'paired-comparisons',
      'balance-sheet',
      'cost-benefit',
      'raci',
      'implementation-plan',
      'implementation-checklist',
      'milestone-tracker',
      'before-after',
      'evaluation',
      'lessons-learned',
      'interviewing',
      'surveying',
    ],
    principles: [],
  },
  {
    chapter: 'appendix-b',
    title: 'Quick Reference Card',
    steps: ['overview'],
    tools: [
      'problem-statement',
      'fishbone',
      'five-why',
      'force-field',
      'brainstorming',
      'brainwriting',
      'checksheet',
      'list-reduction',
      'weighted-voting',
      'criteria-matrix',
      'paired-comparisons',
      'balance-sheet',
      'cost-benefit',
      'raci',
      'implementation-plan',
      'implementation-checklist',
      'milestone-tracker',
      'before-after',
      'evaluation',
      'lessons-learned',
      'interviewing',
      'surveying',
    ],
    principles: ['data-over-opinions', 'expand-then-contract', 'close-the-loop'],
  },
]

// ---------------------------------------------------------------------------
// Step → Tool mapping (for Cadence Bar lookups)
// ---------------------------------------------------------------------------

/** Maps a PIPS step number to its ContentStep tag */
export const stepNumberToContentStep = (step: number): ContentStep => {
  if (step >= 1 && step <= 6) return `step-${step}` as ContentStep
  return 'overview'
}

/** Maps the DB pips_step enum string to a step number */
export const pipsStepEnumToNumber = (pipsStep: string): number => {
  const mapping: Record<string, number> = {
    identify: 1,
    analyze: 2,
    generate: 3,
    select_plan: 4,
    implement: 5,
    evaluate: 6,
  }
  return mapping[pipsStep] ?? 1
}

/** Maps a form type string to its ContentTool tag */
export const formTypeToContentTool = (formType: string): ContentTool | null => {
  const mapping: Record<string, ContentTool> = {
    problem_statement: 'problem-statement',
    impact_assessment: 'impact-assessment',
    fishbone: 'fishbone',
    five_why: 'five-why',
    force_field: 'force-field',
    checksheet: 'checksheet',
    brainstorming: 'brainstorming',
    brainwriting: 'brainwriting',
    criteria_matrix: 'criteria-matrix',
    paired_comparisons: 'paired-comparisons',
    raci: 'raci',
    implementation_plan: 'implementation-plan',
    implementation_checklist: 'implementation-checklist',
    milestone_tracker: 'milestone-tracker',
    before_after: 'before-after',
    evaluation: 'evaluation',
    lessons_learned: 'lessons-learned',
    balance_sheet: 'balance-sheet',
  }
  return mapping[formType] ?? null
}

/**
 * Build a ProductContext from a step number and optional form type.
 * Used by the Cadence Bar to find relevant content.
 */
export const buildProductContext = (stepNumber?: number, formType?: string): ProductContext => {
  const steps: ContentStep[] = []
  const tools: ContentTool[] = []

  if (stepNumber) {
    steps.push(stepNumberToContentStep(stepNumber))
  }

  if (formType) {
    const tool = formTypeToContentTool(formType)
    if (tool) tools.push(tool)
  }

  return { steps, tools, roles: [], principles: [] }
}

/**
 * Find content nodes matching a product context.
 * Matches any node where at least one tag dimension overlaps.
 */
export const matchContentNodes = (nodes: ContentNode[], context: ProductContext): ContentNode[] => {
  return nodes.filter((node) => {
    const { tags } = node

    const stepMatch =
      context.steps.length === 0 || context.steps.some((s) => tags.steps.includes(s))

    const toolMatch =
      context.tools.length === 0 || context.tools.some((t) => tags.tools.includes(t))

    return stepMatch || toolMatch
  })
}

/**
 * Group matched content nodes by pillar for the Cadence Bar.
 * Returns the best match per pillar (highest tag overlap).
 */
export const groupByPillar = (nodes: ContentNode[]): Record<ContentPillar, ContentNode | null> => {
  const result: Record<ContentPillar, ContentNode | null> = {
    book: null,
    guide: null,
    workbook: null,
    workshop: null,
  }

  for (const node of nodes) {
    const current = result[node.pillar]
    if (!current || node.sortOrder < current.sortOrder) {
      result[node.pillar] = node
    }
  }

  return result
}

/** All content pillars for iteration */
export const CONTENT_PILLARS: ContentPillar[] = ['book', 'guide', 'workbook', 'workshop']

/** Pillar display metadata */
export const PILLAR_META: Record<
  ContentPillar,
  { label: string; description: string; icon: string }
> = {
  book: {
    label: 'Book',
    description: 'Deep methodology content — chapters, case studies, philosophy',
    icon: 'book-open',
  },
  guide: {
    label: 'Interactive Guide',
    description: 'Step-by-step methodology — tools, roles, processes',
    icon: 'compass',
  },
  workbook: {
    label: 'Workbook',
    description: 'Hands-on practice — forms, exercises, templates',
    icon: 'clipboard-list',
  },
  workshop: {
    label: 'Workshop',
    description: 'Facilitation — timed sessions, scenarios, team activities',
    icon: 'users',
  },
}
