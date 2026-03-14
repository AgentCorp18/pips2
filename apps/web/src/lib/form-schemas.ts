import { z } from 'zod'

/* ============================================================
   Step 1 — Identify
   ============================================================ */

export const problemStatementSchema = z.object({
  asIs: z.string().default(''),
  desired: z.string().default(''),
  gap: z.string().default(''),
  problemStatement: z.string().default(''),
  teamMembers: z.array(z.string()).default([]),
  problemArea: z.string().default(''),
  dataSources: z.array(z.string()).default([]),
})

export type ProblemStatementData = z.infer<typeof problemStatementSchema>

export const impactAssessmentSchema = z.object({
  financialImpact: z.string().default(''),
  customerImpact: z.string().default(''),
  employeeImpact: z.string().default(''),
  processImpact: z.string().default(''),
  severityRating: z.number().min(1).max(5).default(1),
  frequencyRating: z.number().min(1).max(5).default(1),
  detectionRating: z.number().min(1).max(5).default(1),
  riskPriorityNumber: z.number().default(1),
})

export type ImpactAssessmentData = z.infer<typeof impactAssessmentSchema>

/* ============================================================
   Step 2 — Analyze
   ============================================================ */

const causeSchema = z.object({
  text: z.string().default(''),
  subCauses: z.array(z.string()).default([]),
})

const fishboneCategorySchema = z.object({
  name: z.string(),
  causes: z.array(causeSchema).default([]),
})

export const fishboneSchema = z.object({
  problemStatement: z.string().default(''),
  categories: z.array(fishboneCategorySchema).default([
    { name: 'Man (People)', causes: [] },
    { name: 'Machine (Equipment)', causes: [] },
    { name: 'Method (Process)', causes: [] },
    { name: 'Material (Inputs)', causes: [] },
    { name: 'Measurement (Metrics)', causes: [] },
    { name: 'Mother Nature (Environment)', causes: [] },
  ]),
})

export type FishboneData = z.infer<typeof fishboneSchema>

const whyEntrySchema = z.object({
  question: z.string().default(''),
  answer: z.string().default(''),
})

export const fiveWhySchema = z.object({
  problemStatement: z.string().default(''),
  whys: z.array(whyEntrySchema).default([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]),
  rootCause: z.string().default(''),
})

export type FiveWhyData = z.infer<typeof fiveWhySchema>

const forceSchema = z.object({
  text: z.string().default(''),
  strength: z.number().min(1).max(5).default(3),
})

export const forceFieldSchema = z.object({
  problemStatement: z.string().default(''),
  drivingForces: z.array(forceSchema).default([]),
  restrainingForces: z.array(forceSchema).default([]),
  strategy: z.string().default(''),
})

export type ForceFieldData = z.infer<typeof forceFieldSchema>

const checksheetCategorySchema = z.object({
  id: z.string(),
  label: z.string().default(''),
})

const checksheetTimePeriodSchema = z.object({
  id: z.string(),
  label: z.string().default(''),
})

export const checksheetSchema = z.object({
  title: z.string().default(''),
  categories: z.array(checksheetCategorySchema).default([]),
  timePeriods: z.array(checksheetTimePeriodSchema).default([]),
  tallies: z.record(z.string(), z.number()).default({}),
  notes: z.string().default(''),
})

export type ChecksheetData = z.infer<typeof checksheetSchema>

/* ============================================================
   Step 3 — Generate
   ============================================================ */

const ideaSchema = z.object({
  id: z.string(),
  text: z.string().default(''),
  author: z.string().default(''),
  votes: z.number().default(0),
  category: z.string().default(''),
})

export const brainstormingSchema = z.object({
  ideas: z.array(ideaSchema).default([]),
  selectedIdeas: z.array(z.string()).default([]),
  eliminatedIdeas: z.array(z.string()).default([]),
})

export type BrainstormingData = z.infer<typeof brainstormingSchema>

const brainwritingEntrySchema = z.object({
  participant: z.string().default(''),
  ideas: z.array(z.string()).default(['', '', '']),
})

const brainwritingRoundSchema = z.object({
  roundNumber: z.number(),
  entries: z.array(brainwritingEntrySchema).default([]),
})

export const brainwritingSchema = z.object({
  rounds: z.array(brainwritingRoundSchema).default([]),
  allIdeas: z.array(z.string()).default([]),
})

export type BrainwritingData = z.infer<typeof brainwritingSchema>

/* ============================================================
   Step 4 — Select & Plan
   ============================================================ */

const pairedOptionSchema = z.object({
  id: z.string(),
  label: z.string().default(''),
})

