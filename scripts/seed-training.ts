#!/usr/bin/env npx tsx
/**
 * Training Seeder — Upserts training paths, modules, and exercises into Supabase
 *
 * Usage: npx tsx scripts/seed-training.ts
 *
 * Writes to: training_paths, training_modules, training_exercises (upsert by id)
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TrainingPath = {
  id: string
  title: string
  description: string
  estimated_hours: number
  target_audience: string
  sort_order: number
  is_active: boolean
}

type TrainingModule = {
  id: string
  path_id: string
  title: string
  description: string
  estimated_minutes: number
  sort_order: number
  content_node_ids: string[]
  prerequisites: string[]
}

type TrainingExercise = {
  id: string
  module_id: string
  type: 'multiple-choice' | 'fill-form' | 'reflection' | 'scenario-practice'
  title: string
  instructions: string
  scenario_id: string | null
  form_type: string | null
  expected_minutes: number
  sort_order: number
  config: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Training Paths
// ---------------------------------------------------------------------------

const paths: TrainingPath[] = [
  {
    id: 'path-quick-start',
    title: 'Quick Start',
    description:
      'Get up and running with PIPS in under an hour. Learn the six steps, try a guided problem statement, and see how the cycle works end to end.',
    estimated_hours: 1,
    target_audience: 'First-time users',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'path-fundamentals',
    title: 'PIPS Fundamentals',
    description:
      'A thorough walk-through of every PIPS step with hands-on exercises for each. Designed for new team members who need to build confidence with the full methodology.',
    estimated_hours: 5,
    target_audience: 'New team members',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'path-facilitator',
    title: 'Facilitator Certification',
    description:
      'Advanced training for managers and facilitators who will lead PIPS sessions. Covers facilitation techniques, session design, common pitfalls, and how to build a PIPS culture.',
    estimated_hours: 9,
    target_audience: 'Managers and facilitators',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'path-tool-mastery',
    title: 'Tool Mastery',
    description:
      'Standalone modules for each PIPS tool — fishbone, force-field, brainwriting, criteria matrix, and more. Complete any module in about 30 minutes.',
    estimated_hours: 5,
    target_audience: 'Anyone wanting to master individual tools',
    sort_order: 4,
    is_active: true,
  },
]

// ---------------------------------------------------------------------------
// Quick Start Modules (3)
// ---------------------------------------------------------------------------

const quickStartModules: TrainingModule[] = [
  {
    id: 'mod-qs-1',
    path_id: 'path-quick-start',
    title: 'What Is PIPS?',
    description:
      'A 15-minute overview of the six-step cycle, the three principles, and where PIPS fits in your organization.',
    estimated_minutes: 15,
    sort_order: 1,
    content_node_ids: [
      'book/ch02/the-name-tells-you-what-it-is',
      'book/ch02/what-pips-is',
      'book/ch03/the-three-principles-together',
      'book/appendix-b/pips-overview-the-six-step-cycle',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-qs-2',
    path_id: 'path-quick-start',
    title: 'Your First Problem Statement',
    description:
      'Write a real problem statement using the PIPS framework. Practice the cardinal rule and learn what makes a problem statement effective.',
    estimated_minutes: 20,
    sort_order: 2,
    content_node_ids: [
      'book/ch04/the-problem-statement-framework',
      'book/ch04/the-cardinal-rule-of-problem-statements',
      'book/appendix-b/step-1-identify-and-select-the-problem',
    ],
    prerequisites: ['mod-qs-1'],
  },
  {
    id: 'mod-qs-3',
    path_id: 'path-quick-start',
    title: 'The Full Cycle in Action',
    description:
      'Walk through the Meridian Health Systems case study to see all six steps in action, then reflect on how the cycle applies to your own work.',
    estimated_minutes: 25,
    sort_order: 3,
    content_node_ids: [
      'book/ch04/running-case-study-meridian-health-systems',
      'book/ch05/running-case-study-meridian-health-systems',
      'book/ch06/running-case-study-meridian-health-systems',
      'book/ch07/meridian-health-systems-selecting-and-planning',
      'book/ch08/meridian-health-systems-implementation',
      'book/ch09/meridian-health-systems-the-six-month-evaluation',
    ],
    prerequisites: ['mod-qs-2'],
  },
]

// ---------------------------------------------------------------------------
// Fundamentals Modules (8: intro + 6 steps + wrap-up)
// ---------------------------------------------------------------------------

const fundamentalsModules: TrainingModule[] = [
  {
    id: 'mod-fund-intro',
    path_id: 'path-fundamentals',
    title: 'Introduction to PIPS',
    description:
      'Understand the problems PIPS was designed to solve, the three core principles, and how the methodology scales from 5-minute fixes to multi-week strategic initiatives.',
    estimated_minutes: 30,
    sort_order: 1,
    content_node_ids: [
      'book/ch01/the-firefighting-trap',
      'book/ch01/the-solution-first-disease',
      'book/ch02/what-pips-is',
      'book/ch03/principle-1-data-over-opinions',
      'book/ch03/principle-2-expand-then-contract-diverge-then-converge',
      'book/ch03/principle-3-close-the-loop',
      'book/ch11/the-key-proportionality',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-fund-step1',
    path_id: 'path-fundamentals',
    title: 'Step 1 — Identify the Problem',
    description:
      'Learn to write clear problem statements, avoid embedding solutions, and select the right problem to work on using the six selection factors.',
    estimated_minutes: 45,
    sort_order: 2,
    content_node_ids: [
      'book/ch04',
      'book/ch04/the-problem-statement-framework',
      'book/ch04/the-cardinal-rule-of-problem-statements',
      'book/ch04/the-six-selection-factors',
      'book/ch04/the-tools-of-step-1',
      'book/appendix-b/step-1-identify-and-select-the-problem',
    ],
    prerequisites: ['mod-fund-intro'],
  },
  {
    id: 'mod-fund-step2',
    path_id: 'path-fundamentals',
    title: 'Step 2 — Analyze the Problem',
    description:
      'Master root cause analysis with fishbone diagrams, force-field analysis, checksheets, and the cause-and-effect verification table.',
    estimated_minutes: 50,
    sort_order: 3,
    content_node_ids: [
      'book/ch05',
      'book/ch05/the-six-step-analysis-process',
      'book/ch05/the-fishbone-diagram-ishikawa-diagram',
      'book/ch05/force-field-analysis',
      'book/ch05/the-cause-and-effect-verification-table',
      'book/ch05/checksheets-histograms-and-pareto-analysis',
      'book/ch05/the-tools-of-step-2',
      'book/appendix-b/step-2-analyze-the-problem',
    ],
    prerequisites: ['mod-fund-step1'],
  },
  {
    id: 'mod-fund-step3',
    path_id: 'path-fundamentals',
    title: 'Step 3 — Generate Solutions',
    description:
      "Apply Osborn's four rules of brainstorming, learn three brainstorming methods, and discover when brainwriting beats talking.",
    estimated_minutes: 40,
    sort_order: 4,
    content_node_ids: [
      'book/ch06',
      'book/ch06/the-foundation-osborn-s-four-rules',
      'book/ch06/three-brainstorming-methods',
      'book/ch06/brainwriting-when-writing-beats-talking',
      'book/ch06/the-tools-of-step-3',
      'book/appendix-b/step-3-generate-potential-solutions',
    ],
    prerequisites: ['mod-fund-step2'],
  },
  {
    id: 'mod-fund-step4',
    path_id: 'path-fundamentals',
    title: 'Step 4 — Select & Plan',
    description:
      'Use scoring systems, consensus techniques, and cost-benefit analysis to pick the best solution, then plan the implementation with RACI and milestones.',
    estimated_minutes: 50,
    sort_order: 5,
    content_node_ids: [
      'book/ch07',
      'book/ch07/the-selection-process',
      'book/ch07/scoring-systems-making-the-invisible-visible',
      'book/ch07/consensus-not-what-you-think-it-means',
      'book/ch07/cost-benefit-analysis-and-balance-sheets',
      'book/ch07/phase-2-planning-the-implementation',
      'book/appendix-b/step-4-select-and-plan-the-solution',
    ],
    prerequisites: ['mod-fund-step3'],
  },
  {
    id: 'mod-fund-step5',
    path_id: 'path-fundamentals',
    title: 'Step 5 — Implement',
    description:
      'Execute the plan: the four steps of implementation, five common failures, and the success factors that keep projects on track.',
    estimated_minutes: 35,
    sort_order: 6,
    content_node_ids: [
      'book/ch08',
      'book/ch08/the-four-steps-of-implementation',
      'book/ch08/the-five-common-implementation-failures',
      'book/ch08/success-factors',
      'book/ch08/proportionality',
      'book/appendix-b/step-5-implement-the-solution',
    ],
    prerequisites: ['mod-fund-step4'],
  },
  {
    id: 'mod-fund-step6',
    path_id: 'path-fundamentals',
    title: 'Step 6 — Evaluate',
    description:
      'Close the loop: three evaluation questions, the five-step evaluation process, and the three outcome paths that determine what happens next.',
    estimated_minutes: 35,
    sort_order: 7,
    content_node_ids: [
      'book/ch09',
      'book/ch09/open-loop-vs-closed-loop-problem-solving',
      'book/ch09/three-evaluation-questions',
      'book/ch09/the-five-step-evaluation-process',
      'book/ch09/three-outcome-paths-plus-one',
      'book/appendix-b/step-6-evaluate-the-solution',
    ],
    prerequisites: ['mod-fund-step5'],
  },
  {
    id: 'mod-fund-wrapup',
    path_id: 'path-fundamentals',
    title: 'Putting It All Together',
    description:
      'Review the full cycle, learn about proportionality (5-minute PIPS vs. multi-week PIPS), and plan how to apply PIPS in your own role.',
    estimated_minutes: 30,
    sort_order: 8,
    content_node_ids: [
      'book/ch11/the-5-minute-pips',
      'book/ch11/the-1-hour-pips',
      'book/ch11/the-multi-week-pips',
      'book/ch11/teaching-people-to-think-in-pips',
      'book/ch10/the-common-thread',
      'book/conclusion/just-start',
    ],
    prerequisites: ['mod-fund-step6'],
  },
]

// ---------------------------------------------------------------------------
// Facilitator Certification Modules (6)
// ---------------------------------------------------------------------------

const facilitatorModules: TrainingModule[] = [
  {
    id: 'mod-fac-1',
    path_id: 'path-facilitator',
    title: 'The Facilitator Role',
    description:
      "Understand what makes facilitation different from leading or managing. Learn the team roles and the facilitator's mindset.",
    estimated_minutes: 60,
    sort_order: 1,
    content_node_ids: [
      'book/ch13/team-roles',
      'book/ch13/the-facilitator-s-mindset',
      'book/ch13/facilitation-techniques',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-fac-2',
    path_id: 'path-facilitator',
    title: 'Session Design & Cadence',
    description:
      'Design effective PIPS sessions: agenda structure, time-boxing, virtual vs. in-person considerations, and meeting cadence.',
    estimated_minutes: 60,
    sort_order: 2,
    content_node_ids: [
      'book/ch13/session-design',
      'book/ch13/meeting-cadence',
      'book/ch13/virtual-facilitation',
    ],
    prerequisites: ['mod-fac-1'],
  },
  {
    id: 'mod-fac-3',
    path_id: 'path-facilitator',
    title: 'Common Challenges & Failures',
    description:
      'Recognize and overcome the seven common PIPS failures and the typical facilitation challenges that derail teams.',
    estimated_minutes: 90,
    sort_order: 3,
    content_node_ids: [
      'book/ch13/common-facilitation-challenges',
      'book/ch14/failure-1-skipping-steps-1-and-2',
      'book/ch14/failure-2-solution-laden-problem-statements',
      'book/ch14/failure-3-death-by-committee',
      'book/ch14/failure-4-the-shelf-study',
      'book/ch14/failure-5-declaring-victory-too-early',
      'book/ch14/failure-6-pips-theater',
      'book/ch14/failure-7-the-pilot-that-never-scales',
      'book/ch14/a-pattern-in-the-failures',
    ],
    prerequisites: ['mod-fac-2'],
  },
  {
    id: 'mod-fac-4',
    path_id: 'path-facilitator',
    title: 'Building a PIPS Culture',
    description:
      'The five conditions for a sustainable PIPS culture: psychological safety, common language, leadership commitment, process celebration, and ease of use.',
    estimated_minutes: 90,
    sort_order: 4,
    content_node_ids: [
      'book/ch12/condition-1-psychological-safety',
      'book/ch12/condition-2-common-language',
      'book/ch12/condition-3-visible-leadership-commitment',
      'book/ch12/condition-4-celebrate-the-process-not-just-results',
      'book/ch12/condition-5-make-it-easy',
      'book/ch12/handling-resistance',
      'book/ch12/the-long-game',
    ],
    prerequisites: ['mod-fac-3'],
  },
  {
    id: 'mod-fac-5',
    path_id: 'path-facilitator',
    title: 'The Living System',
    description:
      'Understand the PIPS ecosystem, maturity model, and cadence. Learn how to sustain continuous improvement as a permanent organizational capability.',
    estimated_minutes: 75,
    sort_order: 5,
    content_node_ids: [
      'book/ch15/the-pips-ecosystem',
      'book/ch15/the-pips-cadence',
      'book/ch15/the-maturity-model',
      'book/ch15/the-human-side-of-the-living-system',
      'book/ch15/the-objective-is-never-complete',
    ],
    prerequisites: ['mod-fac-4'],
  },
  {
    id: 'mod-fac-6',
    path_id: 'path-facilitator',
    title: 'Certification Assessment',
    description:
      'Demonstrate your facilitator skills by running a full guided scenario end-to-end and reflecting on facilitation decisions.',
    estimated_minutes: 120,
    sort_order: 6,
    content_node_ids: [
      'book/ch13',
      'book/ch14',
      'book/ch12',
      'book/appendix-b/pips-overview-the-six-step-cycle',
    ],
    prerequisites: ['mod-fac-5'],
  },
]

// ---------------------------------------------------------------------------
// Tool Mastery Modules (10)
// ---------------------------------------------------------------------------

const toolMasteryModules: TrainingModule[] = [
  {
    id: 'mod-tool-problem-statement',
    path_id: 'path-tool-mastery',
    title: 'Problem Statement',
    description:
      'Master the art of writing clear, measurable problem statements that follow the PIPS cardinal rule.',
    estimated_minutes: 30,
    sort_order: 1,
    content_node_ids: [
      'book/ch04/the-problem-statement-framework',
      'book/ch04/the-cardinal-rule-of-problem-statements',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-fishbone',
    path_id: 'path-tool-mastery',
    title: 'Fishbone (Ishikawa) Diagram',
    description:
      'Build fishbone diagrams to map cause-and-effect relationships and identify root causes across categories.',
    estimated_minutes: 30,
    sort_order: 2,
    content_node_ids: [
      'book/ch05/the-fishbone-diagram-ishikawa-diagram',
      'book/appendix-a/12-fishbone-ishikawa-diagram',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-five-why',
    path_id: 'path-tool-mastery',
    title: 'Five-Why Analysis',
    description:
      'Use the 5-Why technique to drill past symptoms to root causes, with verification at each level.',
    estimated_minutes: 25,
    sort_order: 3,
    content_node_ids: [
      'book/ch05/the-six-step-analysis-process',
      'book/ch05/the-cause-and-effect-verification-table',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-force-field',
    path_id: 'path-tool-mastery',
    title: 'Force-Field Analysis',
    description:
      'Map driving and restraining forces to understand what supports or blocks a proposed change.',
    estimated_minutes: 30,
    sort_order: 4,
    content_node_ids: ['book/ch05/force-field-analysis', 'book/appendix-a/13-force-field-analysis'],
    prerequisites: [],
  },
  {
    id: 'mod-tool-brainstorming',
    path_id: 'path-tool-mastery',
    title: 'Brainstorming & Brainwriting',
    description:
      'Learn three brainstorming methods and the brainwriting technique for quieter or remote teams.',
    estimated_minutes: 30,
    sort_order: 5,
    content_node_ids: [
      'book/ch06/the-foundation-osborn-s-four-rules',
      'book/ch06/three-brainstorming-methods',
      'book/ch06/brainwriting-when-writing-beats-talking',
      'book/appendix-a/1-brainstorming',
      'book/appendix-a/2-brainwriting',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-criteria-matrix',
    path_id: 'path-tool-mastery',
    title: 'Criteria Rating Matrix',
    description:
      'Score and compare solutions against weighted criteria to make selection decisions visible and defensible.',
    estimated_minutes: 30,
    sort_order: 6,
    content_node_ids: [
      'book/ch07/scoring-systems-making-the-invisible-visible',
      'book/appendix-a/7-criteria-rating-form',
      'book/appendix-a/9-point-scoring-system',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-paired-comparisons',
    path_id: 'path-tool-mastery',
    title: 'Paired Comparisons & Weighted Voting',
    description:
      'Use paired comparisons and weighted voting to reduce a long list of options to a shortlist.',
    estimated_minutes: 25,
    sort_order: 7,
    content_node_ids: ['book/appendix-a/6-weighted-voting', 'book/appendix-a/8-paired-comparisons'],
    prerequisites: [],
  },
  {
    id: 'mod-tool-raci',
    path_id: 'path-tool-mastery',
    title: 'RACI Matrix',
    description:
      'Define who is Responsible, Accountable, Consulted, and Informed for every action in your implementation plan.',
    estimated_minutes: 25,
    sort_order: 8,
    content_node_ids: [
      'book/ch07/phase-2-planning-the-implementation',
      'book/appendix-a/21-raci-matrix',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-checksheet-pareto',
    path_id: 'path-tool-mastery',
    title: 'Checksheets, Histograms & Pareto',
    description:
      'Collect data with checksheets, visualize it with histograms, and prioritize with Pareto analysis (the 80/20 rule).',
    estimated_minutes: 30,
    sort_order: 9,
    content_node_ids: [
      'book/ch05/checksheets-histograms-and-pareto-analysis',
      'book/appendix-a/14-checksheet',
      'book/appendix-a/15-histogram',
      'book/appendix-a/17-pareto-analysis',
    ],
    prerequisites: [],
  },
  {
    id: 'mod-tool-balance-sheet',
    path_id: 'path-tool-mastery',
    title: 'Balance Sheet & Cost-Benefit Analysis',
    description:
      'Weigh pros and cons with a structured balance sheet and conduct a cost-benefit analysis to justify your solution.',
    estimated_minutes: 30,
    sort_order: 10,
    content_node_ids: [
      'book/ch07/cost-benefit-analysis-and-balance-sheets',
      'book/appendix-a/10-balance-sheet-pros-cons',
      'book/appendix-a/11-cost-benefit-analysis',
    ],
    prerequisites: [],
  },
]

// ---------------------------------------------------------------------------
// Exercises — Quick Start
// ---------------------------------------------------------------------------

const quickStartExercises: TrainingExercise[] = [
  // Module 1: What Is PIPS?
  {
    id: 'ex-qs-1-mc-1',
    module_id: 'mod-qs-1',
    type: 'multiple-choice',
    title: 'The Six Steps',
    instructions: 'Test your understanding of the PIPS six-step cycle.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question: 'What is the correct order of the six PIPS steps?',
      options: [
        'Analyze, Identify, Generate, Plan, Implement, Evaluate',
        'Identify, Analyze, Generate, Select & Plan, Implement, Evaluate',
        'Identify, Generate, Analyze, Select & Plan, Evaluate, Implement',
        'Analyze, Generate, Identify, Select & Plan, Implement, Evaluate',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'ex-qs-1-mc-2',
    module_id: 'mod-qs-1',
    type: 'multiple-choice',
    title: 'The Three Principles',
    instructions: 'Identify the three core PIPS principles.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'Which of the following is NOT one of the three core PIPS principles?',
      options: [
        'Data over opinions',
        'Expand then contract (diverge then converge)',
        'Move fast and break things',
        'Close the loop',
      ],
      correctIndex: 2,
    },
  },
  // Module 2: Your First Problem Statement
  {
    id: 'ex-qs-2-ff-1',
    module_id: 'mod-qs-2',
    type: 'fill-form',
    title: 'Write a Problem Statement',
    instructions:
      'Practice writing your first problem statement. Focus on describing the gap between the current state and the desired state without embedding a solution.',
    scenario_id: null,
    form_type: 'problem_statement',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'problem_statement',
      stepNumber: 1,
    },
  },
  {
    id: 'ex-qs-2-mc-1',
    module_id: 'mod-qs-2',
    type: 'multiple-choice',
    title: 'The Cardinal Rule',
    instructions: 'Test your understanding of the most important rule for problem statements.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'What is the cardinal rule of PIPS problem statements?',
      options: [
        'They must be fewer than 50 words',
        'They must never embed or imply a solution',
        'They must be approved by management first',
        'They must reference a specific department',
      ],
      correctIndex: 1,
    },
  },
  // Module 3: The Full Cycle in Action
  {
    id: 'ex-qs-3-ref-1',
    module_id: 'mod-qs-3',
    type: 'reflection',
    title: 'Applying the Cycle',
    instructions:
      'After reading the Meridian Health Systems case study, reflect on how the PIPS cycle could apply to a problem you are currently facing at work.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 10,
    sort_order: 1,
    config: {
      prompt:
        'Think of a problem you are currently dealing with at work. Describe the problem briefly, then outline which PIPS steps you would take first and why. What data would you collect in Step 2?',
      minWords: 50,
    },
  },
  {
    id: 'ex-qs-3-sp-1',
    module_id: 'mod-qs-3',
    type: 'scenario-practice',
    title: 'Guided Walkthrough',
    instructions:
      'Complete the guided parking lot scenario to practice the first three PIPS steps end to end.',
    scenario_id: 'parking-lot-guided',
    form_type: null,
    expected_minutes: 15,
    sort_order: 2,
    config: {
      scenarioSlug: 'parking-lot-guided',
      requiredSteps: [1, 2, 3],
    },
  },
]

// ---------------------------------------------------------------------------
// Exercises — Fundamentals
// ---------------------------------------------------------------------------

const fundamentalsExercises: TrainingExercise[] = [
  // Intro module
  {
    id: 'ex-fund-intro-mc-1',
    module_id: 'mod-fund-intro',
    type: 'multiple-choice',
    title: 'Why PIPS Exists',
    instructions: 'Test your understanding of the problems PIPS was designed to solve.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question: 'Which of these organizational dysfunctions does PIPS specifically address?',
      options: [
        'Budget overruns on capital projects',
        'The firefighting trap and solution-first disease',
        'Employee benefits administration',
        'Supply chain logistics optimization',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'ex-fund-intro-ref-1',
    module_id: 'mod-fund-intro',
    type: 'reflection',
    title: 'Your Organization Today',
    instructions: 'Reflect on how the common dysfunctions show up in your current work.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 8,
    sort_order: 2,
    config: {
      prompt:
        'Think about a recent problem at your organization that was solved with a quick fix rather than proper analysis. What happened? Did the problem come back? What would have been different if the team had used a structured approach?',
      minWords: 50,
    },
  },
  // Step 1
  {
    id: 'ex-fund-s1-ff-1',
    module_id: 'mod-fund-step1',
    type: 'fill-form',
    title: 'Problem Statement Practice',
    instructions:
      'Write a complete problem statement for a real issue in your workplace using the PIPS framework.',
    scenario_id: null,
    form_type: 'problem_statement',
    expected_minutes: 12,
    sort_order: 1,
    config: {
      formType: 'problem_statement',
      stepNumber: 1,
    },
  },
  {
    id: 'ex-fund-s1-mc-1',
    module_id: 'mod-fund-step1',
    type: 'multiple-choice',
    title: 'Selection Factors',
    instructions: 'Test your knowledge of the problem selection criteria.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'How many selection factors does the full PIPS problem selection process use?',
      options: ['Three', 'Four', 'Six', 'Eight'],
      correctIndex: 2,
    },
  },
  {
    id: 'ex-fund-s1-mc-2',
    module_id: 'mod-fund-step1',
    type: 'multiple-choice',
    title: 'Solution-Laden Statements',
    instructions: 'Identify which problem statement violates the cardinal rule.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 3,
    config: {
      question: 'Which of these problem statements violates the cardinal rule?',
      options: [
        'Customer complaint resolution time has increased from 2 days to 7 days over the past quarter.',
        'We need to hire two more customer service representatives.',
        'Employee turnover in the shipping department is 35%, compared to 12% company-wide.',
        'Order accuracy has dropped from 99.2% to 94.8% in the last six months.',
      ],
      correctIndex: 1,
    },
  },
  // Step 2
  {
    id: 'ex-fund-s2-ff-1',
    module_id: 'mod-fund-step2',
    type: 'fill-form',
    title: 'Fishbone Diagram',
    instructions:
      'Build a fishbone diagram for your problem statement. Identify causes across all relevant categories.',
    scenario_id: null,
    form_type: 'fishbone',
    expected_minutes: 15,
    sort_order: 1,
    config: {
      formType: 'fishbone',
      stepNumber: 2,
    },
  },
  {
    id: 'ex-fund-s2-ff-2',
    module_id: 'mod-fund-step2',
    type: 'fill-form',
    title: 'Five-Why Analysis',
    instructions:
      'Take the top cause from your fishbone and drill down with five levels of "why" to reach the root cause.',
    scenario_id: null,
    form_type: 'five_why',
    expected_minutes: 10,
    sort_order: 2,
    config: {
      formType: 'five_why',
      stepNumber: 2,
    },
  },
  {
    id: 'ex-fund-s2-mc-1',
    module_id: 'mod-fund-step2',
    type: 'multiple-choice',
    title: 'Analysis Process',
    instructions: 'Check your understanding of the PIPS analysis process.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 3,
    config: {
      question: 'In PIPS Step 2, what should you do BEFORE collecting data?',
      options: [
        'Jump straight into a fishbone diagram',
        'Define what data you need, how you will collect it, and what baseline looks like',
        'Ask management what they think the root cause is',
        'Brainstorm solutions to test',
      ],
      correctIndex: 1,
    },
  },
  // Step 3
  {
    id: 'ex-fund-s3-ff-1',
    module_id: 'mod-fund-step3',
    type: 'fill-form',
    title: 'Brainstorming Session',
    instructions:
      "Generate at least 10 potential solutions using the brainstorming form. Remember Osborn's four rules: defer judgment, go for quantity, encourage wild ideas, build on others' ideas.",
    scenario_id: null,
    form_type: 'brainstorming',
    expected_minutes: 12,
    sort_order: 1,
    config: {
      formType: 'brainstorming',
      stepNumber: 3,
    },
  },
  {
    id: 'ex-fund-s3-mc-1',
    module_id: 'mod-fund-step3',
    type: 'multiple-choice',
    title: "Osborn's Rules",
    instructions: 'Test your knowledge of brainstorming fundamentals.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: "Which of the following is one of Osborn's four rules of brainstorming?",
      options: [
        'Evaluate each idea as it is suggested',
        'Limit sessions to 15 minutes',
        'Go for quantity over quality',
        'Only the facilitator may suggest ideas',
      ],
      correctIndex: 2,
    },
  },
  // Step 4
  {
    id: 'ex-fund-s4-ff-1',
    module_id: 'mod-fund-step4',
    type: 'fill-form',
    title: 'Criteria Rating Matrix',
    instructions: 'Score your top solutions against weighted criteria to select the best option.',
    scenario_id: null,
    form_type: 'criteria_matrix',
    expected_minutes: 15,
    sort_order: 1,
    config: {
      formType: 'criteria_matrix',
      stepNumber: 4,
    },
  },
  {
    id: 'ex-fund-s4-ff-2',
    module_id: 'mod-fund-step4',
    type: 'fill-form',
    title: 'Implementation Plan',
    instructions:
      'Create an implementation plan for your selected solution with milestones and owners.',
    scenario_id: null,
    form_type: 'implementation_plan',
    expected_minutes: 15,
    sort_order: 2,
    config: {
      formType: 'implementation_plan',
      stepNumber: 4,
    },
  },
  {
    id: 'ex-fund-s4-mc-1',
    module_id: 'mod-fund-step4',
    type: 'multiple-choice',
    title: 'Consensus',
    instructions: 'Check your understanding of consensus in the PIPS context.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 3,
    config: {
      question: 'In PIPS, what does consensus actually mean?',
      options: [
        'Everyone must agree the solution is perfect',
        'A simple majority vote wins',
        'Everyone can live with and support the decision, even if it is not their first choice',
        'The most senior person makes the final call',
      ],
      correctIndex: 2,
    },
  },
  // Step 5
  {
    id: 'ex-fund-s5-ff-1',
    module_id: 'mod-fund-step5',
    type: 'fill-form',
    title: 'Milestone Tracker',
    instructions:
      'Set up a milestone tracker for your implementation plan with clear deliverables and dates.',
    scenario_id: null,
    form_type: 'milestone_tracker',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'milestone_tracker',
      stepNumber: 5,
    },
  },
  {
    id: 'ex-fund-s5-mc-1',
    module_id: 'mod-fund-step5',
    type: 'multiple-choice',
    title: 'Implementation Failures',
    instructions: 'Identify common implementation pitfalls.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'Which of the following is one of the five common implementation failures?',
      options: [
        'Using too much data',
        'Having too many team members',
        'Declaring victory too early',
        'Spending too long on the plan',
      ],
      correctIndex: 2,
    },
  },
  // Step 6
  {
    id: 'ex-fund-s6-ff-1',
    module_id: 'mod-fund-step6',
    type: 'fill-form',
    title: 'Before & After Comparison',
    instructions:
      'Fill in a before-and-after comparison form to evaluate the impact of a solution.',
    scenario_id: null,
    form_type: 'before_after',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'before_after',
      stepNumber: 6,
    },
  },
  {
    id: 'ex-fund-s6-ff-2',
    module_id: 'mod-fund-step6',
    type: 'fill-form',
    title: 'Lessons Learned',
    instructions:
      'Complete a lessons-learned form reflecting on what worked, what did not, and what you would do differently.',
    scenario_id: null,
    form_type: 'lessons_learned',
    expected_minutes: 10,
    sort_order: 2,
    config: {
      formType: 'lessons_learned',
      stepNumber: 6,
    },
  },
  {
    id: 'ex-fund-s6-mc-1',
    module_id: 'mod-fund-step6',
    type: 'multiple-choice',
    title: 'Outcome Paths',
    instructions: 'Test your understanding of what happens after evaluation.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 3,
    config: {
      question: 'How many outcome paths does PIPS define after Step 6 evaluation?',
      options: ['Two', 'Three (plus one)', 'Four', 'Five'],
      correctIndex: 1,
    },
  },
  // Wrap-up
  {
    id: 'ex-fund-wrap-ref-1',
    module_id: 'mod-fund-wrapup',
    type: 'reflection',
    title: 'Your PIPS Action Plan',
    instructions:
      'Create a personal action plan for applying PIPS in your role. Think about which scale of PIPS (5-minute, 1-hour, multi-week) is most relevant for your daily work.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 10,
    sort_order: 1,
    config: {
      prompt:
        'Describe one problem you will tackle using PIPS in the next two weeks. What scale of PIPS will you use (5-minute, 1-hour, or multi-week)? Which steps are you most confident about, and which ones will require the most discipline? What support will you need from your team?',
      minWords: 75,
    },
  },
  {
    id: 'ex-fund-wrap-sp-1',
    module_id: 'mod-fund-wrapup',
    type: 'scenario-practice',
    title: 'End-to-End Scenario',
    instructions:
      'Work through a complete six-step PIPS scenario from problem identification to evaluation.',
    scenario_id: 'onboarding-delays-full',
    form_type: null,
    expected_minutes: 20,
    sort_order: 2,
    config: {
      scenarioSlug: 'onboarding-delays-full',
      requiredSteps: [1, 2, 3, 4, 5, 6],
    },
  },
]

// ---------------------------------------------------------------------------
// Exercises — Facilitator Certification
// ---------------------------------------------------------------------------

const facilitatorExercises: TrainingExercise[] = [
  // Module 1: The Facilitator Role
  {
    id: 'ex-fac-1-mc-1',
    module_id: 'mod-fac-1',
    type: 'multiple-choice',
    title: 'Team Roles',
    instructions: 'Test your understanding of PIPS team roles.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question: 'What is the primary responsibility of the PIPS facilitator?',
      options: [
        'Making the final decision on which solution to implement',
        'Guiding the process, managing participation, and keeping the team on track',
        'Collecting all the data for the team',
        'Presenting results to senior management',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'ex-fac-1-ref-1',
    module_id: 'mod-fac-1',
    type: 'reflection',
    title: 'Your Facilitation Style',
    instructions: 'Reflect on your natural facilitation tendencies and areas for growth.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 10,
    sort_order: 2,
    config: {
      prompt:
        'Think about the last time you led or facilitated a group discussion. What went well? Where did you struggle? Based on what you learned about the facilitator mindset, what is one specific behavior you want to change in your next session?',
      minWords: 75,
    },
  },
  // Module 2: Session Design
  {
    id: 'ex-fac-2-mc-1',
    module_id: 'mod-fac-2',
    type: 'multiple-choice',
    title: 'Session Design Basics',
    instructions: 'Test your knowledge of effective PIPS session design.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question: 'What is the most important element of PIPS session design?',
      options: [
        'Having the right snacks in the room',
        'A clear objective, time-boxed activities, and defined outputs for each session',
        'Using the most advanced digital tools available',
        'Ensuring only senior leaders attend',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'ex-fac-2-ref-1',
    module_id: 'mod-fac-2',
    type: 'reflection',
    title: 'Virtual Facilitation Challenges',
    instructions: 'Reflect on the unique challenges of virtual PIPS facilitation.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 8,
    sort_order: 2,
    config: {
      prompt:
        'Describe three specific challenges you have faced (or expect to face) when facilitating group problem-solving sessions virtually. For each challenge, propose a concrete technique from the reading material that could address it.',
      minWords: 75,
    },
  },
  // Module 3: Common Challenges & Failures
  {
    id: 'ex-fac-3-mc-1',
    module_id: 'mod-fac-3',
    type: 'multiple-choice',
    title: 'The Pattern in Failures',
    instructions: 'Identify the common thread across PIPS failures.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question: 'What is the common pattern across the seven PIPS failures?',
      options: [
        'Teams lack technical skills',
        'Management does not provide enough budget',
        'Teams skip or shortcut the disciplined steps of the process',
        'The tools are too complicated to use',
      ],
      correctIndex: 2,
    },
  },
  {
    id: 'ex-fac-3-mc-2',
    module_id: 'mod-fac-3',
    type: 'multiple-choice',
    title: 'PIPS Theater',
    instructions: 'Identify what PIPS theater looks like in practice.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'What is "PIPS theater"?',
      options: [
        'Using PIPS as a stage performance for team building',
        'Going through the motions of PIPS without genuine commitment to following the data and process',
        'Presenting PIPS results in an overly dramatic way to stakeholders',
        'Using theatrical techniques to improve brainstorming sessions',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'ex-fac-3-sp-1',
    module_id: 'mod-fac-3',
    type: 'scenario-practice',
    title: 'Handling a Stalled Team',
    instructions:
      'Practice facilitating a team that has stalled in Step 2. Diagnose the blockage and guide them forward.',
    scenario_id: 'stalled-analysis-team',
    form_type: null,
    expected_minutes: 15,
    sort_order: 3,
    config: {
      scenarioSlug: 'stalled-analysis-team',
      requiredSteps: [2, 3],
    },
  },
  // Module 4: Building Culture
  {
    id: 'ex-fac-4-mc-1',
    module_id: 'mod-fac-4',
    type: 'multiple-choice',
    title: 'Culture Conditions',
    instructions: 'Test your knowledge of the conditions for a PIPS culture.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question:
        'How many conditions does PIPS define for building a sustainable improvement culture?',
      options: ['Three', 'Four', 'Five', 'Seven'],
      correctIndex: 2,
    },
  },
  {
    id: 'ex-fac-4-ref-1',
    module_id: 'mod-fac-4',
    type: 'reflection',
    title: 'Handling Resistance',
    instructions:
      'Reflect on how you would handle resistance to PIPS adoption in your organization.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 10,
    sort_order: 2,
    config: {
      prompt:
        'Imagine you are rolling out PIPS in your department and a senior colleague says, "We already know how to solve problems. This is just more bureaucracy." How would you respond? What specific actions would you take to win them over without creating conflict? Reference at least two of the five culture conditions in your answer.',
      minWords: 100,
    },
  },
  // Module 5: The Living System
  {
    id: 'ex-fac-5-mc-1',
    module_id: 'mod-fac-5',
    type: 'multiple-choice',
    title: 'Maturity Model',
    instructions: 'Test your understanding of the PIPS maturity model.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 1,
    config: {
      question: 'What is the purpose of the PIPS maturity model?',
      options: [
        'To rank organizations against competitors',
        "To measure and guide an organization's progression in continuous improvement capability",
        'To certify individual facilitators',
        'To determine when an organization can stop using PIPS',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'ex-fac-5-ref-1',
    module_id: 'mod-fac-5',
    type: 'reflection',
    title: "Your Organization's Maturity",
    instructions: 'Assess your own organization against the PIPS maturity model.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 10,
    sort_order: 2,
    config: {
      prompt:
        'Where does your organization currently sit on the PIPS maturity model? What specific evidence supports your assessment? What would it take to move up one level? Describe three concrete actions you could take as a facilitator to accelerate that progress.',
      minWords: 100,
    },
  },
  // Module 6: Certification Assessment
  {
    id: 'ex-fac-6-sp-1',
    module_id: 'mod-fac-6',
    type: 'scenario-practice',
    title: 'Full Facilitation Scenario',
    instructions:
      'Facilitate a complete six-step PIPS process. You will guide a team through every step, making facilitation decisions along the way.',
    scenario_id: 'certification-full-scenario',
    form_type: null,
    expected_minutes: 45,
    sort_order: 1,
    config: {
      scenarioSlug: 'certification-full-scenario',
      requiredSteps: [1, 2, 3, 4, 5, 6],
    },
  },
  {
    id: 'ex-fac-6-ref-1',
    module_id: 'mod-fac-6',
    type: 'reflection',
    title: 'Facilitator Self-Assessment',
    instructions:
      'Write a comprehensive self-assessment of your facilitation readiness and development plan.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 15,
    sort_order: 2,
    config: {
      prompt:
        'Now that you have completed the facilitator certification path, write a self-assessment covering: (1) Your three greatest strengths as a PIPS facilitator, with specific examples. (2) Two areas where you need further development. (3) A 90-day plan for your first three PIPS sessions — what will you facilitate, who will you include, and how will you measure success?',
      minWords: 150,
    },
  },
]

// ---------------------------------------------------------------------------
// Exercises — Tool Mastery
// ---------------------------------------------------------------------------

const toolMasteryExercises: TrainingExercise[] = [
  // Problem Statement
  {
    id: 'ex-tool-ps-ff-1',
    module_id: 'mod-tool-problem-statement',
    type: 'fill-form',
    title: 'Practice Problem Statement',
    instructions:
      'Write three different problem statements for three different situations. Ensure none of them embed a solution.',
    scenario_id: null,
    form_type: 'problem_statement',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'problem_statement',
      stepNumber: 1,
    },
  },
  {
    id: 'ex-tool-ps-mc-1',
    module_id: 'mod-tool-problem-statement',
    type: 'multiple-choice',
    title: 'Spot the Solution',
    instructions: 'Identify which statements violate the cardinal rule.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'Which problem statement is correctly written according to PIPS?',
      options: [
        'We need to implement a new CRM system to improve sales tracking.',
        'Sales conversion rates have declined from 24% to 18% over the past two quarters.',
        'The solution is to hire three additional support staff for the help desk.',
        'We should switch to a cloud-based invoicing platform to reduce billing errors.',
      ],
      correctIndex: 1,
    },
  },
  // Fishbone
  {
    id: 'ex-tool-fish-ff-1',
    module_id: 'mod-tool-fishbone',
    type: 'fill-form',
    title: 'Build a Fishbone Diagram',
    instructions:
      'Create a complete fishbone diagram for the following problem: "Customer support response time has increased from 2 hours to 8 hours."',
    scenario_id: null,
    form_type: 'fishbone',
    expected_minutes: 15,
    sort_order: 1,
    config: {
      formType: 'fishbone',
      stepNumber: 2,
    },
  },
  {
    id: 'ex-tool-fish-mc-1',
    module_id: 'mod-tool-fishbone',
    type: 'multiple-choice',
    title: 'Fishbone Categories',
    instructions: 'Test your knowledge of fishbone diagram categories.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'Which set represents a common set of fishbone diagram categories?',
      options: [
        'Budget, Timeline, Scope, Quality',
        'People, Process, Equipment, Materials, Environment, Management',
        'Marketing, Sales, Support, Engineering',
        'Input, Process, Output, Feedback',
      ],
      correctIndex: 1,
    },
  },
  // Five-Why
  {
    id: 'ex-tool-5w-ff-1',
    module_id: 'mod-tool-five-why',
    type: 'fill-form',
    title: 'Five-Why Drill-Down',
    instructions:
      'Apply the 5-Why technique to this problem: "Monthly reports are consistently delivered 3 days late." Drill through five levels of why.',
    scenario_id: null,
    form_type: 'five_why',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'five_why',
      stepNumber: 2,
    },
  },
  {
    id: 'ex-tool-5w-mc-1',
    module_id: 'mod-tool-five-why',
    type: 'multiple-choice',
    title: '5-Why Best Practice',
    instructions: 'Check your understanding of 5-Why technique.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'What should you do after each "why" in the 5-Why technique?',
      options: [
        'Move on immediately to the next why',
        'Verify the causal link with evidence before continuing',
        'Vote on whether the answer is correct',
        'Document it and move to a different problem',
      ],
      correctIndex: 1,
    },
  },
  // Force-Field
  {
    id: 'ex-tool-ff-ff-1',
    module_id: 'mod-tool-force-field',
    type: 'fill-form',
    title: 'Force-Field Analysis',
    instructions:
      'Map the driving and restraining forces for implementing a new quality check process in your department.',
    scenario_id: null,
    form_type: 'force_field',
    expected_minutes: 12,
    sort_order: 1,
    config: {
      formType: 'force_field',
      stepNumber: 2,
    },
  },
  {
    id: 'ex-tool-ff-mc-1',
    module_id: 'mod-tool-force-field',
    type: 'multiple-choice',
    title: 'Force-Field Strategy',
    instructions: 'Understand when to strengthen vs. weaken forces.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'In force-field analysis, what is generally the more effective strategy?',
      options: [
        'Strengthening driving forces',
        'Weakening restraining forces',
        'Adding entirely new driving forces',
        'Ignoring the restraining forces',
      ],
      correctIndex: 1,
    },
  },
  // Brainstorming & Brainwriting
  {
    id: 'ex-tool-brain-ff-1',
    module_id: 'mod-tool-brainstorming',
    type: 'fill-form',
    title: 'Brainwriting Exercise',
    instructions:
      'Practice brainwriting by generating ideas individually for this prompt: "How might we reduce meeting time by 30% while improving decision quality?"',
    scenario_id: null,
    form_type: 'brainwriting',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'brainwriting',
      stepNumber: 3,
    },
  },
  {
    id: 'ex-tool-brain-mc-1',
    module_id: 'mod-tool-brainstorming',
    type: 'multiple-choice',
    title: 'Brainstorming vs. Brainwriting',
    instructions: 'Understand when to use each technique.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'When is brainwriting typically preferred over verbal brainstorming?',
      options: [
        'When the team is small and everyone is extroverted',
        'When there are quiet team members, remote participants, or a risk of anchoring bias',
        'When the problem is simple and well-understood',
        'When management wants to control the outcome',
      ],
      correctIndex: 1,
    },
  },
  // Criteria Matrix
  {
    id: 'ex-tool-cm-ff-1',
    module_id: 'mod-tool-criteria-matrix',
    type: 'fill-form',
    title: 'Build a Criteria Matrix',
    instructions:
      'Create a weighted criteria matrix to evaluate three options for improving employee onboarding. Define at least four criteria with different weights.',
    scenario_id: null,
    form_type: 'criteria_matrix',
    expected_minutes: 15,
    sort_order: 1,
    config: {
      formType: 'criteria_matrix',
      stepNumber: 4,
    },
  },
  {
    id: 'ex-tool-cm-mc-1',
    module_id: 'mod-tool-criteria-matrix',
    type: 'multiple-choice',
    title: 'Weighting Criteria',
    instructions: 'Test your understanding of criteria weighting.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'Why do we weight criteria in a criteria rating matrix?',
      options: [
        'To make the math easier',
        'Because all criteria are equally important in every situation',
        'Because some criteria matter more than others, and weighting makes those priorities visible',
        'To ensure the cheapest option always wins',
      ],
      correctIndex: 2,
    },
  },
  // Paired Comparisons
  {
    id: 'ex-tool-pc-ff-1',
    module_id: 'mod-tool-paired-comparisons',
    type: 'fill-form',
    title: 'Paired Comparisons',
    instructions:
      'Use paired comparisons to rank five improvement ideas from a brainstorming session. Compare each pair and tally the results.',
    scenario_id: null,
    form_type: 'paired_comparisons',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'paired_comparisons',
      stepNumber: 4,
    },
  },
  {
    id: 'ex-tool-pc-mc-1',
    module_id: 'mod-tool-paired-comparisons',
    type: 'multiple-choice',
    title: 'Weighted Voting Use Case',
    instructions: 'Understand when to use weighted voting.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'Weighted voting is most useful when you need to:',
      options: [
        'Decide between exactly two options',
        'Narrow a long list of options down to a shortlist based on group priorities',
        'Assign tasks to team members',
        'Calculate the ROI of a solution',
      ],
      correctIndex: 1,
    },
  },
  // RACI
  {
    id: 'ex-tool-raci-ff-1',
    module_id: 'mod-tool-raci',
    type: 'fill-form',
    title: 'Build a RACI Matrix',
    instructions:
      'Create a RACI matrix for a cross-departmental process improvement project with at least five tasks and four team members.',
    scenario_id: null,
    form_type: 'raci',
    expected_minutes: 12,
    sort_order: 1,
    config: {
      formType: 'raci',
      stepNumber: 4,
    },
  },
  {
    id: 'ex-tool-raci-mc-1',
    module_id: 'mod-tool-raci',
    type: 'multiple-choice',
    title: 'RACI Rules',
    instructions: 'Test your knowledge of RACI best practices.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'What is a key rule when building a RACI matrix?',
      options: [
        'Every task should have at least two accountable people',
        'Each task should have exactly one accountable person',
        'Everyone should be consulted on every task',
        'The responsible and accountable person must always be different people',
      ],
      correctIndex: 1,
    },
  },
  // Checksheets, Histograms & Pareto
  {
    id: 'ex-tool-chk-ff-1',
    module_id: 'mod-tool-checksheet-pareto',
    type: 'fill-form',
    title: 'Design a Checksheet',
    instructions:
      'Design a checksheet to collect data on the types and frequencies of customer complaints over a two-week period.',
    scenario_id: null,
    form_type: 'checksheet',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'checksheet',
      stepNumber: 2,
    },
  },
  {
    id: 'ex-tool-chk-mc-1',
    module_id: 'mod-tool-checksheet-pareto',
    type: 'multiple-choice',
    title: 'The Pareto Principle',
    instructions: 'Test your understanding of Pareto analysis.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'What does Pareto analysis help you identify?',
      options: [
        'The total cost of all problems combined',
        'The vital few causes that account for the majority of the effect (the 80/20 rule)',
        'The chronological order in which problems occurred',
        'The department responsible for each problem',
      ],
      correctIndex: 1,
    },
  },
  // Balance Sheet & Cost-Benefit
  {
    id: 'ex-tool-bs-ff-1',
    module_id: 'mod-tool-balance-sheet',
    type: 'fill-form',
    title: 'Pros & Cons Balance Sheet',
    instructions:
      'Create a structured balance sheet (pros and cons) for a proposed solution. List at least five items on each side with relative weights.',
    scenario_id: null,
    form_type: 'balance_sheet',
    expected_minutes: 10,
    sort_order: 1,
    config: {
      formType: 'balance_sheet',
      stepNumber: 4,
    },
  },
  {
    id: 'ex-tool-bs-mc-1',
    module_id: 'mod-tool-balance-sheet',
    type: 'multiple-choice',
    title: 'Cost-Benefit Analysis',
    instructions: 'Test your understanding of when to use cost-benefit analysis.',
    scenario_id: null,
    form_type: null,
    expected_minutes: 3,
    sort_order: 2,
    config: {
      question: 'When is a cost-benefit analysis most valuable in the PIPS process?',
      options: [
        'During Step 1 to select which problem to work on',
        'During Step 2 to prioritize root causes',
        'During Step 4 when comparing solutions and seeking management approval',
        'During Step 6 to calculate savings after the fact',
      ],
      correctIndex: 2,
    },
  },
]

// ---------------------------------------------------------------------------
// Combine all data
// ---------------------------------------------------------------------------

const allModules: TrainingModule[] = [
  ...quickStartModules,
  ...fundamentalsModules,
  ...facilitatorModules,
  ...toolMasteryModules,
]

const allExercises: TrainingExercise[] = [
  ...quickStartExercises,
  ...fundamentalsExercises,
  ...facilitatorExercises,
  ...toolMasteryExercises,
]

// ---------------------------------------------------------------------------
// Supabase REST upsert helper
// ---------------------------------------------------------------------------

const upsertBatch = async (
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
  rows: Record<string, unknown>[],
): Promise<void> => {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upsert into ${table}: ${response.status} — ${error}`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
    console.error('Set them in .env.local or pass them directly')
    process.exit(1)
  }

  // ---- 1. Training Paths ----
  console.log(`Upserting ${paths.length} training paths...`)
  await upsertBatch(supabaseUrl, supabaseKey, 'training_paths', paths)
  console.log(`  Done: ${paths.length} training paths`)

  // ---- 2. Training Modules ----
  console.log(`Upserting ${allModules.length} training modules...`)
  const moduleBatchSize = 50
  for (let i = 0; i < allModules.length; i += moduleBatchSize) {
    const batch = allModules.slice(i, i + moduleBatchSize)
    await upsertBatch(supabaseUrl, supabaseKey, 'training_modules', batch)
    console.log(
      `  Upserted ${Math.min(i + moduleBatchSize, allModules.length)}/${allModules.length}`,
    )
  }

  // ---- 3. Training Exercises ----
  console.log(`Upserting ${allExercises.length} training exercises...`)
  const exerciseBatchSize = 50
  for (let i = 0; i < allExercises.length; i += exerciseBatchSize) {
    const batch = allExercises.slice(i, i + exerciseBatchSize)
    await upsertBatch(supabaseUrl, supabaseKey, 'training_exercises', batch)
    console.log(
      `  Upserted ${Math.min(i + exerciseBatchSize, allExercises.length)}/${allExercises.length}`,
    )
  }

  console.log('\nTraining seed summary:')
  console.log(`  Paths:     ${paths.length}`)
  console.log(`  Modules:   ${allModules.length}`)
  console.log(`  Exercises: ${allExercises.length}`)
  console.log('\nDone!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
