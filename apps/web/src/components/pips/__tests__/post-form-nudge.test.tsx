import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PostFormNudge } from '../post-form-nudge'

describe('PostFormNudge', () => {
  const defaultProps = {
    projectId: 'proj-1',
    stepNumber: 1 as const,
    completedFormTypes: new Set(['problem_statement']),
    justCompletedType: 'problem_statement',
    visible: true,
  }

  it('renders when visible and there are recommendations', () => {
    render(<PostFormNudge {...defaultProps} />)
    expect(screen.getByTestId('post-form-nudge')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<PostFormNudge {...defaultProps} visible={false} />)
    expect(screen.queryByTestId('post-form-nudge')).not.toBeInTheDocument()
  })

  it('shows a link to the recommended form', () => {
    render(<PostFormNudge {...defaultProps} />)
    const link = screen.getByTestId('nudge-link')
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toContain('/projects/proj-1/steps/1/forms/')
  })

  it('can be dismissed', () => {
    render(<PostFormNudge {...defaultProps} />)
    expect(screen.getByTestId('post-form-nudge')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('nudge-dismiss'))
    expect(screen.queryByTestId('post-form-nudge')).not.toBeInTheDocument()
  })

  it('does not render when all step forms are complete', () => {
    // Complete all step 1 forms so there's nothing to recommend
    const allComplete = new Set([
      'problem_statement',
      'impact_assessment',
      'list_reduction',
      'weighted_voting',
    ])
    render(
      <PostFormNudge
        {...defaultProps}
        completedFormTypes={allComplete}
        justCompletedType="weighted_voting"
      />,
    )
    expect(screen.queryByTestId('post-form-nudge')).not.toBeInTheDocument()
  })

  it('shows rationale text', () => {
    render(<PostFormNudge {...defaultProps} />)
    expect(screen.getByText(/Deepen your analysis:/)).toBeInTheDocument()
  })
})
