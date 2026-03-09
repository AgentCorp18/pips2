import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepSummaryCard } from '../step-summary-card'

/* ============================================================
   Tests
   ============================================================ */

describe('StepSummaryCard', () => {
  const baseProps = {
    projectId: 'test-project-id',
    stepNumber: 1,
    stepName: 'Identify',
    stepColor: '#2563EB',
    status: 'not_started' as const,
    highlights: [],
  }

  it('renders the step number and name', () => {
    render(<StepSummaryCard {...baseProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Identify')).toBeInTheDocument()
  })

  it('has correct data-testid', () => {
    render(<StepSummaryCard {...baseProps} />)
    expect(screen.getByTestId('step-summary-card-1')).toBeInTheDocument()
  })

  it('shows "Not yet started" for not_started status', () => {
    render(<StepSummaryCard {...baseProps} />)
    expect(screen.getByText('Not yet started')).toBeInTheDocument()
  })

  it('shows "Not Started" badge for not_started status', () => {
    render(<StepSummaryCard {...baseProps} />)
    expect(screen.getByText('Not Started')).toBeInTheDocument()
  })

  it('shows "In Progress" badge for in_progress status', () => {
    render(<StepSummaryCard {...baseProps} status="in_progress" />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('shows "In progress" message when in_progress with no highlights', () => {
    render(<StepSummaryCard {...baseProps} status="in_progress" />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('shows highlights for in_progress step with data', () => {
    render(
      <StepSummaryCard
        {...baseProps}
        status="in_progress"
        highlights={[{ label: 'Problem Statement', value: 'Test problem' }]}
      />,
    )
    expect(screen.getByText('Problem Statement')).toBeInTheDocument()
    expect(screen.getByText('Test problem')).toBeInTheDocument()
  })

  it('shows "Completed" badge for completed status', () => {
    render(<StepSummaryCard {...baseProps} status="completed" highlights={[]} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows highlights for completed step', () => {
    const highlights = [
      { label: 'Problem Statement', value: 'Production defects exceeding 5%' },
      { label: 'Problem Area', value: 'Quality' },
    ]
    render(<StepSummaryCard {...baseProps} status="completed" highlights={highlights} />)
    expect(screen.getByText('Problem Statement')).toBeInTheDocument()
    expect(screen.getByText('Production defects exceeding 5%')).toBeInTheDocument()
    expect(screen.getByText('Problem Area')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
  })

  it('shows completion date when provided', () => {
    render(
      <StepSummaryCard
        {...baseProps}
        status="completed"
        completedAt="2026-03-01T00:00:00Z"
        highlights={[{ label: 'Test', value: 'value' }]}
      />,
    )
    // "Completed" appears in both badge and the date line; use getAllByText
    expect(screen.getAllByText(/Completed/).length).toBeGreaterThanOrEqual(1)
    // The date text contains "Completed" prefix + the formatted date
    const dateLine = screen.getByText(/Completed\s+\d/)
    expect(dateLine).toBeInTheDocument()
  })

  it('shows no-data message for completed step without highlights', () => {
    render(<StepSummaryCard {...baseProps} status="completed" highlights={[]} />)
    expect(screen.getByText(/no form data recorded/)).toBeInTheDocument()
  })

  it('shows "Skipped" badge for skipped status', () => {
    render(<StepSummaryCard {...baseProps} status="skipped" highlights={[]} />)
    expect(screen.getByText('Skipped')).toBeInTheDocument()
  })

  it('renders multiple highlight items with data-testid', () => {
    const highlights = [
      { label: 'Label A', value: 'Value A' },
      { label: 'Label B', value: 'Value B' },
      { label: 'Label C', value: 'Value C' },
    ]
    render(<StepSummaryCard {...baseProps} status="completed" highlights={highlights} />)
    expect(screen.getAllByTestId('step-highlight')).toHaveLength(3)
  })

  it('renders with different step colors', () => {
    const { container } = render(
      <StepSummaryCard
        projectId="test-project-id"
        stepNumber={3}
        stepName="Generate"
        stepColor="#059669"
        status="not_started"
        highlights={[]}
      />,
    )
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Generate')).toBeInTheDocument()
    const badge = container.querySelector('[style*="background-color"]')
    expect(badge).toHaveStyle({ backgroundColor: '#059669' })
  })
})
