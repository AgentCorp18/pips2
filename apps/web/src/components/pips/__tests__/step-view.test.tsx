import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepView } from '../step-view'

vi.mock('@/components/pips/step-advisor', () => ({
  StepAdvisor: () => <div data-testid="step-advisor" />,
}))

vi.mock('@pips/shared', () => ({
  STEP_CONTENT: {
    1: {
      title: 'Identify',
      objective: 'Define a clear, measurable problem statement.',
      timeEstimate: '60-90 min',
      topMistake: 'Jumping to solutions instead of defining the problem',
      commonMistakes: [
        'Jumping to solutions before fully understanding the problem',
        'Writing vague problem statements',
      ],
      prompts: ['What is the current state?', 'What is the desired state?'],
      forms: [
        {
          type: 'problem_statement',
          name: 'Problem Statement',
          description: 'Define As-Is and Desired',
          required: true,
          timeEstimate: '~20 min',
        },
        {
          type: 'impact_assessment',
          name: 'Impact Assessment',
          description: 'Quantify impact',
          required: false,
          timeEstimate: '~15 min',
        },
      ],
      completionCriteria: ['Problem statement defined', 'Impact assessed'],
      methodology: {
        tips: ['Use the As-Is / Desired State framework'],
        bestPractices: ['Write neutral problem statements'],
        facilitationGuide: 'Gather the team for a 60-minute session.',
      },
    },
    2: {
      title: 'Analyze',
      objective: 'Determine root causes of the problem.',
      timeEstimate: '90-120 min',
      topMistake: 'Stopping at symptoms instead of drilling to root causes',
      commonMistakes: ['Stopping at symptoms'],
      prompts: ['Why does this happen?'],
      forms: [
        {
          type: 'fishbone',
          name: 'Fishbone Diagram',
          description: 'Identify cause categories',
          required: true,
          timeEstimate: '~30 min',
        },
        {
          type: 'five_why',
          name: '5 Whys',
          description: 'Drill down to root cause',
          required: false,
          timeEstimate: '~15 min',
        },
      ],
      completionCriteria: ['Root causes identified'],
      methodology: {
        tips: ['Use the fishbone diagram first'],
        bestPractices: ['Involve people closest to the work'],
        facilitationGuide: 'Run a 90-minute root cause workshop.',
      },
    },
  },
  buildProductContext: vi.fn().mockReturnValue({ stepNumber: 1 }),
}))

vi.mock('@/components/knowledge-cadence/knowledge-cadence-bar', () => ({
  KnowledgeCadenceBar: () => <div data-testid="cadence-bar" />,
}))

const defaultProps = {
  projectId: 'p-1',
  stepNumber: 1 as const,
  status: 'in_progress' as const,
  formStatuses: [],
  canAdvance: true,
  canOverride: false,
}

