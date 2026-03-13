import { describe, it, expect } from 'vitest'
import {
  FORM_SCHEMAS,
  problemStatementSchema,
  impactAssessmentSchema,
  fishboneSchema,
  fiveWhySchema,
  forceFieldSchema,
  checksheetSchema,
  brainstormingSchema,
  brainwritingSchema,
  pairedComparisonsSchema,
  criteriaMatrixSchema,
  implementationPlanSchema,
  raciSchema,
  milestoneTrackerSchema,
  implementationChecklistSchema,
  beforeAfterSchema,
  evaluationSchema,
  lessonsLearnedSchema,
  balanceSheetSchema,
} from '../form-schemas'

/* ============================================================
   FORM_SCHEMAS map
   ============================================================ */

describe('FORM_SCHEMAS', () => {
  const expectedFormTypes = [
    'problem_statement',
    'impact_assessment',
    'fishbone',
    'five_why',
    'force_field',
    'checksheet',
    'brainstorming',
    'brainwriting',
    'paired_comparisons',
    'criteria_matrix',
    'implementation_plan',
    'raci',
    'milestone_tracker',
    'implementation_checklist',
    'before_after',
    'evaluation',
    'lessons_learned',
    'balance_sheet',
    'root_cause',
  ]

  it('has entries for all 19 form types', () => {
    expect(Object.keys(FORM_SCHEMAS)).toHaveLength(19)
  })

  it('contains every expected form type key', () => {
    for (const formType of expectedFormTypes) {
      expect(FORM_SCHEMAS).toHaveProperty(formType)
    }
  })

  it('each value is a Zod schema with a safeParse method', () => {
    for (const key of Object.keys(FORM_SCHEMAS)) {
      const schema = FORM_SCHEMAS[key]
      expect(schema).toBeDefined()
      expect(typeof schema?.safeParse).toBe('function')
    }
  })
})

/* ============================================================
   Step 1 — Identify
   ============================================================ */

describe('problemStatementSchema', () => {
  it('passes with valid data', () => {
    const result = problemStatementSchema.safeParse({
      asIs: 'Current defect rate is 5%',
      desired: 'Target defect rate below 2%',
      gap: '3% reduction needed',
      problemStatement: 'Reduce defect rate from 5% to below 2%',
      teamMembers: ['Alice', 'Bob'],
      problemArea: 'Manufacturing',
      dataSources: ['QC reports', 'Customer complaints'],
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for empty input', () => {
    const result = problemStatementSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.asIs).toBe('')
      expect(result.data.desired).toBe('')
      expect(result.data.gap).toBe('')
      expect(result.data.teamMembers).toEqual([])
      expect(result.data.dataSources).toEqual([])
    }
  })
})

describe('impactAssessmentSchema', () => {
  it('passes with valid data including RPN fields', () => {
    const result = impactAssessmentSchema.safeParse({
      financialImpact: '$50,000/month',
      customerImpact: 'High churn risk',
      employeeImpact: 'Low morale',
      processImpact: 'Bottleneck in QC',
      severityRating: 4,
      frequencyRating: 3,
      detectionRating: 2,
      riskPriorityNumber: 24,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.riskPriorityNumber).toBe(24)
    }
  })

  it('applies default ratings', () => {
    const result = impactAssessmentSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.severityRating).toBe(1)
      expect(result.data.frequencyRating).toBe(1)
      expect(result.data.detectionRating).toBe(1)
      expect(result.data.riskPriorityNumber).toBe(1)
    }
  })

  it('fails when severity rating exceeds 5', () => {
    const result = impactAssessmentSchema.safeParse({
      severityRating: 6,
    })
    expect(result.success).toBe(false)
  })

  it('fails when frequency rating is below 1', () => {
    const result = impactAssessmentSchema.safeParse({
      frequencyRating: 0,
    })
    expect(result.success).toBe(false)
  })
})

/* ============================================================
   Step 2 — Analyze
   ============================================================ */

describe('fishboneSchema', () => {
  it('passes with valid categories and causes', () => {
    const result = fishboneSchema.safeParse({
      problemStatement: 'High defect rate',
      categories: [
        {
          name: 'People',
          causes: [{ text: 'Insufficient training', subCauses: ['No onboarding', 'No refresher'] }],
        },
        {
          name: 'Process',
          causes: [{ text: 'No standard procedure', subCauses: [] }],
        },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.categories).toHaveLength(2)
      expect(result.data.categories[0]?.causes[0]?.subCauses).toHaveLength(2)
    }
  })

  it('provides default 6 categories when empty', () => {
    const result = fishboneSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.categories).toHaveLength(6)
      const names = result.data.categories.map((c) => c.name)
      expect(names).toContain('People')
      expect(names).toContain('Process')
      expect(names).toContain('Equipment')
      expect(names).toContain('Materials')
      expect(names).toContain('Environment')
      expect(names).toContain('Management')
    }
  })
})

