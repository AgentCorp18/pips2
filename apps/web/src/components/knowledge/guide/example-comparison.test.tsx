import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExampleComparison } from './example-comparison'

const defaultProps = {
  good: {
    title: 'Good title',
    description: 'Good description here',
  },
  bad: {
    title: 'Bad title',
    description: 'Bad description here',
  },
}

describe('ExampleComparison', () => {
  it('renders without crashing', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByTestId('example-comparison')).toBeInTheDocument()
  })

  it('renders good example card', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByTestId('good-example')).toBeInTheDocument()
  })

  it('renders bad example card', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByTestId('bad-example')).toBeInTheDocument()
  })

  it('displays "Good Example" label', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByText('Good Example')).toBeInTheDocument()
  })

  it('displays "Poor Example" label', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByText('Poor Example')).toBeInTheDocument()
  })

  it('renders good title and description', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByText('Good title')).toBeInTheDocument()
    expect(screen.getByText('Good description here')).toBeInTheDocument()
  })

  it('renders bad title and description', () => {
    render(<ExampleComparison {...defaultProps} />)
    expect(screen.getByText('Bad title')).toBeInTheDocument()
    expect(screen.getByText('Bad description here')).toBeInTheDocument()
  })

  it('good card has green border', () => {
    render(<ExampleComparison {...defaultProps} />)
    const goodCard = screen.getByTestId('good-example')
    expect(goodCard).toHaveClass('border-l-green-500')
  })

  it('bad card has amber border', () => {
    render(<ExampleComparison {...defaultProps} />)
    const badCard = screen.getByTestId('bad-example')
    expect(badCard).toHaveClass('border-l-amber-500')
  })

  it('applies custom className', () => {
    render(<ExampleComparison {...defaultProps} className="my-custom" />)
    expect(screen.getByTestId('example-comparison')).toHaveClass('my-custom')
  })

  it('has accessible hidden icons', () => {
    const { container } = render(<ExampleComparison {...defaultProps} />)
    const svgs = container.querySelectorAll('svg')
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
