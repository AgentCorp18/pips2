import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepSectionHeader } from './step-section-header'

const defaultProps = {
  stepNumber: 1,
  stepName: 'Identify',
  stepColor: '#3B82F6',
  guidingQuestion: 'What problem are we solving?',
}

describe('StepSectionHeader', () => {
  it('renders without crashing', () => {
    render(<StepSectionHeader {...defaultProps} />)
    expect(screen.getByTestId('step-section-header')).toBeInTheDocument()
  })

  it('displays step number', () => {
    render(<StepSectionHeader {...defaultProps} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays step name in title', () => {
    render(<StepSectionHeader {...defaultProps} />)
    expect(screen.getByText('Step 1: Identify')).toBeInTheDocument()
  })

  it('displays guiding question', () => {
    render(<StepSectionHeader {...defaultProps} />)
    expect(screen.getByText('What problem are we solving?')).toBeInTheDocument()
  })

  it('applies step color to badge background', () => {
    render(<StepSectionHeader {...defaultProps} />)
    const badge = screen.getByText('1')
    const badgeContainer = badge.closest('div[aria-hidden]')
    expect(badgeContainer).toBeTruthy()
    expect(badgeContainer?.getAttribute('style')).toContain('background-color')
  })

  it('applies background color with opacity', () => {
    render(<StepSectionHeader {...defaultProps} />)
    const header = screen.getByTestId('step-section-header')
    expect(header.getAttribute('style')).toContain('background-color')
  })

  it('applies custom className', () => {
    render(<StepSectionHeader {...defaultProps} className="my-class" />)
    expect(screen.getByTestId('step-section-header')).toHaveClass('my-class')
  })

  it('renders guiding question in italic', () => {
    render(<StepSectionHeader {...defaultProps} />)
    const question = screen.getByText('What problem are we solving?')
    expect(question).toHaveClass('italic')
  })
})
