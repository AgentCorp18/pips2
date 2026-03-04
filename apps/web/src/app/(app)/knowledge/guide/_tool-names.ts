import type { ContentTool } from '@pips/shared'

/** Human-readable display names for each ContentTool slug */
export const TOOL_DISPLAY_NAMES: Record<ContentTool, string> = {
  'problem-statement': 'Problem Statement',
  fishbone: 'Fishbone Diagram',
  'five-why': '5 Why Analysis',
  'force-field': 'Force Field Analysis',
  brainstorming: 'Brainstorming',
  brainwriting: 'Brainwriting (6-3-5)',
  checksheet: 'Check Sheet',
  'list-reduction': 'List Reduction',
  'weighted-voting': 'Weighted Voting',
  'criteria-matrix': 'Criteria Matrix',
  'paired-comparisons': 'Paired Comparisons',
  'balance-sheet': 'Balance Sheet',
  'cost-benefit': 'Cost-Benefit Analysis',
  raci: 'RACI Chart',
  'implementation-plan': 'Implementation Plan',
  'implementation-checklist': 'Implementation Checklist',
  'milestone-tracker': 'Milestone Tracker',
  'before-after': 'Before & After Comparison',
  evaluation: 'Evaluation Summary',
  'lessons-learned': 'Lessons Learned',
  interviewing: 'Interviewing',
  surveying: 'Surveying',
  'impact-assessment': 'Impact Assessment',
}
