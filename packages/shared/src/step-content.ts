/**
 * PIPS 6-Step Methodology — Rich Step Content
 *
 * Each step includes objectives, guided prompts, form definitions,
 * and completion criteria. This is the heart of the PIPS methodology.
 */

import type { PipsStepNumber } from './constants'

export type StepFormDef = {
  type: string
  name: string
  description: string
  required: boolean
  timeEstimate?: string
}

export type StepMethodology = {
  tips: string[]
  bestPractices: string[]
  facilitationGuide: string
}

export type StepContent = {
  title: string
  objective: string
  timeEstimate: string
  topMistake: string
  commonMistakes: string[]
  prompts: string[]
  forms: StepFormDef[]
  completionCriteria: string[]
  methodology: StepMethodology
}

export const STEP_CONTENT: Record<PipsStepNumber, StepContent> = {
  1: {
    title: 'Identify',
    objective: 'Define a clear, measurable problem statement that the team agrees on.',
    timeEstimate: '60–90 min',
    topMistake: 'Jumping to solutions instead of defining the problem',
    commonMistakes: [
      'Jumping to solutions before fully understanding the problem',
      'Writing vague problem statements without measurable gaps',
      'Skipping stakeholder input — one perspective is never enough',
      'Confusing symptoms with the actual problem',
    ],
    prompts: [
      'What is the current state (As-Is)?',
      'What is the desired state?',
      'What is the gap between current and desired?',
      'How does this impact the organization?',
    ],
    forms: [
      {
        type: 'problem_statement',
        name: 'Problem Statement',
        description: 'Define As-Is, Desired State, and Gap',
        required: true,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'impact_assessment',
        name: 'Impact Assessment',
        description: 'Quantify the problem impact',
        required: false,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'list_reduction',
        name: 'List Reduction',
        description:
          'Narrow a long list of candidate problems to a manageable shortlist through structured elimination',
        required: false,
        timeEstimate: '~10 min (solo) / ~20 min (team)',
      },
      {
        type: 'weighted_voting',
        name: 'Weighted Voting',
        description: 'Prioritize options by distributing a fixed number of votes across candidates',
        required: false,
        timeEstimate: '~10 min (solo) / ~15 min (team)',
      },
    ],
    completionCriteria: [
      'Problem statement is written with As-Is, Desired, and Gap',
      'Impact has been assessed',
      'Team members have been identified',
    ],
    methodology: {
      tips: [
        '**Use** the *As-Is / Desired State / Gap* framework to ensure your problem statement is specific and measurable',
        '**Avoid** jumping to solutions — focus only on describing the problem',
        '**Quantify** the gap with data whenever possible (%, $, time)',
        '**Interview** stakeholders at multiple levels for a well-rounded view',
      ],
      bestPractices: [
        '**Write** the problem statement as a neutral observation, not a blame assignment',
        '**Include** both *leading indicators* (predictive) and *lagging indicators* (historical)',
        '**Define** the scope boundary — what is in and out of this improvement effort',
        '**Validate** the problem with data before committing the team to solving it',
        "**Ensure** the problem is within the team's sphere of influence to solve",
      ],
      facilitationGuide:
        'Gather the team for a **60-minute session.** Start with each person silently writing what they believe the problem is **(5 min).** Share and cluster similar statements **(15 min).** Draft a unified As-Is / Desired State / Gap statement together **(20 min).** Quantify the impact with available data **(15 min).** Close by confirming team agreement on the statement **(5 min).**',
    },
  },
  2: {
    title: 'Analyze',
    objective: 'Identify root causes of the problem using structured analysis tools.',
    timeEstimate: '90–120 min',
    topMistake: 'Stopping at symptoms instead of drilling to root causes',
    commonMistakes: [
      'Stopping at symptoms instead of drilling to true root causes',
      'Using only one analysis tool — combine fishbone with 5-Why for depth',
      'Accepting the first "why" answer without probing further',
      'Ignoring data — validate suspected causes with evidence',
    ],
    prompts: [
      'What are the major categories of causes?',
      'What are the contributing factors in each category?',
      'Why does this happen? (ask "why" 5 times)',
      'What forces are driving change vs. restraining change?',
    ],
    forms: [
      {
        type: 'fishbone',
        name: 'Fishbone Diagram',
        description:
          'Cause-and-effect analysis using the 6M framework: Man (People), Machine (Equipment), Method (Process), Material (Inputs), Measurement (Metrics), Mother Nature (Environment)',
        required: true,
        timeEstimate: '~20 min (solo) / ~30 min (team)',
      },
      {
        type: 'five_why',
        name: '5 Why Analysis',
        description: 'Drill down to root cause by asking "why" iteratively',
        required: false,
        timeEstimate: '~10 min (solo) / ~15 min (team)',
      },
      {
        type: 'force_field',
        name: 'Force Field Analysis',
        description: 'Map driving forces vs. restraining forces for change',
        required: false,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'checksheet',
        name: 'Check Sheet',
        description:
          'Structured tally sheet to collect and quantify data by category over time periods',
        required: false,
        timeEstimate: '~10 min (solo) / ~15 min (team)',
      },
      {
        type: 'pareto',
        name: 'Pareto Analysis',
        description: 'Rank causes by frequency or impact to identify the vital few (80/20 rule)',
        required: false,
        timeEstimate: '~15 min (solo) / ~25 min (team)',
      },
    ],
    completionCriteria: [
      'At least one root cause analysis tool has been completed',
      'Root causes are clearly identified and documented',
      'Team has reviewed and validated the analysis',
    ],
    methodology: {
      tips: [
        '**Use** the *fishbone (Ishikawa) diagram* first to map broad cause categories',
        '**Apply** the *5-Why technique* on the top 2-3 root causes from the fishbone',
        '**Rate** force field forces on a 1-5 scale to prioritize which to address',
        '**Challenge** assumptions — ask *"How do we know this is true?"* for each cause',
      ],
      bestPractices: [
        '**Involve** people closest to the work — frontline staff often see causes leadership misses',
        '**Use** the *6M categories* for fishbone: Man, Machine, Method, Material, Measurement, Mother Nature',
        '**Stop** asking "why" when you reach a cause the team can act on',
        '**Distinguish** between *symptoms* and *root causes* — symptoms recur if only symptoms are treated',
        '**Validate** suspected root causes with data before moving to solutions',
      ],
      facilitationGuide:
        'Run a **90-minute root cause workshop.** Begin by reviewing the problem statement from Step 1 **(5 min).** Draw the fishbone skeleton on a whiteboard and have each person write causes on sticky notes in silence **(15 min).** Place and cluster notes on the fishbone, discussing as a group **(25 min).** Vote on the top 3 root causes using dot voting **(10 min).** Run 5-Why drills on the top 3 causes **(25 min).** Summarize findings and validate with available data **(10 min).**',
    },
  },
  3: {
    title: 'Generate',
    objective: 'Brainstorm a wide range of potential solutions without judgment.',
    timeEstimate: '45–60 min',
    topMistake: 'Filtering ideas too early — quantity over quality',
    commonMistakes: [
      'Evaluating or criticizing ideas during brainstorming',
      'Letting one voice dominate — use silent writing first',
      'Setting the bar too low — aim for 30+ ideas to push past obvious ones',
      'Skipping "wild" ideas that often spark practical innovations',
    ],
    prompts: [
      'What are all possible solutions — no idea is too bold?',
      'How have other organizations solved similar problems?',
      'What would the ideal state look like if there were no constraints?',
      'Can we combine or build on any of these ideas?',
    ],
    forms: [
      {
        type: 'brainstorming',
        name: 'Brainstorming',
        description: 'Free-form idea generation with the team',
        required: true,
        timeEstimate: '~15 min (solo) / ~30 min (team)',
      },
      {
        type: 'brainwriting',
        name: 'Brainwriting (6-3-5)',
        description: "Silent written idea generation and building on others' ideas",
        required: false,
        timeEstimate: '~20 min (solo) / ~30 min (team)',
      },
      {
        type: 'interviewing',
        name: 'Interviewing',
        description:
          'Structured interviews with stakeholders, frontline staff, and subject matter experts to gather solution ideas',
        required: false,
        timeEstimate: '~20 min (solo) / ~45 min (team)',
      },
      {
        type: 'surveying',
        name: 'Surveying',
        description: 'Design and distribute short surveys to crowdsource ideas from a larger group',
        required: false,
        timeEstimate: '~15 min (solo) / ~30 min (team)',
      },
    ],
    completionCriteria: [
      'Multiple solution ideas have been generated',
      'Ideas have been reviewed and grouped by theme',
      'No evaluation or filtering has been applied yet',
    ],
    methodology: {
      tips: [
        '**Defer** judgment — *quantity over quality* in the idea generation phase',
        '**Build** on others\' ideas with *"Yes, and..."* rather than "No, but..."',
        '**Include** wild ideas — they often spark practical innovations',
        '**Set** a target number of ideas (e.g., 30 ideas in 15 minutes) to push past the obvious',
      ],
      bestPractices: [
        '**Brainwriting 6-3-5:** 6 people write 3 ideas in 5 minutes, then pass their sheet to the next person',
        '**Group** similar ideas into themes after generation without eliminating any',
        '**Separate** *divergent thinking* (generating) from *convergent thinking* (selecting) — they happen in different steps',
        '**Use** round-robin sharing so quieter team members contribute equally',
        '**Consider** solutions from adjacent industries or unrelated fields for fresh perspective',
      ],
      facilitationGuide:
        'Hold a **60-minute idea generation session.** Set ground rules: no criticism, quantity matters, build on ideas **(5 min).** Run silent brainwriting round — each person writes 3 ideas and passes to the next person, repeat 5 times **(30 min).** Read all ideas aloud and cluster into themes on a wall **(15 min).** Do a quick round-robin where each person adds one more idea inspired by the clusters **(10 min).** Count total ideas and celebrate the quantity.',
    },
  },
  4: {
    title: 'Select & Plan',
    objective: 'Evaluate solutions objectively and create a detailed implementation plan.',
    timeEstimate: '2–3 hours',
    topMistake: 'Choosing a solution without defining criteria first',
    commonMistakes: [
      'Choosing a favorite solution without objective criteria',
      'Assigning multiple "Accountable" people per task in the RACI',
      'Building an implementation plan without risk mitigation',
      'Setting unrealistic timelines without consulting the people doing the work',
    ],
    prompts: [
      'What criteria matter most for evaluating solutions?',
      'How does each solution score against the criteria?',
      'Who is Responsible, Accountable, Consulted, Informed for each task?',
      'What are the key milestones and deadlines?',
    ],
    forms: [
      {
        type: 'criteria_matrix',
        name: 'Criteria Matrix',
        description: 'Score and rank solutions against weighted criteria',
        required: true,
        timeEstimate: '~20 min (solo) / ~30 min (team)',
      },
      {
        type: 'paired_comparisons',
        name: 'Paired Comparisons',
        description: 'Systematically compare options in pairs to produce a ranked list',
        required: false,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'raci',
        name: 'RACI Chart',
        description: 'Assign roles: Responsible, Accountable, Consulted, Informed',
        required: false,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'implementation_plan',
        name: 'Implementation Plan',
        description: 'Timeline, resources, milestones, and risk mitigation',
        required: true,
        timeEstimate: '~20 min (solo) / ~45 min (team)',
      },
      {
        type: 'balance_sheet',
        name: 'Balance Sheet',
        description:
          'Weigh gains vs. losses for each solution option to support selection decisions',
        required: false,
        timeEstimate: '~15 min (solo) / ~25 min (team)',
      },
      {
        type: 'cost_benefit',
        name: 'Cost-Benefit Analysis',
        description: 'Compare the financial costs and projected benefits of proposed solutions',
        required: false,
        timeEstimate: '~20 min (solo) / ~35 min (team)',
      },
    ],
    completionCriteria: [
      'Solution has been selected using objective criteria',
      'RACI chart defines clear ownership for each task',
      'Implementation plan has milestones and target dates',
    ],
    methodology: {
      tips: [
        '**Weight** criteria *before* scoring solutions to avoid bias toward a favorite',
        '**Assign** exactly one *Accountable* person per task in the RACI chart',
        '**Break** implementation into phases — pilot first, then scale',
        '**Include** risk mitigation for the top 3-5 risks in the implementation plan',
      ],
      bestPractices: [
        '**Use** a *weighted criteria matrix:* define criteria, assign weights (1-10), score each solution (1-5), multiply and sum',
        '**RACI rules:** every task needs exactly one A (*Accountable*), at least one R (*Responsible*), C and I are optional',
        '**Build** the implementation plan backward from the target date to set realistic milestones',
        '**Identify** quick wins (low effort, high impact) to build early momentum',
        '**Document** assumptions and constraints alongside the plan so stakeholders understand trade-offs',
      ],
      facilitationGuide:
        'Run a **2-hour selection and planning workshop.** Review the shortlisted ideas from Step 3 **(10 min).** Define evaluation criteria as a team and assign weights by consensus **(20 min).** Score each solution independently, then discuss and reconcile scores **(30 min).** Select the winning solution and document the rationale **(10 min).** Build the RACI chart — list tasks, assign R/A/C/I for each team member **(20 min).** Draft the implementation timeline with milestones, owners, and dates **(25 min).** Close with a risk brainstorm and mitigation plan **(15 min).**',
    },
  },
  5: {
    title: 'Implement',
    objective: 'Execute the plan, track progress, and manage issues as they arise.',
    timeEstimate: 'Ongoing (weekly check-ins)',
    topMistake: 'No escalation path for blockers',
    commonMistakes: [
      'No defined escalation path — blockers fester until they derail the timeline',
      'Skipping regular check-ins and losing visibility into progress',
      'Not documenting deviations from the plan for Step 6 review',
      'Rolling out to everyone at once instead of piloting first',
    ],
    prompts: [
      'Are all tasks assigned and understood by their owners?',
      'What milestones have been reached?',
      'Are there any blockers or risks that need escalation?',
      'Is the team on track with the planned timeline?',
    ],
    forms: [
      {
        type: 'milestone_tracker',
        name: 'Milestone Tracker',
        description: 'Track progress against planned milestones and dates',
        required: true,
        timeEstimate: '~10 min (solo) / ~15 min (team)',
      },
      {
        type: 'implementation_checklist',
        name: 'Implementation Checklist',
        description: 'Detailed task checklist with status and owners',
        required: false,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
    ],
    completionCriteria: [
      'All planned milestones have been completed or accounted for',
      'Implementation tasks are done or documented as deferred',
      'Issues and blockers have been resolved or escalated',
    ],
    methodology: {
      tips: [
        '**Hold** brief weekly stand-ups to surface blockers early',
        '**Track** progress visually — use the ticket board so the whole team sees status',
        '**Communicate** changes to stakeholders proactively, not reactively',
        '**Celebrate** milestone completions to maintain team momentum',
      ],
      bestPractices: [
        '**Use** a *change management checklist:* communications sent, training completed, documentation updated',
        '**Establish** an escalation path for blockers *before* they occur',
        '**Run** a pilot with a small group before full rollout to catch issues early',
        '**Document** deviations from the plan and the reasons — this feeds Step 6 lessons learned',
        '**Keep** a risk register and review it at each check-in to catch emerging risks',
      ],
      facilitationGuide:
        'Implementation runs over weeks or months, so facilitation shifts to regular check-ins. **Kick off with a 30-minute launch meeting:** confirm roles, review the plan, set the cadence for check-ins. **Hold 15-minute weekly stand-ups:** each owner shares progress, blockers, and next steps. **At each milestone, hold a 30-minute review:** is the milestone truly complete? Any scope changes? Update the checklist and ticket board in real time. **If a major blocker arises, escalate within 24 hours** using the agreed escalation path.',
    },
  },
  6: {
    title: 'Evaluate',
    objective: 'Measure results, capture lessons learned, and determine next steps.',
    timeEstimate: '~90 min',
    topMistake: 'Measuring different metrics than defined in Step 1',
    commonMistakes: [
      'Measuring different metrics than what was defined in Step 1',
      'Waiting too long to capture lessons learned — memories fade fast',
      'Treating unmet goals as failure instead of input for the next cycle',
      'Not sharing results with the broader organization',
    ],
    prompts: [
      'What were the measurable results vs. the original target?',
      'What worked well during this improvement cycle?',
      'What would we do differently next time?',
      'Should we standardize, iterate, or start a new PIPS cycle?',
      'Did the solution create any new problems that need their own PIPS cycle?',
    ],
    forms: [
      {
        type: 'before_after',
        name: 'Before & After Comparison',
        description: 'Compare baseline metrics with post-implementation results',
        required: true,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'evaluation',
        name: 'Evaluation Summary',
        description: 'Overall assessment of the improvement project',
        required: true,
        timeEstimate: '~20 min (solo) / ~30 min (team)',
      },
      {
        type: 'lessons_learned',
        name: 'Lessons Learned',
        description: 'Document insights, successes, and areas for improvement',
        required: false,
        timeEstimate: '~15 min (solo) / ~20 min (team)',
      },
      {
        type: 'balance_sheet',
        name: 'Balance Sheet',
        description: 'Weigh gains vs. losses and decide the path forward',
        required: false,
        timeEstimate: '~15 min (solo) / ~25 min (team)',
      },
    ],
    completionCriteria: [
      'Before and after metrics have been compared',
      'Evaluation summary is complete with results and recommendations',
      'Lessons learned have been documented and shared',
      'Team has decided on next path: standardize, iterate, start a new cycle, or address new problems created by the solution',
    ],
    methodology: {
      tips: [
        '**Compare** the same metrics you defined in Step 1 — do not introduce new measures retroactively',
        '**Capture** lessons learned while memories are fresh, not weeks after completion',
        '**Distinguish** between *outcomes* (did it work?) and *process* (how well did we execute?)',
        '**Decide** explicitly: *standardize, iterate, start a new PIPS cycle,* or *address new problems the solution created*',
        '**Watch** for unintended consequences — as Eric Sevareid noted, "The chief cause of problems is solutions."',
      ],
      bestPractices: [
        '**Use** a *before/after table:* metric name, baseline value, target value, actual value, % improvement',
        '**Run** a structured retrospective: *What went well? What could improve? What will we do differently?*',
        '**Assess** sustainability: will the improvement hold without active management? What sustaining mechanisms are needed?',
        '**Share** results and lessons with the broader organization to multiply the impact',
        '**Reframe** unmet goals as input for the next PIPS cycle rather than a failure',
        '**Consider** the 4th outcome path: if the solution introduced new unintended problems, start a separate PIPS cycle to address them',
      ],
      facilitationGuide:
        'Hold a **90-minute evaluation workshop.** Present before/after data and let the team review silently **(10 min).** Discuss results as a group — were targets met? Why or why not? **(20 min).** Run a structured retrospective: each person writes what went well, what to improve, and action items on separate sticky notes **(15 min).** Share and cluster the notes **(20 min).** Draft the evaluation summary together — key findings, recommendations, and next steps **(15 min).** Decide as a team: standardize the solution, iterate with another cycle, or close the project **(10 min).**',
    },
  },
}

/** Get all form types for a given step */
export const getStepForms = (stepNumber: PipsStepNumber): StepFormDef[] =>
  STEP_CONTENT[stepNumber].forms

/** Get required form types for a given step */
export const getRequiredForms = (stepNumber: PipsStepNumber): StepFormDef[] =>
  STEP_CONTENT[stepNumber].forms.filter((f) => f.required)

/** Get all unique form types across all steps */
export const ALL_FORM_TYPES = Object.values(STEP_CONTENT).flatMap((s) => s.forms.map((f) => f.type))
