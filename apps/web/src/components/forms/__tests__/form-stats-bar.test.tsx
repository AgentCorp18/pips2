import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('@/app/(app)/forms/actions', () => ({
  getFormDisplayName: vi.fn((formType: string) => {
    const names: Record<string, string> = {
      fishbone: 'Fishbone Diagram',
      five_why: '5-Why Analysis',
      brainstorming: 'Brainstorming',
    }
    return (
      names[formType] ??
      formType
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    )
  }),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { FormStatsBar } from '../form-stats-bar'

/* ============================================================
   Tests
   ============================================================ */

const baseStats = {
  total: 42,
  byFormType: [
    { formType: 'fishbone', count: 15 },
    { formType: 'five_why', count: 10 },
  ],
  recentCount: 7,
}

describe('FormStatsBar', () => {
  it('renders all 4 stat cards', () => {
    render(<FormStatsBar {...baseStats} />)
    expect(screen.getByText('Total Forms')).toBeTruthy()
    expect(screen.getByText('Most Used')).toBeTruthy()
    expect(screen.getByText('Modified This Week')).toBeTruthy()
    expect(screen.getByText('Form Types Used')).toBeTruthy()
  })

  it('shows correct total', () => {
    render(<FormStatsBar {...baseStats} />)
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('shows most used form type name', () => {
    render(<FormStatsBar {...baseStats} />)
    expect(screen.getByText('Fishbone Diagram')).toBeTruthy()
  })

  it('shows most used count as sub-value', () => {
    render(<FormStatsBar {...baseStats} />)
    expect(screen.getByText('15 times')).toBeTruthy()
  })

  it('shows recent count', () => {
    render(<FormStatsBar {...baseStats} />)
    expect(screen.getByText('7')).toBeTruthy()
  })

  it('shows em dash when no form types used', () => {
    render(<FormStatsBar total={0} byFormType={[]} recentCount={0} />)
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('shows form types used count as fraction of 24', () => {
    render(<FormStatsBar {...baseStats} />)
    // byFormType has 2 entries → "2/24"
    expect(screen.getByText('2/24')).toBeTruthy()
  })

  it('handles empty stats — 0 total and no most used', () => {
    render(<FormStatsBar total={0} byFormType={[]} recentCount={0} />)
    expect(screen.getAllByText('0')).toHaveLength(2)
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.getByText('0/24')).toBeTruthy()
  })
})
