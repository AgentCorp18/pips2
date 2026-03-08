import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReadingProgress } from '../reading-progress'

describe('ReadingProgress', () => {
  it('renders with title', () => {
    render(<ReadingProgress title="Book Progress" totalItems={10} completedItems={3} />)
    expect(screen.getByText('Book Progress')).toBeInTheDocument()
  })

  it('displays correct completion count', () => {
    render(<ReadingProgress title="Progress" totalItems={15} completedItems={5} />)
    expect(screen.getByText('5 of 15 completed')).toBeInTheDocument()
  })

  it('calculates percentage correctly', () => {
    render(<ReadingProgress title="Progress" totalItems={10} completedItems={3} />)
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('30%')
  })

  it('shows 0% when no items', () => {
    render(<ReadingProgress title="Progress" totalItems={0} completedItems={0} />)
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0%')
  })

  it('shows 100% when all completed', () => {
    render(<ReadingProgress title="Progress" totalItems={5} completedItems={5} />)
    expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100%')
  })

  it('shows complete check icon when 100%', () => {
    render(<ReadingProgress title="Progress" totalItems={5} completedItems={5} />)
    expect(screen.getByTestId('complete-check')).toBeInTheDocument()
  })

  it('does not show complete check when not 100%', () => {
    render(<ReadingProgress title="Progress" totalItems={5} completedItems={3} />)
    expect(screen.queryByTestId('complete-check')).not.toBeInTheDocument()
  })

  it('shows congratulation message when complete', () => {
    render(<ReadingProgress title="Progress" totalItems={5} completedItems={5} />)
    expect(screen.getByText('All done! Great job.')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    render(<ReadingProgress title="Progress" totalItems={10} completedItems={5} />)
    const bar = screen.getByTestId('progress-bar')
    expect(bar.style.width).toBe('50%')
  })
})
