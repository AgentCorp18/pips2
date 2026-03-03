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
}

export type StepContent = {
  title: string
  objective: string
  prompts: string[]
  forms: StepFormDef[]
  completionCriteria: string[]
}

export const STEP_CONTENT: Record<PipsStepNumber, StepContent> = {
  1: {
    title: 'Identify',
    objective: 'Define a clear, measurable problem statement that the team agrees on.',
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
      },
      {
        type: 'impact_assessment',
        name: 'Impact Assessment',
        description: 'Quantify the problem impact',
        required: false,
      },
    ],
    completionCriteria: [
      'Problem statement is written with As-Is, Desired, and Gap',
      'Impact has been assessed',
      'Team members have been identified',
    ],
  },
  2: {
    title: 'Analyze',
    objective: 'Identify root causes of the problem using structured analysis tools.',
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
          'Cause-and-effect analysis across categories (People, Process, Equipment, Materials, Environment, Management)',
        required: true,
      },
      {
        type: 'five_why',
        name: '5 Why Analysis',
        description: 'Drill down to root cause by asking "why" iteratively',
        required: false,
      },
      {
        type: 'force_field',
        name: 'Force Field Analysis',
        description: 'Map driving forces vs. restraining forces for change',
        required: false,
      },
    ],
    completionCriteria: [
      'At least one root cause analysis tool has been completed',
      'Root causes are clearly identified and documented',
      'Team has reviewed and validated the analysis',
    ],
  },
  3: {
    title: 'Generate',
    objective: 'Brainstorm a wide range of potential solutions without judgment.',
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
      },
      {
        type: 'brainwriting',
        name: 'Brainwriting (6-3-5)',
        description: "Silent written idea generation and building on others' ideas",
        required: false,
      },
    ],
    completionCriteria: [
      'Multiple solution ideas have been generated',
      'Ideas have been reviewed and grouped by theme',
      'No evaluation or filtering has been applied yet',
    ],
  },
  4: {
    title: 'Select & Plan',
    objective: 'Evaluate solutions objectively and create a detailed implementation plan.',
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
      },
      {
        type: 'raci',
        name: 'RACI Chart',
        description: 'Assign roles: Responsible, Accountable, Consulted, Informed',
        required: false,
      },
      {
        type: 'implementation_plan',
        name: 'Implementation Plan',
        description: 'Timeline, resources, milestones, and risk mitigation',
        required: true,
      },
    ],
    completionCriteria: [
      'Solution has been selected using objective criteria',
      'RACI chart defines clear ownership for each task',
      'Implementation plan has milestones and target dates',
    ],
  },
  5: {
    title: 'Implement',
    objective: 'Execute the plan, track progress, and manage issues as they arise.',
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
      },
      {
        type: 'implementation_checklist',
        name: 'Implementation Checklist',
        description: 'Detailed task checklist with status and owners',
        required: false,
      },
    ],
    completionCriteria: [
      'All planned milestones have been completed or accounted for',
      'Implementation tasks are done or documented as deferred',
      'Issues and blockers have been resolved or escalated',
    ],
  },
  6: {
    title: 'Evaluate',
    objective: 'Measure results, capture lessons learned, and determine next steps.',
    prompts: [
      'What were the measurable results vs. the original target?',
      'What worked well during this improvement cycle?',
      'What would we do differently next time?',
      'Should we standardize, iterate, or start a new PIPS cycle?',
    ],
    forms: [
      {
        type: 'before_after',
        name: 'Before & After Comparison',
        description: 'Compare baseline metrics with post-implementation results',
        required: true,
      },
      {
        type: 'evaluation',
        name: 'Evaluation Summary',
        description: 'Overall assessment of the improvement project',
        required: true,
      },
      {
        type: 'lessons_learned',
        name: 'Lessons Learned',
        description: 'Document insights, successes, and areas for improvement',
        required: false,
      },
    ],
    completionCriteria: [
      'Before and after metrics have been compared',
      'Evaluation summary is complete with results and recommendations',
      'Lessons learned have been documented and shared',
    ],
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
