import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HealthBadge } from '../health-badge'
import type { HealthScore } from '@pips/shared'

/* ---- Fixtures ---- */

const excellentHealth: HealthScore = {
  score: 85,
  label: 'Excellent',
  color: '#22C55E',
  factors: {
    methodologyDepthPercent: 90,
    daysSinceLastActivity: 1,
    ticketCompletionPercent: 80,
    formsCompletedPercent: 75,
  },
}

const criticalHealth: HealthScore = {
  score: 5,
  label: 'Critical',
  color: '#EF4444',
  factors: {
    methodologyDepthPercent: 0,
    daysSinceLastActivity: 90,
    ticketCompletionPercent: 0,
    formsCompletedPercent: 0,
  },
}

const zeroScoreHealth: HealthScore = {
  score: 0,
  label: 'Critical',
  color: '#EF4444',
  factors: {
    methodologyDepthPercent: 0,
    daysSinceLastActivity: 365,
    ticketCompletionPercent: 0,
    formsCompletedPercent: 0,
  },
}

/* ---- Tests ---- */

describe('HealthBadge', () => {
  it('renders with data-testid', () => {
    render(<HealthBadge health={excellentHealth} />)
    expect(screen.getByTestId('health-badge')).toBeInTheDocument()
  })

  it('has correct aria-label including score and label', () => {
    render(<HealthBadge health={excellentHealth} />)
    const badge = screen.getByTestId('health-badge')
    expect(badge).toHaveAttribute('aria-label', 'Project health: 85/100 — Excellent')
  })

  it('shows label text in full (non-compact) mode', () => {
    render(<HealthBadge health={excellentHealth} />)
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('hides label text in compact mode', () => {
    render(<HealthBadge health={excellentHealth} compact />)
    expect(screen.queryByText('Excellent')).not.toBeInTheDocument()
  })

  it('renders SVG ring indicator', () => {
    render(<HealthBadge health={excellentHealth} />)
    const svg = screen.getByTestId('health-badge').querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders with Critical label for low score', () => {
    render(<HealthBadge health={criticalHealth} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders correctly when score is 0', () => {
    render(<HealthBadge health={zeroScoreHealth} />)
    const badge = screen.getByTestId('health-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('aria-label', 'Project health: 0/100 — Critical')
  })

  it('compact mode still renders SVG ring', () => {
    render(<HealthBadge health={criticalHealth} compact />)
    const svg = screen.getByTestId('health-badge').querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('uses the color from health score', () => {
    render(<HealthBadge health={excellentHealth} />)
    const label = screen.getByText('Excellent')
    expect(label).toHaveStyle({ color: '#22C55E' })
  })
})
