import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepAdvisor } from '../step-advisor'
import { STEP_CONTENT } from '@pips/shared'

describe('StepAdvisor', () => {
  it('renders when there are incomplete forms', () => {
    render(<StepAdvisor stepNumber={1} completedFormTypes={new Set()} />)
    expect(screen.getByTestId('step-advisor')).toBeInTheDocument()
    expect(screen.getByText('Tool Advisor')).toBeInTheDocument()
  })

  it('does not render when all step forms are complete', () => {
    const allStep1 = new Set(STEP_CONTENT[1].forms.map((f) => f.type))
    const { container } = render(<StepAdvisor stepNumber={1} completedFormTypes={allStep1} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows completion count in summary', () => {
    render(<StepAdvisor stepNumber={1} completedFormTypes={new Set(['problem_statement'])} />)
    const totalStep1 = STEP_CONTENT[1].forms.length
    expect(screen.getByText(new RegExp(`1/${totalStep1} complete`))).toBeInTheDocument()
  })

  it('expands to show form details when clicked', () => {
    render(<StepAdvisor stepNumber={1} completedFormTypes={new Set()} />)

    // Should not show form details initially
    expect(screen.queryByTestId('advisor-form-problem_statement')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(screen.getByTestId('step-advisor-toggle'))

    // Now should show form details
    expect(screen.getByTestId('advisor-form-problem_statement')).toBeInTheDocument()
  })

  it('shows depth score badge', () => {
    render(<StepAdvisor stepNumber={1} completedFormTypes={new Set()} />)
    expect(screen.getByText(/Depth: \d+%/)).toBeInTheDocument()
  })

  it('marks completed forms with checkmark styling', () => {
    render(<StepAdvisor stepNumber={1} completedFormTypes={new Set(['problem_statement'])} />)
    fireEvent.click(screen.getByTestId('step-advisor-toggle'))

    const completedRow = screen.getByTestId('advisor-form-problem_statement')
    expect(completedRow).toHaveClass('opacity-60')
  })

  it('shows category badges for each form', () => {
    render(<StepAdvisor stepNumber={1} completedFormTypes={new Set()} />)
    fireEvent.click(screen.getByTestId('step-advisor-toggle'))

    // Step 1 has at least one required form (problem_statement)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
