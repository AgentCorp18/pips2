export type TemplateCategory =
  | 'identify'
  | 'analyze'
  | 'generate'
  | 'select-plan'
  | 'implement'
  | 'evaluate'

export type Template = {
  id: string
  name: string
  description: string
  category: TemplateCategory
  step: number
  format: 'PDF' | 'Excel' | 'Word'
  fileName: string
}

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; color: string }> = {
  identify: { label: 'Step 1: Identify', color: '#2563EB' },
  analyze: { label: 'Step 2: Analyze', color: '#D97706' },
  generate: { label: 'Step 3: Generate', color: '#059669' },
  'select-plan': { label: 'Step 4: Select & Plan', color: '#4338CA' },
  implement: { label: 'Step 5: Implement', color: '#CA8A04' },
  evaluate: { label: 'Step 6: Evaluate', color: '#0891B2' },
}

export const TEMPLATES: Template[] = [
  {
    id: 'problem-statement',
    name: 'Problem Statement Worksheet',
    description:
      'Define the As-Is state, desired state, and measurable gap. Includes space for impact assessment and team alignment signatures.',
    category: 'identify',
    step: 1,
    format: 'PDF',
    fileName: 'PIPS-Problem-Statement-Worksheet.pdf',
  },
  {
    id: 'impact-assessment',
    name: 'Impact Assessment Template',
    description:
      'Quantify the business impact of a problem across financial, operational, customer, and employee dimensions.',
    category: 'identify',
    step: 1,
    format: 'Excel',
    fileName: 'PIPS-Impact-Assessment-Template.xlsx',
  },
  {
    id: 'fishbone-diagram',
    name: 'Fishbone Diagram Template',
    description:
      'Structured cause-and-effect diagram with the 6M categories: Methods, Machines, Materials, Measurements, Mother Nature, and Manpower.',
    category: 'analyze',
    step: 2,
    format: 'PDF',
    fileName: 'PIPS-Fishbone-Diagram-Template.pdf',
  },
  {
    id: 'five-why',
    name: '5-Why Analysis Worksheet',
    description:
      'Drill from symptom to root cause in five structured iterations. Includes validation prompts at each level to avoid assumption traps.',
    category: 'analyze',
    step: 2,
    format: 'PDF',
    fileName: 'PIPS-5-Why-Analysis-Worksheet.pdf',
  },
  {
    id: 'force-field',
    name: 'Force Field Analysis Template',
    description:
      'Map driving forces and restraining forces for a proposed change. Score each force and identify leverage points.',
    category: 'analyze',
    step: 2,
    format: 'PDF',
    fileName: 'PIPS-Force-Field-Analysis-Template.pdf',
  },
  {
    id: 'check-sheet',
    name: 'Check Sheet / Data Collection Form',
    description:
      'Structured data collection form for tracking frequencies, defects, or occurrences over time with tally marks and totals.',
    category: 'analyze',
    step: 2,
    format: 'Excel',
    fileName: 'PIPS-Check-Sheet-Template.xlsx',
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming Session Template',
    description:
      'Facilitator guide with ground rules, idea capture grid, and affinity grouping space. Supports both open and structured brainstorming.',
    category: 'generate',
    step: 3,
    format: 'PDF',
    fileName: 'PIPS-Brainstorming-Session-Template.pdf',
  },
  {
    id: 'brainwriting-635',
    name: 'Brainwriting 6-3-5 Worksheet',
    description:
      'Silent idea generation sheet for 6 participants, 3 ideas each, rotated 5 times. Ensures every voice is heard equally.',
    category: 'generate',
    step: 3,
    format: 'PDF',
    fileName: 'PIPS-Brainwriting-635-Worksheet.pdf',
  },
  {
    id: 'criteria-matrix',
    name: 'Criteria Matrix Template',
    description:
      'Weighted scoring matrix for evaluating solutions against defined criteria. Includes weight assignment and normalized scoring.',
    category: 'select-plan',
    step: 4,
    format: 'Excel',
    fileName: 'PIPS-Criteria-Matrix-Template.xlsx',
  },
  {
    id: 'raci-chart',
    name: 'RACI Chart Template',
    description:
      'Responsibility assignment matrix mapping tasks to team members as Responsible, Accountable, Consulted, or Informed.',
    category: 'select-plan',
    step: 4,
    format: 'Excel',
    fileName: 'PIPS-RACI-Chart-Template.xlsx',
  },
  {
    id: 'implementation-plan',
    name: 'Implementation Plan Template',
    description:
      'Full project plan with milestones, owners, timelines, risk mitigation, and communication checkpoints for your improvement initiative.',
    category: 'select-plan',
    step: 4,
    format: 'Excel',
    fileName: 'PIPS-Implementation-Plan-Template.xlsx',
  },
  {
    id: 'cost-benefit',
    name: 'Cost-Benefit Analysis Template',
    description:
      'Side-by-side comparison of implementation costs versus expected benefits with ROI calculation and payback period.',
    category: 'select-plan',
    step: 4,
    format: 'Excel',
    fileName: 'PIPS-Cost-Benefit-Analysis-Template.xlsx',
  },
  {
    id: 'milestone-tracker',
    name: 'Milestone Tracker Template',
    description:
      'Visual progress tracker with planned vs. actual dates, completion percentage, and status indicators for each milestone.',
    category: 'implement',
    step: 5,
    format: 'Excel',
    fileName: 'PIPS-Milestone-Tracker-Template.xlsx',
  },
  {
    id: 'implementation-checklist',
    name: 'Implementation Checklist',
    description:
      'Task-level checklist with owners, due dates, dependencies, and completion status for day-to-day execution tracking.',
    category: 'implement',
    step: 5,
    format: 'PDF',
    fileName: 'PIPS-Implementation-Checklist.pdf',
  },
  {
    id: 'before-after',
    name: 'Before-After Comparison Template',
    description:
      'Side-by-side metric comparison showing baseline values, targets, and actual results with percentage change calculations.',
    category: 'evaluate',
    step: 6,
    format: 'Excel',
    fileName: 'PIPS-Before-After-Comparison-Template.xlsx',
  },
  {
    id: 'lessons-learned',
    name: 'Lessons Learned Template',
    description:
      'Structured retrospective template covering what worked, what did not, surprises, and recommendations for future PIPS cycles.',
    category: 'evaluate',
    step: 6,
    format: 'PDF',
    fileName: 'PIPS-Lessons-Learned-Template.pdf',
  },
  {
    id: 'evaluation-summary',
    name: 'Evaluation Summary Report',
    description:
      'Executive summary template for presenting improvement results to stakeholders, including metrics, outcomes, and next steps.',
    category: 'evaluate',
    step: 6,
    format: 'Word',
    fileName: 'PIPS-Evaluation-Summary-Report.docx',
  },
]

export const getTemplatesByCategory = (): Record<TemplateCategory, Template[]> => {
  const grouped: Record<string, Template[]> = {}
  for (const template of TEMPLATES) {
    if (!grouped[template.category]) grouped[template.category] = []
    grouped[template.category]!.push(template)
  }
  return grouped as Record<TemplateCategory, Template[]>
}

export const findTemplateById = (id: string): Template | null => {
  return TEMPLATES.find((t) => t.id === id) ?? null
}
