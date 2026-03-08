import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkshopSessionManager } from '../workshop-session-manager'

vi.mock('@/hooks/use-workshop-realtime', () => ({
  useWorkshopRealtime: (_id: string, initial: unknown) => ({
    session: initial,
    isConnected: true,
  }),
}))

vi.mock('@/app/(app)/knowledge/workshop/actions', () => ({
  startSession: vi.fn(),
  pauseSession: vi.fn(),
  resumeSession: vi.fn(),
  completeSession: vi.fn(),
  setCurrentModule: vi.fn(),
  updateTimerState: vi.fn(),
}))

vi.mock('../workshop-timer', () => ({
  WorkshopTimer: () => <div data-testid="workshop-timer" />,
}))

vi.mock('../workshop-module-navigator', () => ({
  WorkshopModuleNavigator: () => <div data-testid="module-navigator" />,
}))

const baseMockSession = {
  id: 'ws-1',
  org_id: 'org-1',
  facilitator_id: 'u-1',
  title: 'PIPS Workshop',
  scenario_id: null,
  current_module_index: 0,
  timer_state: {},
  participant_count: 5,
  modules: [
    { title: 'Introduction', duration: '10 min', notes: '' },
    { title: 'Activity', duration: '20 min', notes: '' },
  ],
  started_at: null,
  completed_at: null,
  created_at: '2026-03-01',
  updated_at: '2026-03-01',
}

describe('WorkshopSessionManager', () => {
  it('renders session title', () => {
    const session = { ...baseMockSession, status: 'draft' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('PIPS Workshop')).toBeTruthy()
  })

  it('renders Draft status badge', () => {
    const session = { ...baseMockSession, status: 'draft' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Draft')).toBeTruthy()
  })

  it('renders participant count', () => {
    const session = { ...baseMockSession, status: 'draft' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('5 participants')).toBeTruthy()
  })

  it('renders Live indicator when connected', () => {
    const session = { ...baseMockSession, status: 'draft' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Live')).toBeTruthy()
  })

  it('renders Start Session button for draft', () => {
    const session = { ...baseMockSession, status: 'draft' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Start Session')).toBeTruthy()
  })

  it('renders Pause and End buttons for active session', () => {
    const session = { ...baseMockSession, status: 'active' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Pause')).toBeTruthy()
    expect(screen.getByText('End Session')).toBeTruthy()
  })

  it('renders Resume and End buttons for paused session', () => {
    const session = { ...baseMockSession, status: 'paused' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Resume')).toBeTruthy()
    expect(screen.getByText('End Session')).toBeTruthy()
  })

  it('renders share links for active session', () => {
    const session = { ...baseMockSession, status: 'active' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Copy Participant Link')).toBeTruthy()
    expect(screen.getByText('Presentation Mode')).toBeTruthy()
  })

  it('renders Agenda and Timer sections for non-completed', () => {
    const session = { ...baseMockSession, status: 'draft' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('Agenda')).toBeTruthy()
    expect(screen.getByText('Timer')).toBeTruthy()
  })

  it('renders completed state message', () => {
    const session = {
      ...baseMockSession,
      status: 'completed' as const,
      completed_at: '2026-03-02T12:00:00Z',
    }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByText('This session has been completed.')).toBeTruthy()
  })

  it('hides Agenda/Timer for completed session', () => {
    const session = { ...baseMockSession, status: 'completed' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.queryByText('Agenda')).toBeNull()
    expect(screen.queryByText('Timer')).toBeNull()
  })

  it('renders module navigator and timer components', () => {
    const session = { ...baseMockSession, status: 'active' as const }
    render(<WorkshopSessionManager initialSession={session} />)
    expect(screen.getByTestId('module-navigator')).toBeTruthy()
    expect(screen.getByTestId('workshop-timer')).toBeTruthy()
  })
})
