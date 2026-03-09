import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhyThisMatters } from './why-this-matters'

describe('WhyThisMatters', () => {
  const defaultProps = {
    heading: 'Clear problem definition saves time',
    paragraphs: ['Teams that skip this step waste cycles.', 'A clear statement aligns everyone.'],
    stepColor: '#3B82F6',
  }

  it('renders with data-testid', () => {
    render(<WhyThisMatters {...defaultProps} />)
    expect(screen.getByTestId('why-this-matters')).toBeInTheDocument()
  })

  it('renders the "Why This Step Matters" label', () => {
    render(<WhyThisMatters {...defaultProps} />)
    expect(screen.getByText('Why This Step Matters')).toBeInTheDocument()
  })

  it('renders heading', () => {
    render(<WhyThisMatters {...defaultProps} />)
    expect(screen.getByText('Clear problem definition saves time')).toBeInTheDocument()
  })

  it('renders all paragraphs', () => {
    render(<WhyThisMatters {...defaultProps} />)
    expect(screen.getByText('Teams that skip this step waste cycles.')).toBeInTheDocument()
    expect(screen.getByText('A clear statement aligns everyone.')).toBeInTheDocument()
  })

  it('applies stepColor to border', () => {
    render(<WhyThisMatters {...defaultProps} />)
    const el = screen.getByTestId('why-this-matters')
    expect(el.style.borderLeftColor).toBe('rgb(59, 130, 246)')
  })

  it('applies stepColor to background with opacity', () => {
    render(<WhyThisMatters {...defaultProps} />)
    const el = screen.getByTestId('why-this-matters')
    expect(el.style.backgroundColor).toBeTruthy()
  })

  it('applies custom className', () => {
    render(<WhyThisMatters {...defaultProps} className="custom" />)
    expect(screen.getByTestId('why-this-matters')).toHaveClass('custom')
  })

  it('colors the label with stepColor', () => {
    render(<WhyThisMatters {...defaultProps} />)
    const label = screen.getByText('Why This Step Matters')
    expect(label.style.color).toBe('rgb(59, 130, 246)')
  })
})
