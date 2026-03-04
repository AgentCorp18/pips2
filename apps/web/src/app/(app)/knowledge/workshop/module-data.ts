import type { PipsStepNumber, ContentStep } from '@pips/shared'

export type WorkshopModuleData = {
  slug: string
  title: string
  description: string
  duration: string
  difficulty: string
  steps: PipsStepNumber[]
  contentStepTags: ContentStep[]
  objectives: string[]
  materials: string[]
  facilitatorNotes: string[]
  agenda: { activity: string; duration: string; notes: string }[]
  practiceScenarios: { slug: string; title: string; description: string }[]
}

export const WORKSHOP_MODULE_DATA: Record<string, WorkshopModuleData> = {
  'intro-to-pips': {
    slug: 'intro-to-pips',
    title: 'Introduction to PIPS',
    description: 'Overview of the methodology, principles, and team roles',
    duration: '45 min',
    difficulty: 'Beginner',
    steps: [],
    contentStepTags: ['overview', 'philosophy'],
    objectives: [
      'Understand the 6-step PIPS methodology and its purpose',
      'Learn the three core principles: Data Over Opinions, Expand Then Contract, Close the Loop',
      'Identify the key team roles: Leader, Process Guide, Scribe, Timekeeper, Presenter',
      'Recognize when to apply PIPS vs. quick-fix approaches',
    ],
    materials: [
      'PIPS overview slide deck or handout',
      'Whiteboard or flip chart for group discussion',
      'Role cards for each team role',
      'Example problem statement for demonstration',
    ],
    facilitatorNotes: [
      'Open with a relatable example of a recurring problem that never gets fixed — this sets the "why" for PIPS.',
      'Keep the overview high-level. The goal is awareness, not mastery. Participants will go deep in step-specific modules.',
      'Use the "raise your hand if" technique to gauge experience levels and adjust pacing.',
      'End with a quick round-robin: each person shares one workplace problem they would like to apply PIPS to.',
    ],
    agenda: [
      {
        activity: 'Welcome & icebreaker',
        duration: '5 min',
        notes: 'Share a problem you wish was solved at work',
      },
      {
        activity: 'PIPS overview presentation',
        duration: '15 min',
        notes: 'Cover the 6 steps and 3 principles',
      },
      {
        activity: 'Team roles walkthrough',
        duration: '10 min',
        notes: 'Assign practice roles to the group',
      },
      {
        activity: 'Group discussion',
        duration: '10 min',
        notes: 'When would you use PIPS? When would you not?',
      },
      {
        activity: 'Wrap-up & next steps',
        duration: '5 min',
        notes: 'Preview the step-specific workshops',
      },
    ],
    practiceScenarios: [
      {
        slug: 'recurring-complaint',
        title: 'The Recurring Complaint',
        description: 'A customer complaint that keeps coming back despite multiple fixes',
      },
    ],
  },
  'identify-workshop': {
    slug: 'identify-workshop',
    title: 'Step 1: Identify Workshop',
    description: 'Hands-on problem statement writing with team facilitation',
    duration: '90 min',
    difficulty: 'Beginner',
    steps: [1],
    contentStepTags: ['step-1'],
    objectives: [
      'Write a clear, measurable problem statement with As-Is, Desired State, and Gap',
      'Quantify problem impact using available data',
      'Define scope boundaries for the improvement effort',
      'Reach team consensus on the problem definition',
    ],
    materials: [
      'Problem Statement template (printed or digital)',
      'Impact Assessment template',
      'Sticky notes and markers for group brainstorming',
      'Sample data sets for quantifying the gap',
    ],
    facilitatorNotes: [
      'The most common mistake is jumping to solutions. Redirect the team to describing the problem, not fixing it.',
      'Use the "newspaper test": could someone outside the team read the problem statement and understand it?',
      'If the team disagrees on the problem, that is valuable information — it means the problem is not yet well-defined.',
      'Encourage the use of SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound.',
    ],
    agenda: [
      {
        activity: 'Review Step 1 methodology',
        duration: '10 min',
        notes: 'Quick refresher on Identify step',
      },
      {
        activity: 'Silent problem writing',
        duration: '10 min',
        notes: 'Each person writes their version of the problem',
      },
      {
        activity: 'Share and cluster',
        duration: '15 min',
        notes: 'Read aloud and group similar statements',
      },
      {
        activity: 'Draft unified statement',
        duration: '20 min',
        notes: 'As-Is / Desired State / Gap format',
      },
      {
        activity: 'Impact quantification',
        duration: '20 min',
        notes: 'Use data to measure the gap',
      },
      { activity: 'Consensus check & close', duration: '15 min', notes: 'Confirm team agreement' },
    ],
    practiceScenarios: [
      {
        slug: 'onboarding-delays',
        title: 'Onboarding Delays',
        description: 'New employee onboarding takes 3x longer than industry average',
      },
      {
        slug: 'quality-defects',
        title: 'Quality Defects',
        description: 'Product defect rate has doubled over the past quarter',
      },
    ],
  },
  'root-cause-workshop': {
    slug: 'root-cause-workshop',
    title: 'Step 2: Root Cause Analysis',
    description: 'Fishbone diagrams, 5-Why, and force field analysis in teams',
    duration: '90 min',
    difficulty: 'Intermediate',
    steps: [2],
    contentStepTags: ['step-2'],
    objectives: [
      'Build a fishbone (Ishikawa) diagram with the 6M categories',
      'Apply the 5-Why technique to drill down to root causes',
      'Distinguish between symptoms and true root causes',
      'Use force field analysis to understand change dynamics',
    ],
    materials: [
      'Fishbone Diagram template (large format)',
      '5 Why worksheet',
      'Force Field Analysis template',
      'Dot voting stickers for prioritization',
      'Completed problem statement from Step 1',
    ],
    facilitatorNotes: [
      'Start by reviewing the problem statement. Root cause analysis without a clear problem is just speculation.',
      'When using the fishbone, the 6M categories are: Man (People), Machine (Equipment), Method (Process), Material, Measurement, Mother Nature (Environment).',
      'Stop the 5-Why drill when you reach a cause the team can actually act on.',
      'Use dot voting to prioritize: give each person 3 dots to place on the causes they believe are most significant.',
    ],
    agenda: [
      {
        activity: 'Review problem statement',
        duration: '5 min',
        notes: 'Ensure the team is aligned on what was identified',
      },
      {
        activity: 'Fishbone diagram build',
        duration: '30 min',
        notes: 'Silent sticky note writing, then placement and discussion',
      },
      {
        activity: 'Dot voting on top causes',
        duration: '10 min',
        notes: '3 dots per person on the fishbone',
      },
      { activity: '5-Why drills', duration: '25 min', notes: 'Run on the top 3 voted causes' },
      {
        activity: 'Force field analysis',
        duration: '15 min',
        notes: 'Map driving and restraining forces',
      },
      {
        activity: 'Summarize findings',
        duration: '5 min',
        notes: 'Document validated root causes',
      },
    ],
    practiceScenarios: [
      {
        slug: 'delivery-delays',
        title: 'Delivery Delays',
        description: 'Orders are consistently arriving 2-3 days late',
      },
      {
        slug: 'employee-turnover',
        title: 'Employee Turnover',
        description: 'Department turnover rate is 40% above company average',
      },
    ],
  },
  'ideation-workshop': {
    slug: 'ideation-workshop',
    title: 'Step 3: Ideation Workshop',
    description: 'Brainstorming and brainwriting 6-3-5 facilitation',
    duration: '60 min',
    difficulty: 'Beginner',
    steps: [3],
    contentStepTags: ['step-3'],
    objectives: [
      'Generate a large quantity of solution ideas without judgment',
      'Use brainwriting 6-3-5 to ensure equal participation',
      'Cluster and theme ideas for later evaluation',
      'Separate divergent thinking from convergent thinking',
    ],
    materials: [
      'Brainwriting 6-3-5 sheets (one per participant)',
      'Sticky notes and markers for brainstorming',
      'Timer for timed rounds',
      'Large wall or board for clustering',
    ],
    facilitatorNotes: [
      'Set ground rules before starting: no criticism, quantity over quality, build on ideas, wild ideas welcome.',
      'Brainwriting 6-3-5 works best with exactly 6 people. Adjust the number of passes for different group sizes.',
      'Use a timer strictly — the time pressure drives creativity and prevents overthinking.',
      'After clustering, count the total ideas and celebrate the number. The goal is volume.',
    ],
    agenda: [
      {
        activity: 'Set ground rules',
        duration: '5 min',
        notes: 'No judgment, quantity matters, build on ideas',
      },
      {
        activity: 'Brainwriting 6-3-5',
        duration: '30 min',
        notes: '5 rounds of writing and passing sheets',
      },
      {
        activity: 'Read and cluster',
        duration: '15 min',
        notes: 'Group similar ideas into themes on the wall',
      },
      {
        activity: 'Bonus round-robin',
        duration: '10 min',
        notes: 'Each person adds one more idea inspired by clusters',
      },
    ],
    practiceScenarios: [
      {
        slug: 'process-bottleneck',
        title: 'Process Bottleneck',
        description: 'Generate solutions for a workflow bottleneck identified in analysis',
      },
    ],
  },
  'selection-planning': {
    slug: 'selection-planning',
    title: 'Step 4: Selection & Planning',
    description: 'Criteria matrices, RACI charts, and implementation planning',
    duration: '120 min',
    difficulty: 'Intermediate',
    steps: [4],
    contentStepTags: ['step-4'],
    objectives: [
      'Define and weight evaluation criteria as a team',
      'Score solutions objectively using a criteria matrix',
      'Build a RACI chart with clear ownership',
      'Create an implementation plan with milestones and dates',
    ],
    materials: [
      'Criteria Matrix template',
      'RACI Chart template',
      'Implementation Plan template',
      'Shortlisted ideas from Step 3',
      'Calendar for timeline planning',
    ],
    facilitatorNotes: [
      'Weight criteria BEFORE scoring solutions. This prevents bias toward a pre-selected favorite.',
      'RACI rule: every task must have exactly one A (Accountable). Multiple Rs are fine, but one person owns the outcome.',
      'Build the timeline backward from the target completion date to set realistic milestones.',
      'Include a risk brainstorm at the end — identify what could go wrong and plan mitigation.',
    ],
    agenda: [
      {
        activity: 'Review shortlisted ideas',
        duration: '10 min',
        notes: 'Recap themes from Step 3',
      },
      {
        activity: 'Define & weight criteria',
        duration: '20 min',
        notes: 'Consensus on what matters most',
      },
      {
        activity: 'Score solutions',
        duration: '30 min',
        notes: 'Independent scoring, then reconcile',
      },
      { activity: 'Select winning solution', duration: '10 min', notes: 'Document rationale' },
      { activity: 'Build RACI chart', duration: '20 min', notes: 'List tasks, assign R/A/C/I' },
      {
        activity: 'Draft implementation plan',
        duration: '25 min',
        notes: 'Milestones, owners, dates',
      },
      { activity: 'Risk brainstorm', duration: '5 min', notes: 'Top 3-5 risks and mitigation' },
    ],
    practiceScenarios: [
      {
        slug: 'vendor-selection',
        title: 'Vendor Selection',
        description: 'Evaluate and select between three vendor proposals using criteria',
      },
      {
        slug: 'resource-allocation',
        title: 'Resource Allocation',
        description: 'Plan implementation with limited team bandwidth',
      },
    ],
  },
  'facilitator-masterclass': {
    slug: 'facilitator-masterclass',
    title: "Facilitator's Masterclass",
    description: 'Advanced facilitation techniques, dealing with resistance, and time management',
    duration: '3 hours',
    difficulty: 'Advanced',
    steps: [5, 6],
    contentStepTags: ['step-5', 'step-6', 'facilitation'],
    objectives: [
      'Master advanced facilitation techniques for PIPS workshops',
      'Handle resistance and difficult group dynamics constructively',
      'Manage time effectively across multi-step improvement cycles',
      'Track implementation progress and lead evaluation workshops',
      'Coach teams through the full PIPS cycle from start to finish',
    ],
    materials: [
      'Milestone Tracker template',
      'Implementation Checklist template',
      'Before & After Comparison template',
      'Evaluation Summary template',
      'Lessons Learned template',
      'Facilitator tip cards',
    ],
    facilitatorNotes: [
      'This is an advanced module. Participants should have completed at least one full PIPS cycle or the earlier workshop modules.',
      'Use role-play exercises for resistance scenarios — assign someone to be the "resistor" and practice redirection techniques.',
      'Cover both Step 5 (Implement) and Step 6 (Evaluate) since they form the "close the loop" pair.',
      'Emphasize that evaluation is not about blame — it is about learning and improving the process itself.',
      'Share war stories: real examples of PIPS cycles that hit obstacles and how facilitators navigated them.',
    ],
    agenda: [
      {
        activity: 'Advanced facilitation techniques',
        duration: '30 min',
        notes: 'Redirecting, parking lot, time-boxing',
      },
      {
        activity: 'Dealing with resistance',
        duration: '30 min',
        notes: 'Role-play exercises with scenarios',
      },
      {
        activity: 'Step 5: Implementation tracking',
        duration: '25 min',
        notes: 'Milestone tracker and checklist walkthrough',
      },
      { activity: 'Break', duration: '10 min', notes: '' },
      {
        activity: 'Step 6: Evaluation workshop',
        duration: '30 min',
        notes: 'Before/after, lessons learned facilitation',
      },
      {
        activity: 'Full-cycle coaching simulation',
        duration: '25 min',
        notes: 'Practice facilitating a mini PIPS cycle',
      },
      {
        activity: 'Q&A and certification prep',
        duration: '20 min',
        notes: 'Open discussion and next steps',
      },
    ],
    practiceScenarios: [
      {
        slug: 'resistant-stakeholder',
        title: 'Resistant Stakeholder',
        description: 'Navigate a key stakeholder who blocks every proposed change',
      },
      {
        slug: 'stalled-implementation',
        title: 'Stalled Implementation',
        description: 'Restart momentum on a PIPS project that has stalled mid-execution',
      },
    ],
  },
}
