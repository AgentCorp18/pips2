import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepStepper, type StepData } from '../step-stepper'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('@pips/shared', () => ({
  PIPS_STEPS: [
    { number: 1, name: 'Identify', description: 'Define measurable problem statements' },
    { number: 2, name: 'Analyze', description: 'Root cause analysis' },
    { number: 3, name: 'Generate', description: 'Brainstorm solutions' },
    { number: 4, name: 'Select & Plan', description: 'Decision matrices' },
    { number: 5, name: 'Implement', description: 'Execute with milestones' },
    { number: 6, name: 'Evaluate', description: 'Measure results' },
  ],
}))

/* ============================================================
   Helpers
   ============================================================ */

const buildSteps = (completedUpTo: number, currentStep: number): StepData[] =>
  [1, 2, 3, 4, 5, 6].map((n) => ({
    step_number: n,
    status: n < completedUpTo ? 'completed' : n === currentStep ? 'in_progress' : 'not_started',
  }))

/* ============================================================
   Tests
   ============================================================ */

describe('StepStepper', () => {
  it('renders all 6 step names', () => {
    const steps = buildSteps(1, 1)
    render(<StepStepper steps={steps} currentStep={1} />)
    expect(screen.getAllByText('Identify')).toHaveLength(2) // desktop + mobile
    expect(screen.getAllByText('Analyze')).toHaveLength(2)
    expect(screen.getAllByText('Generate')).toHaveLength(2)
    expect(screen.getAllByText('Select & Plan')).toHaveLength(2)
    expect(screen.getAllByText('Implement')).toHaveLength(2)
    expect(screen.getAllByText('Evaluate')).toHaveLength(2)
  })

  it('renders step numbers for non-completed steps', () => {
    const steps = buildSteps(1, 1)
    render(<StepStepper steps={steps} currentStep={1} />)
    // Step numbers 2-6 appear in both desktop and mobile = 10 occurrences
    // Step 1 is current but not completed, so shows "1" too
    const allButtons = screen.getAllByRole('button')
    expect(allButtons.length).toBe(12) // 6 desktop + 6 mobile
  })

  it('calls onStepClick when a clickable step is clicked', () => {
    const onStepClick = vi.fn()
    const steps = buildSteps(3, 3)
    render(<StepStepper steps={steps} currentStep={3} onStepClick={onStepClick} />)

    // Step 1 is completed, so it should be clickable
    const identifyButtons = screen.getAllByText('Identify')
    fireEvent.click(identifyButtons[0]!) // Desktop version
    expect(onStepClick).toHaveBeenCalledWith(1)
  })

  it('does not call onStepClick for not_started steps', () => {
    const onStepClick = vi.fn()
    const steps = buildSteps(2, 2)
    render(<StepStepper steps={steps} currentStep={2} onStepClick={onStepClick} />)

    // Step 4 is not_started, its button should be disabled
    const buttons = screen.getAllByRole('button')
    // Each non-clickable button should be disabled
    const step4Buttons = buttons.filter((btn) => btn.textContent?.includes('Select & Plan'))
    step4Buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('allows clicking the current step', () => {
    const onStepClick = vi.fn()
    const steps = buildSteps(1, 1)
    render(<StepStepper steps={steps} currentStep={1} onStepClick={onStepClick} />)

    const identifyButtons = screen.getAllByText('Identify')
    fireEvent.click(identifyButtons[0]!)
    expect(onStepClick).toHaveBeenCalledWith(1)
  })

  it('does not call onStepClick when no handler is provided', () => {
    const steps = buildSteps(3, 3)
    render(<StepStepper steps={steps} currentStep={3} />)

    // All buttons should be disabled when no onStepClick provided
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('shows description only for the current step (desktop)', () => {
    const steps = buildSteps(1, 2)
    render(<StepStepper steps={steps} currentStep={2} />)
    // Only step 2 (current) should show its description in desktop view
    expect(screen.getByText('Root cause analysis')).toBeInTheDocument()
    // Step 1 description should not be visible (it's not current)
    expect(screen.queryByText('Define measurable problem statements')).not.toBeInTheDocument()
  })

  it('renders completed steps with check icon', () => {
    const steps = buildSteps(3, 3)
    render(<StepStepper steps={steps} currentStep={3} />)
    // Steps 1 and 2 are completed, they should have check SVGs
    const svgs = document.querySelectorAll('svg')
    // At least 2 check icons for completed steps (desktop + mobile = 4 total)
    expect(svgs.length).toBeGreaterThanOrEqual(4)
  })

  it('defaults not_started status when step is missing from array', () => {
    // Only pass steps for 1-3, leaving 4-6 missing
    const steps: StepData[] = [
      { step_number: 1, status: 'completed' },
      { step_number: 2, status: 'in_progress' },
      { step_number: 3, status: 'not_started' },
    ]
    render(<StepStepper steps={steps} currentStep={2} />)
    // Steps 4-6 should still render with not_started (default)
    expect(screen.getAllByText('Select & Plan')).toHaveLength(2)
    expect(screen.getAllByText('Implement')).toHaveLength(2)
    expect(screen.getAllByText('Evaluate')).toHaveLength(2)
  })

  it('handles skipped steps as clickable', () => {
    const onStepClick = vi.fn()
    const steps: StepData[] = [
      { step_number: 1, status: 'completed' },
      { step_number: 2, status: 'skipped' },
      { step_number: 3, status: 'in_progress' },
      { step_number: 4, status: 'not_started' },
      { step_number: 5, status: 'not_started' },
      { step_number: 6, status: 'not_started' },
    ]
    render(<StepStepper steps={steps} currentStep={3} onStepClick={onStepClick} />)

    // Step 2 is skipped, which counts as clickable
    const analyzeButtons = screen.getAllByText('Analyze')
    fireEvent.click(analyzeButtons[0]!)
    expect(onStepClick).toHaveBeenCalledWith(2)
  })
})