describe('fiveWhySchema', () => {
  it('provides 5 default why entries', () => {
    const result = fiveWhySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.whys).toHaveLength(5)
    }
  })
})

describe('forceFieldSchema', () => {
  it('passes with driving and restraining forces', () => {
    const result = forceFieldSchema.safeParse({
      problemStatement: 'Need to adopt new software',
      drivingForces: [{ text: 'Efficiency gains', strength: 5 }],
      restrainingForces: [{ text: 'Training cost', strength: 3 }],
      strategy: 'Phased rollout with training',
    })
    expect(result.success).toBe(true)
  })

  it('fails when force strength exceeds 5', () => {
    const result = forceFieldSchema.safeParse({
      drivingForces: [{ text: 'Too strong', strength: 6 }],
    })
    expect(result.success).toBe(false)
  })
})

describe('checksheetSchema', () => {
  it('passes with valid data', () => {
    const result = checksheetSchema.safeParse({
      title: 'Defect Tracking',
      categories: [
        { id: 'c1', label: 'Scratch' },
        { id: 'c2', label: 'Dent' },
      ],
      timePeriods: [
        { id: 't1', label: 'Week 1' },
        { id: 't2', label: 'Week 2' },
      ],
      tallies: { 'c1-t1': 5, 'c2-t1': 3 },
      notes: 'Scratches are most common',
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for empty input', () => {
    const result = checksheetSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('')
      expect(result.data.categories).toEqual([])
      expect(result.data.timePeriods).toEqual([])
      expect(result.data.tallies).toEqual({})
      expect(result.data.notes).toBe('')
    }
  })
})

/* ============================================================
   Step 3 — Generate
   ============================================================ */

describe('brainstormingSchema', () => {
  it('passes with ideas', () => {
    const result = brainstormingSchema.safeParse({
      ideas: [
        { id: '1', text: 'Automate QC', author: 'Alice', votes: 3, category: 'tech' },
        { id: '2', text: 'Hire more QC staff', author: 'Bob', votes: 1, category: 'people' },
      ],
      selectedIdeas: ['1'],
      eliminatedIdeas: [],
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for empty input', () => {
    const result = brainstormingSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.ideas).toEqual([])
      expect(result.data.selectedIdeas).toEqual([])
      expect(result.data.eliminatedIdeas).toEqual([])
    }
  })
})

describe('brainwritingSchema', () => {
  it('passes with rounds', () => {
    const result = brainwritingSchema.safeParse({
      rounds: [
        {
          roundNumber: 1,
          entries: [{ participant: 'Alice', ideas: ['idea1', 'idea2', 'idea3'] }],
        },
      ],
      allIdeas: ['idea1', 'idea2', 'idea3'],
    })
    expect(result.success).toBe(true)
  })
})

describe('pairedComparisonsSchema', () => {
  it('passes with valid data', () => {
    const result = pairedComparisonsSchema.safeParse({
      options: [
        { id: 'o1', label: 'Option A' },
        { id: 'o2', label: 'Option B' },
      ],
      comparisons: [{ optionA: 'o1', optionB: 'o2', winner: 'o1', notes: 'Better ROI' }],
      results: [
        { optionId: 'o1', wins: 1, rank: 1 },
        { optionId: 'o2', wins: 0, rank: 2 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for empty input', () => {
    const result = pairedComparisonsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.options).toEqual([])
      expect(result.data.comparisons).toEqual([])
      expect(result.data.results).toEqual([])
    }
  })
})

/* ============================================================
   Step 4 — Select & Plan
   ============================================================ */

describe('criteriaMatrixSchema', () => {
  it('passes with solutions and criteria', () => {
    const result = criteriaMatrixSchema.safeParse({
      criteria: [
        { name: 'Cost', weight: 8, description: 'Implementation cost' },
        { name: 'Impact', weight: 10, description: 'Expected improvement' },
      ],
      solutions: [
        { name: 'Automation', scores: { Cost: 3, Impact: 5 } },
        { name: 'Manual process', scores: { Cost: 5, Impact: 2 } },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('fails when criteria name is empty', () => {
    const result = criteriaMatrixSchema.safeParse({
      criteria: [{ name: '', weight: 5, description: 'test' }],
      solutions: [],
    })
    expect(result.success).toBe(false)
  })

  it('fails when weight exceeds 10', () => {
    const result = criteriaMatrixSchema.safeParse({
      criteria: [{ name: 'Cost', weight: 11, description: 'test' }],
      solutions: [],
    })
    expect(result.success).toBe(false)
  })
})

describe('implementationPlanSchema', () => {
  it('passes with valid plan data', () => {
    const result = implementationPlanSchema.safeParse({
      selectedSolution: 'Automate QC',
      tasks: [
        {
          id: 'task-1',
          title: 'Set up automation',
          assignee: 'Alice',
          dueDate: '2026-06-01',
          status: 'not_started',
          notes: '',
        },
      ],
      timeline: 'Q3 2026',
      resources: '2 engineers',
      budget: '$50,000',
      risks: [{ risk: 'Vendor delay', mitigation: 'Have backup vendor' }],
    })
    expect(result.success).toBe(true)
  })
})

describe('raciSchema', () => {
  it('passes with valid RACI matrix', () => {
    const result = raciSchema.safeParse({
      activities: ['Design', 'Build'],
      people: ['Alice', 'Bob'],
      matrix: {
        Design: { Alice: 'R', Bob: 'C' },
        Build: { Alice: 'A', Bob: 'R' },
      },
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid RACI value', () => {
    const result = raciSchema.safeParse({
      activities: ['Design'],
      people: ['Alice'],
      matrix: {
        Design: { Alice: 'X' },
      },
    })
    expect(result.success).toBe(false)
  })
})

/* ============================================================
   Step 5 — Implement
   ============================================================ */

describe('milestoneTrackerSchema', () => {
  it('passes with milestones and progress', () => {
    const result = milestoneTrackerSchema.safeParse({
      milestones: [
        {
          id: 'ms-1',
          title: 'Phase 1 complete',
          targetDate: '2026-06-01',
          completedDate: null,
          status: 'pending',
          description: 'First phase',
          deliverables: ['Design doc', 'Prototype'],
        },
      ],
      overallProgress: 25,
    })
    expect(result.success).toBe(true)
  })

  it('fails when progress exceeds 100', () => {
    const result = milestoneTrackerSchema.safeParse({
      milestones: [],
      overallProgress: 101,
    })
    expect(result.success).toBe(false)
  })
})

describe('implementationChecklistSchema', () => {
  it('passes with checklist items', () => {
    const result = implementationChecklistSchema.safeParse({
      items: [
        {
          id: 'item-1',
          text: 'Install new software',
          completed: false,
          assignee: 'Alice',
          notes: '',
          category: 'Setup',
        },
      ],
    })
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   Step 6 — Evaluate
   ============================================================ */

describe('beforeAfterSchema', () => {
  it('passes with metrics comparison', () => {
    const result = beforeAfterSchema.safeParse({
      metrics: [
        {
          name: 'Defect Rate',
          before: '5%',
          after: '1.8%',
          unit: '%',
          improvement: '64%',
        },
      ],
      summary: 'Significant improvement achieved',
    })
    expect(result.success).toBe(true)
  })
})

describe('evaluationSchema', () => {
  it('passes with valid evaluation data', () => {
    const result = evaluationSchema.safeParse({
      goalsAchieved: true,
      goalDetails: 'All targets met',
      effectivenessRating: 5,
      sustainabilityRating: 4,
      teamSatisfactionRating: 4,
      unexpectedOutcomes: 'Morale boost',
      recommendations: 'Roll out to other departments',
      nextSteps: 'Start new PIPS cycle for Dept B',
    })
    expect(result.success).toBe(true)
  })

  it('fails when rating exceeds 5', () => {
    const result = evaluationSchema.safeParse({
      goalsAchieved: true,
      goalDetails: 'test',
      effectivenessRating: 6,
      sustainabilityRating: 4,
      teamSatisfactionRating: 4,
      unexpectedOutcomes: '',
      recommendations: '',
      nextSteps: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('lessonsLearnedSchema', () => {
  it('passes with valid lessons learned data', () => {
    const result = lessonsLearnedSchema.safeParse({
      wentWell: ['Strong team collaboration', 'Executive support'],
      improvements: ['More frequent check-ins needed'],
      actionItems: [
        {
          description: 'Document SOPs',
          owner: 'Alice',
          dueDate: '2026-07-01',
        },
      ],
      keyTakeaways: 'Start with pilot, then scale',
    })
    expect(result.success).toBe(true)
  })
})

describe('balanceSheetSchema', () => {
  it('passes with valid data', () => {
    const result = balanceSheetSchema.safeParse({
      gains: [{ id: 'g1', description: 'Reduced defects', impact: 'high', evidence: 'QC reports' }],
      losses: [
        { id: 'l1', description: 'Training cost', impact: 'medium', mitigation: 'Phased rollout' },
      ],
      observations: [{ id: 'o1', description: 'Team morale improved', category: 'people' }],
      summary: 'Net positive outcome',
      recommendation: 'sustain',
    })
    expect(result.success).toBe(true)
  })

  it('applies defaults for empty input', () => {
    const result = balanceSheetSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.gains).toEqual([])
      expect(result.data.losses).toEqual([])
      expect(result.data.observations).toEqual([])
      expect(result.data.summary).toBe('')
      expect(result.data.recommendation).toBe('')
    }
  })
})
