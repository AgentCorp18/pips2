import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MethodologyDepthBadge } from '../methodology-depth-badge'

describe('MethodologyDepthBadge', () => {
  it('renders with zero completed forms', () => {
    render(<MethodologyDepthBadge completedFormTypes={new Set()} />)
    const badge = screen.getByTestId('methodology-depth-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', expect.stringContaining('0%'))
  })

  it('shows Minimal label for low scores', () => {
    render(<MethodologyDepthBadge completedFormTypes={new Set()} />)
    expect(screen.getByText('Minimal')).toBeInTheDocument()
  })

  it('renders in compact mode without label', () => {
    render(<MethodologyDepthBadge completedFormTypes={new Set()} compact />)
    expect(screen.queryByText('Minimal')).not.toBeInTheDocument()
  })

  it('renders with some completed forms', () => {
    const forms = new Set(['problem_statement', 'fishbone', 'brainstorming'])
    render(<MethodologyDepthBadge completedFormTypes={forms} />)
    const badge = screen.getByTestId('methodology-depth-badge')
    expect(badge).toBeInTheDocument()
    // Score should be > 0
    expect(badge.getAttribute('aria-label')).not.toContain('0%')
  })

  it('renders SVG ring indicator', () => {
    render(<MethodologyDepthBadge completedFormTypes={new Set()} />)
    const svg = screen.getByTestId('methodology-depth-badge').querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
