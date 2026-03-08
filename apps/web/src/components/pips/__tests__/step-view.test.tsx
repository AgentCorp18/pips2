import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepView } from '../step-view'

vi.mock('@pips/shared', () => ({
  STEP_CONTENT: {
    1: {
      title: 'Identify',
      objective: 'Define a clear, measurable problem statement.',
      prompts: ['What is the current state?', 'What is the desired state?'],
      forms: [
        {
          type: 'problem_statement',
          name: 'Problem Statement',
          description: 'Define As-Is and Desired',
          required: true,
        },
        {
          type: 'impact_assessment',
          name: 'Impact Assessment',
          description: 'Quantify impact',
          required: false,
        },
      ],
      completionCriteria: ['Problem statement defined', 'Impact assessed'],
      methodology: { tips: [], bestPractices: [], facilitationGuide: '' },
    },
    2: {
      title: 'Analyze',
      objective: 'Determine root causes of the problem.',
      prompts: ['Why does this happen?'],
      forms: [
        {
          type: 'fishbone',
          name: 'Fishbone Diagram',
          description: 'Identify cause categories',
          required: false,
        },
        {
          type: 'five_why',
          name: '5 Whys',
          description: 'Drill down to root cause',
          required: false,
        },
      ],
      completionCriteria: ['Root causes identified'],
      methodology: { tips: [], bestPractices: [], facilitationGuide: '' },
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

  it('renders Analysis Tools section', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('Analysis Tools')).toBeTruthy()
  })

  it('renders form names', () => {
    render(<StepView {...defaultProps} />)
    expect(screen.getByText('Problem Statement')).toBeTruthy()
    expect(screen.getByText('Impact Assessment')).toBeTruthy()
  })

  it('renders Required badge for required forms', () => {
    render(<StepView {...defaultProps} />)
    const badges = screen.getAllByText('Required')
    expect(badges.length).toBe(1)
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
})