const pairedComparisonSchema = z.object({
  optionA: z.string(),
  optionB: z.string(),
  winner: z.string().nullable().default(null),
  notes: z.string().default(''),
})

const pairedResultSchema = z.object({
  optionId: z.string(),
  wins: z.number().default(0),
  rank: z.number().default(0),
})

export const pairedComparisonsSchema = z.object({
  options: z.array(pairedOptionSchema).default([]),
  comparisons: z.array(pairedComparisonSchema).default([]),
  results: z.array(pairedResultSchema).default([]),
})

export type PairedComparisonsData = z.infer<typeof pairedComparisonsSchema>

export const criteriaMatrixSchema = z.object({
  criteria: z.array(
    z.object({
      name: z.string().min(1),
      weight: z.number().min(1).max(10),
      description: z.string(),
    }),
  ),
  solutions: z.array(
    z.object({
      name: z.string().min(1),
      scores: z.record(z.string(), z.number().min(1).max(5)),
    }),
  ),
})

export type CriteriaMatrixData = z.infer<typeof criteriaMatrixSchema>

export const implementationPlanSchema = z.object({
  selectedSolution: z.string(),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      assignee: z.string(),
      dueDate: z.string(),
      status: z.enum(['not_started', 'in_progress', 'completed']),
      notes: z.string(),
    }),
  ),
  timeline: z.string(),
  resources: z.string(),
  budget: z.string(),
  risks: z.array(
    z.object({
      risk: z.string(),
      mitigation: z.string(),
    }),
  ),
})

export type ImplementationPlanData = z.infer<typeof implementationPlanSchema>

export const raciSchema = z.object({
  activities: z.array(z.string()),
  people: z.array(z.string()),
  matrix: z.record(z.string(), z.record(z.string(), z.enum(['R', 'A', 'C', 'I', '']))),
})

export type RaciData = z.infer<typeof raciSchema>

/* ============================================================
   Step 5 — Implement
   ============================================================ */

export const milestoneTrackerSchema = z.object({
  milestones: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      targetDate: z.string(),
      completedDate: z.string().nullable(),
      status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
      description: z.string(),
      deliverables: z.array(z.string()),
    }),
  ),
  overallProgress: z.number().min(0).max(100),
})

export type MilestoneTrackerData = z.infer<typeof milestoneTrackerSchema>

export const implementationChecklistSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
      assignee: z.string(),
      notes: z.string(),
      category: z.string(),
    }),
  ),
})

export type ImplementationChecklistData = z.infer<typeof implementationChecklistSchema>

/* ============================================================
   Step 6 — Evaluate
   ============================================================ */

export const beforeAfterSchema = z.object({
  metrics: z.array(
    z.object({
      name: z.string(),
      before: z.string(),
      after: z.string(),
      unit: z.string(),
      improvement: z.string(),
    }),
  ),
  summary: z.string(),
})

export type BeforeAfterData = z.infer<typeof beforeAfterSchema>

export const evaluationSchema = z.object({
  goalsAchieved: z.boolean(),
  goalDetails: z.string(),
  effectivenessRating: z.number().min(1).max(5),
  sustainabilityRating: z.number().min(1).max(5),
  teamSatisfactionRating: z.number().min(1).max(5),
  unexpectedOutcomes: z.string(),
  recommendations: z.string(),
  nextSteps: z.string(),
})

export type EvaluationData = z.infer<typeof evaluationSchema>

export const lessonsLearnedSchema = z.object({
  wentWell: z.array(z.string()),
  improvements: z.array(z.string()),
  actionItems: z.array(
    z.object({
      description: z.string(),
      owner: z.string(),
      dueDate: z.string(),
    }),
  ),
  keyTakeaways: z.string(),
})

export type LessonsLearnedData = z.infer<typeof lessonsLearnedSchema>

const balanceSheetGainSchema = z.object({
  id: z.string(),
  description: z.string().default(''),
  impact: z.enum(['high', 'medium', 'low']).default('medium'),
  evidence: z.string().default(''),
})

const balanceSheetLossSchema = z.object({
  id: z.string(),
  description: z.string().default(''),
  impact: z.enum(['high', 'medium', 'low']).default('medium'),
  mitigation: z.string().default(''),
})

const balanceSheetObservationSchema = z.object({
  id: z.string(),
  description: z.string().default(''),
  category: z.string().default(''),
})

export const balanceSheetSchema = z.object({
  gains: z.array(balanceSheetGainSchema).default([]),
  losses: z.array(balanceSheetLossSchema).default([]),
  observations: z.array(balanceSheetObservationSchema).default([]),
  summary: z.string().default(''),
  recommendation: z.enum(['sustain', 'modify', 'abandon', '']).default(''),
})

