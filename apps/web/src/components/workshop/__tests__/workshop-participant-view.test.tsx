import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkshopParticipantView } from '../workshop-participant-view'
import type { WorkshopSession } from '@/app/(app)/knowledge/workshop/actions'

vi.mock('@/hooks/use-workshop-realtime', () => ({
  useWorkshopRealtime: (_id: string, initial: WorkshopSession) => ({
    session: initial,
    isConnected: true,
  }),
}))

vi.mock('../workshop-timer', () => ({
  WorkshopTimer: () => <div data-testid="workshop-timer">Timer</div>,
}))

vi.mock('../workshop-module-navigator', () => ({
  WorkshopModuleNavigator: () => <div data-testid="workshop-navigator">Navigator</div>,
}))

const BASE_SESSION: WorkshopSession = {
  id: 's-1',
  org_id: 'org-1',
  facilitator_id: 'u-1',
  title: 'Team Problem-Solving',
  scenario_id: null,
  current_module_index: 0,
  timer_state: { running: false },
  participant_count: 5,
  status: 'active',
  modules: [{ title: 'Introduction', duration: '10 min', notes: '' }],
  started_at: '2026-01-01T00:00:00Z',
  completed_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('WorkshopParticipantView', () => {
  it('renders session title', () => {
    render(<WorkshopParticipantView initialSession={BASE_SESSION} />)
    expect(screen.getByText('Team Problem-Solving')).toBeTruthy()
  })

  it('renders participant count', () => {
    render(<WorkshopParticipantView initialSession={BASE_SESSION} />)
    expect(screen.getByText('5 participants')).toBeTruthy()
  })

  it('shows Connected indicator', () => {
    render(<WorkshopParticipantView initialSession={BASE_SESSION} />)
    expect(screen.getByText('Connected')).toBeTruthy()
  })

  it('renders timer for active sessions', () => {
    render(<WorkshopParticipantView initialSession={BASE_SESSION} />)
    expect(screen.getByTestId('workshop-timer')).toBeTruthy()
  })

  it('renders navigator for active sessions', () => {
    render(<WorkshopParticipantView initialSession={BASE_SESSION} />)
    expect(screen.getByTestId('workshop-navigator')).toBeTruthy()
  })

  it('shows Waiting to Start for draft sessions', () => {
    const draft = { ...BASE_SESSION, status: 'draft' as const }
    render(<WorkshopParticipantView initialSession={draft} />)
    expect(screen.getByText('Waiting to Start')).toBeTruthy()
  })

  it('shows ended message for completed sessions', () => {
    const completed = { ...BASE_SESSION, status: 'completed' as const }
    render(<WorkshopParticipantView initialSession={completed} />)
    expect(screen.getByText(/This session has ended/)).toBeTruthy()
  })
})
