/** Metadata for each PIPS tool, used in workbook step pages */
export type ToolMeta = {
  name: string
  description: string
  estimatedMin: number
  difficulty: string
  formType: string
}

export const TOOL_META: Record<string, ToolMeta> = {
  'problem-statement': {
    name: 'Problem Statement',
    description: 'Define As-Is, Desired State, and Gap',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'problem_statement',
  },
  'impact-assessment': {
    name: 'Impact Assessment',
    description: 'Quantify the problem impact on the organization',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'impact_assessment',
  },
  fishbone: {
    name: 'Fishbone Diagram',
    description: 'Cause-and-effect analysis across 6M categories',
    estimatedMin: 20,
    difficulty: 'Intermediate',
    formType: 'fishbone',
  },
  'five-why': {
    name: '5 Why Analysis',
    description: 'Drill down to root cause by asking "why" iteratively',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'five_why',
  },
  'force-field': {
    name: 'Force Field Analysis',
    description: 'Map driving forces vs. restraining forces for change',
    estimatedMin: 15,
    difficulty: 'Intermediate',
    formType: 'force_field',
  },
  checksheet: {
    name: 'Check Sheet',
    description: 'Structured tally sheet to collect and quantify data',
    estimatedMin: 10,
    difficulty: 'Beginner',
    formType: 'checksheet',
  },
  brainstorming: {
    name: 'Brainstorming',
    description: 'Free-form idea generation with the team',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'brainstorming',
  },
  brainwriting: {
    name: 'Brainwriting (6-3-5)',
    description: "Silent written idea generation and building on others' ideas",
    estimatedMin: 20,
    difficulty: 'Beginner',
    formType: 'brainwriting',
  },
  'list-reduction': {
    name: 'List Reduction',
    description: 'Narrow a long list of items to a manageable shortlist',
    estimatedMin: 10,
    difficulty: 'Beginner',
    formType: 'list_reduction',
  },
  'weighted-voting': {
    name: 'Weighted Voting',
    description: 'Prioritize options using weighted criteria votes',
    estimatedMin: 10,
    difficulty: 'Beginner',
    formType: 'weighted_voting',
  },
  'criteria-matrix': {
    name: 'Criteria Matrix',
    description: 'Score and rank solutions against weighted criteria',
    estimatedMin: 20,
    difficulty: 'Intermediate',
    formType: 'criteria_matrix',
  },
  'paired-comparisons': {
    name: 'Paired Comparisons',
    description: 'Compare options in pairs to produce a ranked list',
    estimatedMin: 15,
    difficulty: 'Intermediate',
    formType: 'paired_comparisons',
  },
  'balance-sheet': {
    name: 'Balance Sheet',
    description: 'Weigh gains vs. losses to decide the path forward',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'balance_sheet',
  },
  'cost-benefit': {
    name: 'Cost-Benefit Analysis',
    description: 'Compare financial costs and benefits of a solution',
    estimatedMin: 20,
    difficulty: 'Intermediate',
    formType: 'cost_benefit',
  },
  raci: {
    name: 'RACI Chart',
    description: 'Assign Responsible, Accountable, Consulted, Informed roles',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'raci',
  },
  'implementation-plan': {
    name: 'Implementation Plan',
    description: 'Timeline, resources, milestones, and risk mitigation',
    estimatedMin: 20,
    difficulty: 'Intermediate',
    formType: 'implementation_plan',
  },
  'implementation-checklist': {
    name: 'Implementation Checklist',
    description: 'Detailed task checklist with status and owners',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'implementation_checklist',
  },
  'milestone-tracker': {
    name: 'Milestone Tracker',
    description: 'Track progress against planned milestones and dates',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'milestone_tracker',
  },
  'before-after': {
    name: 'Before & After Comparison',
    description: 'Compare baseline metrics with post-implementation results',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'before_after',
  },
  evaluation: {
    name: 'Evaluation Summary',
    description: 'Overall assessment of the improvement project',
    estimatedMin: 20,
    difficulty: 'Intermediate',
    formType: 'evaluation',
  },
  'lessons-learned': {
    name: 'Lessons Learned',
    description: 'Document insights, successes, and areas for improvement',
    estimatedMin: 15,
    difficulty: 'Beginner',
    formType: 'lessons_learned',
  },
}