export type BalanceSheetData = z.infer<typeof balanceSheetSchema>

/* ============================================================
   New Optional Forms — Step 1, 2, 3, 4
   ============================================================ */

// List Reduction (Step 1)
export const listReductionSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().default(''),
        kept: z.boolean().default(true),
        reason: z.string().default(''),
      }),
    )
    .default([]),
  criteria: z.string().default(''),
  finalList: z.array(z.string()).default([]),
})
export type ListReductionData = z.infer<typeof listReductionSchema>

// Weighted Voting (Step 1)
export const weightedVotingSchema = z.object({
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().default(''),
        votes: z.number().default(0),
      }),
    )
    .default([]),
  totalVotesPerPerson: z.number().default(5),
  voters: z
    .array(
      z.object({
        name: z.string().default(''),
        allocations: z.record(z.string(), z.number()).default({}),
      }),
    )
    .default([]),
})
export type WeightedVotingData = z.infer<typeof weightedVotingSchema>

// Pareto Analysis (Step 2)
export const paretoSchema = z.object({
  title: z.string().default(''),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().default(''),
        count: z.number().default(0),
        percentage: z.number().default(0),
        cumulative: z.number().default(0),
      }),
    )
    .default([]),
  eightyTwentyLine: z.string().default(''),
  notes: z.string().default(''),
})
export type ParetoData = z.infer<typeof paretoSchema>

// Interviewing (Step 3)
export const interviewingSchema = z.object({
  interviews: z
    .array(
      z.object({
        id: z.string(),
        interviewee: z.string().default(''),
        role: z.string().default(''),
        date: z.string().default(''),
        questions: z
          .array(
            z.object({
              id: z.string(),
              question: z.string().default(''),
              response: z.string().default(''),
            }),
          )
          .default([]),
        keyInsights: z.string().default(''),
      }),
    )
    .default([]),
  summary: z.string().default(''),
})
export type InterviewingData = z.infer<typeof interviewingSchema>

// Surveying (Step 3)
export const surveyingSchema = z.object({
  title: z.string().default(''),
  targetAudience: z.string().default(''),
  questions: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().default(''),
        type: z.enum(['open_ended', 'rating', 'multiple_choice']).default('open_ended'),
        options: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  respondents: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().default(''),
        answers: z.record(z.string(), z.string()).default({}),
      }),
    )
    .default([]),
  summary: z.string().default(''),
})
export type SurveyingData = z.infer<typeof surveyingSchema>

// Cost-Benefit Analysis (Step 4)
export const costBenefitSchema = z.object({
  solutionName: z.string().default(''),
  costs: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().default(''),
        amount: z.number().default(0),
        frequency: z.enum(['one_time', 'monthly', 'annual']).default('one_time'),
        category: z.string().default(''),
      }),
    )
    .default([]),
  benefits: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().default(''),
        amount: z.number().default(0),
        frequency: z.enum(['one_time', 'monthly', 'annual']).default('one_time'),
        category: z.string().default(''),
      }),
    )
    .default([]),
  netBenefit: z.number().default(0),
  paybackPeriod: z.string().default(''),
  recommendation: z.string().default(''),
})
export type CostBenefitData = z.infer<typeof costBenefitSchema>

/* ============================================================
   Step 2 — Root Cause (flexible form — captures analyst notes)
   ============================================================ */

export const rootCauseSchema = z.record(z.string(), z.unknown())

export type RootCauseData = z.infer<typeof rootCauseSchema>

/* ============================================================
   Schema Map — for dynamic lookup by form_type
   ============================================================ */

export const FORM_SCHEMAS: Record<string, z.ZodType> = {
  problem_statement: problemStatementSchema,
  impact_assessment: impactAssessmentSchema,
  list_reduction: listReductionSchema,
  weighted_voting: weightedVotingSchema,
  fishbone: fishboneSchema,
  five_why: fiveWhySchema,
  force_field: forceFieldSchema,
  checksheet: checksheetSchema,
  pareto: paretoSchema,
  brainstorming: brainstormingSchema,
  brainwriting: brainwritingSchema,
  interviewing: interviewingSchema,
  surveying: surveyingSchema,
  paired_comparisons: pairedComparisonsSchema,
  criteria_matrix: criteriaMatrixSchema,
  implementation_plan: implementationPlanSchema,
  raci: raciSchema,
  balance_sheet: balanceSheetSchema,
  cost_benefit: costBenefitSchema,
  milestone_tracker: milestoneTrackerSchema,
  implementation_checklist: implementationChecklistSchema,
  before_after: beforeAfterSchema,
  evaluation: evaluationSchema,
  lessons_learned: lessonsLearnedSchema,
  root_cause: rootCauseSchema,
}
