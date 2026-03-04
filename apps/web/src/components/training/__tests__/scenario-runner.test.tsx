import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioRunner } from '../scenario-runner'

const SCENARIO = {
  slug: 'test-scenario',
  title: 'Test Scenario',
  description: 'A test practice scenario',
  context: 'Your team has identified a recurring quality issue.',
  steps: [
    {
      step: 1,
      title: 'Define the Problem',
      description: 'Write a problem statement',
      prompt: 'What is the problem?',
    },
    {
      step: 2,
      title: 'Analyze Causes',
      description: 'Find root causes',
      prompt: 'Why does this happen?',
    },
    {
      step: 3,
      title: 'Generate Ideas',
      description: 'Brainstorm solutions',
      prompt: 'What could fix this?',
    },
  ],
}

describe('ScenarioRunner', () => {
  it('renders the scenario context', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    expect(screen.getByText('Your team has identified a recurring quality issue.')).toBeTruthy()
  })

  it('renders scenario context heading', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    expect(screen.getByText('Scenario Context')).toBeTruthy()
  })

  it('renders step navigation buttons', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    expect(screen.getByText('Step 1')).toBeTruthy()
    expect(screen.getByText('Step 2')).toBeTruthy()
    expect(screen.getByText('Step 3')).toBeTruthy()
  })

  it('shows first step as current', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    const step1Btn = screen.getByLabelText('Step 1: Identify')
    expect(step1Btn.getAttribute('aria-current')).toBe('step')
  })

  it('renders active step title', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    expect(screen.getByText('Define the Problem')).toBeTruthy()
  })

  it('renders active step prompt', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    expect(screen.getByText('What is the problem?')).toBeTruthy()
  })

  it('renders a textarea for response', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeTruthy()
    expect(textarea.getAttribute('aria-label')).toContain('Step 1')
  })

  it('disables Next Step button when textarea is empty', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    const nextBtn = screen.getByText('Next Step')
    expect(nextBtn.closest('button')?.disabled).toBe(true)
  })

  it('enables Next Step button when textarea has content', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'My response' } })
    const nextBtn = screen.getByText('Next Step')
    expect(nextBtn.closest('button')?.disabled).toBe(false)
  })

  it('advances to next step on submit', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Problem identified' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Step 2 should now be active
    expect(screen.getByText('Analyze Causes')).toBeTruthy()
    expect(screen.getByText('Why does this happen?')).toBeTruthy()
  })

  it('shows Complete Scenario button on last step', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)

    // Complete step 1
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 1 done' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Complete step 2
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 2 done' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Should show Complete Scenario on step 3
    expect(screen.getByText('Complete Scenario')).toBeTruthy()
  })

  it('shows completion message after all steps', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)

    // Complete all 3 steps
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 1' } })
    fireEvent.click(screen.getByText('Next Step'))

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 2' } })
    fireEvent.click(screen.getByText('Next Step'))

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 3' } })
    fireEvent.click(screen.getByText('Complete Scenario'))

    expect(screen.getByText('Scenario Complete!')).toBeTruthy()
  })

  it('shows responses review after completing steps', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My step 1 response' } })
    fireEvent.click(screen.getByText('Next Step'))

    expect(screen.getByText('Your Responses')).toBeTruthy()
    expect(screen.getByText('My step 1 response')).toBeTruthy()
  })

  it('allows navigating back to a completed step', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 1 done' } })
    fireEvent.click(screen.getByText('Next Step'))

    // Click back to step 1
    fireEvent.click(screen.getByLabelText('Step 1: Identify (completed)'))

    // Step 1 prompt should be visible
    expect(screen.getByText('What is the problem?')).toBeTruthy()
  })

  it('has data-testid on container', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    expect(screen.getByTestId('scenario-runner')).toBeTruthy()
  })

  it('renders step navigation as nav element', () => {
    render(<ScenarioRunner scenario={SCENARIO} />)
    const nav = screen.getByLabelText('Scenario steps')
    expect(nav.tagName).toBe('NAV')
  })
})
