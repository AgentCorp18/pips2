import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrainingProgressRing } from '../training-progress-ring'

describe('TrainingProgressRing', () => {
  it('renders 0% for zero progress', () => {
    render(<TrainingProgressRing progress={0} />)
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('renders 50% for half progress', () => {
    render(<TrainingProgressRing progress={0.5} />)
    expect(screen.getByText('50%')).toBeTruthy()
  })

  it('renders 100% for full progress', () => {
    render(<TrainingProgressRing progress={1} />)
    expect(screen.getByText('100%')).toBeTruthy()
  })

  it('rounds to nearest integer', () => {
    render(<TrainingProgressRing progress={0.333} />)
    expect(screen.getByText('33%')).toBeTruthy()
  })

  it('renders SVG with two circles (background + progress)', () => {
    const { container } = render(<TrainingProgressRing progress={0.5} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
  })

  it('uses custom size', () => {
    const { container } = render(<TrainingProgressRing progress={0.5} size={60} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('60')
    expect(svg?.getAttribute('height')).toBe('60')
  })

  it('uses custom stroke width', () => {
    const { container } = render(<TrainingProgressRing progress={0.5} strokeWidth={5} />)
    const circles = container.querySelectorAll('circle')
    expect(circles[0]?.getAttribute('stroke-width')).toBe('5')
    expect(circles[1]?.getAttribute('stroke-width')).toBe('5')
  })
})