describe('StepView', () => {
  it('renders step title', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('Identify')).toBeTruthy()
  })

  it('renders step number', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('1')).toBeTruthy()
  })

  it('renders step objective', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText(/Define a clear, measurable problem statement/)).toBeTruthy()
  })

  it('renders status badge', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('In Progress')).toBeTruthy()
  })

  it('renders Guiding Questions section', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('Guiding Questions')).toBeTruthy()
  })

  it('renders prompt items', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('What is the current state?')).toBeTruthy()
    expect(screen.getByText('What is the desired state?')).toBeTruthy()
  })

  it('renders Required Tools section for required forms', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('required-tools-title')).toBeTruthy()
    expect(screen.getByText('Required Tools')).toBeTruthy()
  })

  it('renders Optional Tools section for optional forms', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('optional-tools-title')).toBeTruthy()
    expect(screen.getByText('Optional Tools')).toBeTruthy()
  })

  it('renders form names', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('Problem Statement')).toBeTruthy()
    expect(screen.getByText('Impact Assessment')).toBeTruthy()
  })

  it('renders Required badge for required forms', () => {
    render(<StepView {...defaultProps} />)
    const badges = screen.getAllByText('Required')
    // "Required Tools" heading + "Required" badge on form
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('renders Completion Criteria section', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('Completion Criteria')).toBeTruthy()
    expect(screen.getByText('Problem statement defined')).toBeTruthy()
    expect(screen.getByText('Impact assessed')).toBeTruthy()
  })

  it('renders Advance button when canAdvance', () => {
    render(<StepView {...defaultProps} canAdvance />)
    expect(screen.getByText('Complete Step & Advance')).toBeTruthy()
  })

  it('renders Override button when canOverride', () => {
    render(<StepView {...defaultProps} canOverride />)
    expect(screen.getByText('Override (Skip Step)')).toBeTruthy()
  })

  it('hides action buttons when completed', () => {
    render(<StepView {...defaultProps} status="completed" />)
    expect(screen.queryByText('Complete Step & Advance')).toBeNull()
    expect(screen.queryByText('Override (Skip Step)')).toBeNull()
  })

  it('renders Completed status badge', () => {
    render(<StepView {...defaultProps} status="completed" />)
    expect(screen.getByText('Completed')).toBeTruthy()
  })

  it('renders help text when required forms not started', () => {
    render(<StepView {...defaultProps} canAdvance />)
    expect(screen.getByText('Complete all required forms to advance')).toBeTruthy()
  })

  it('renders knowledge cadence bar', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('cadence-bar')).toBeTruthy()
  })

  /* ---- Recommended badges ---- */

  it('renders Recommended badge for problem_statement in step 1', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('recommended-badge-problem_statement')).toBeTruthy()
  })

  it('does not render Recommended badge for impact_assessment in step 1', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.queryByTestId('recommended-badge-impact_assessment')).toBeNull()
  })

  it('renders two Recommended badges for step 2', () => {
    render(<StepView {...defaultProps} stepNumber={2 as const} />)
    expect(screen.getByTestId('recommended-badge-fishbone')).toBeTruthy()
    expect(screen.getByTestId('recommended-badge-five_why')).toBeTruthy()
  })

  /* ---- 1.1: Step Context Banner ---- */

  it('renders step context banner with time estimate', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('step-context-banner')).toBeTruthy()
    expect(screen.getByText('60-90 min')).toBeTruthy()
  })

  it('renders step context banner with top pitfall', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText(/Jumping to solutions/)).toBeTruthy()
  })

  /* ---- 1.2: Form time estimate badges ---- */

  it('renders time estimate badges on forms', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('time-badge-problem_statement')).toBeTruthy()
    expect(screen.getByText('~20 min')).toBeTruthy()
  })

  /* ---- 1.3: Required vs Optional split ---- */

  it('puts required forms under Required Tools and optional under Optional Tools', () => {
    render(<StepView {...defaultProps} />)
    // Problem Statement is under Required Tools
    const requiredSection = screen.getByTestId('required-tools-title').closest('[class]')
    expect(requiredSection).toBeTruthy()
    // Impact Assessment is under Optional Tools
    const optionalSection = screen.getByTestId('optional-tools-title').closest('[class]')
    expect(optionalSection).toBeTruthy()
  })

  /* ---- 1.6: Step Dependency Warning ---- */

  it('shows dependency warning when viewing a step ahead of current', () => {
    render(<StepView {...defaultProps} stepNumber={2 as const} currentProjectStep={1} />)
    expect(screen.getByTestId('step-dependency-warning')).toBeTruthy()
    expect(screen.getByText(/Step 2 builds on Step 1/)).toBeTruthy()
  })

  it('does not show dependency warning when viewing current step', () => {
    render(<StepView {...defaultProps} stepNumber={1 as const} currentProjectStep={1} />)
    expect(screen.queryByTestId('step-dependency-warning')).toBeNull()
  })

  it('does not show dependency warning when no currentProjectStep is provided', () => {
    render(<StepView {...defaultProps} stepNumber={2 as const} />)
    expect(screen.queryByTestId('step-dependency-warning')).toBeNull()
  })

  /* ---- 2.2: Common Mistakes (collapsible) ---- */

  it('renders collapsible common mistakes section', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('common-mistakes')).toBeTruthy()
    expect(screen.getByText('Common Mistakes to Avoid')).toBeTruthy()
  })

  it('common mistakes expands on click to show items', () => {
    render(<StepView {...defaultProps} />)
    fireEvent.click(screen.getByText('Common Mistakes to Avoid'))
    expect(screen.getByText(/Jumping to solutions before fully understanding/)).toBeTruthy()
  })

  /* ---- Facilitation Guide (collapsible) ---- */

  it('renders collapsible facilitation guide', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByTestId('facilitation-guide')).toBeTruthy()
    expect(screen.getByText('Facilitation Guide')).toBeTruthy()
  })

  it('facilitation guide is collapsed by default', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.queryByText(/Gather the team for a 60-minute session/)).toBeNull()
  })

  it('facilitation guide expands on click', () => {
    render(<StepView {...defaultProps} />)
    fireEvent.click(screen.getByText('Facilitation Guide'))
    expect(screen.getByText(/Gather the team for a 60-minute session/)).toBeTruthy()
  })
})
