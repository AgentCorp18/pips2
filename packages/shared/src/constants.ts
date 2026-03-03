/**
 * PIPS 6-Step Methodology — Constants
 */

export const PIPS_STEPS = [
  {
    number: 1,
    name: 'Identify',
    description: 'Define measurable problem statements',
    color: '#2563EB',
    colorSubtle: 'rgba(37, 99, 235, 0.12)',
    icon: 'crosshair',
  },
  {
    number: 2,
    name: 'Analyze',
    description: 'Root cause analysis (fishbone, 5-why, force-field)',
    color: '#D97706',
    colorSubtle: 'rgba(217, 119, 6, 0.12)',
    icon: 'search',
  },
  {
    number: 3,
    name: 'Generate',
    description: 'Brainstorm solutions (brainwriting, brainstorming)',
    color: '#059669',
    colorSubtle: 'rgba(5, 150, 105, 0.12)',
    icon: 'lightbulb',
  },
  {
    number: 4,
    name: 'Select & Plan',
    description: 'Decision matrices, weighted voting, RACI, implementation planning',
    color: '#4338CA',
    colorSubtle: 'rgba(67, 56, 202, 0.12)',
    icon: 'clipboard-check',
  },
  {
    number: 5,
    name: 'Implement',
    description: 'Execute with milestones, checklists, progress tracking',
    color: '#CA8A04',
    colorSubtle: 'rgba(202, 138, 4, 0.12)',
    icon: 'wrench',
  },
  {
    number: 6,
    name: 'Evaluate',
    description: 'Measure results, lessons learned, cycle back to Step 1',
    color: '#0891B2',
    colorSubtle: 'rgba(8, 145, 178, 0.12)',
    icon: 'gauge',
  },
] as const

export type PipsStepNumber = 1 | 2 | 3 | 4 | 5 | 6

export const PIPS_STEP_NAMES = PIPS_STEPS.map((s) => s.name)

export const PIPS_STEP_COLORS = PIPS_STEPS.map((s) => s.color)

/** Brand colors */
export const BRAND = {
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primaryActive: '#3730A3',
  primaryLight: '#818CF8',
  deep: '#1B1340',
  accent: '#7C3AED',
  cloud: '#F0EDFA',
  amber: '#F59E0B',
  ink: '#1E1B2E',
} as const

/** Application metadata */
export const APP_NAME = 'PIPS'
export const APP_DESCRIPTION =
  'A 6-step process improvement methodology embedded in enterprise project management software.'
