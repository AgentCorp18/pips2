import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkshopSlideView } from '../workshop-slide-view'
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

const BASE_SESSION: WorkshopSession = {
  id: 's-1',
  org_id: 'org-1',
  facilitator_id: 'u-1',
  title: 'Team Workshop',
  scenario_id: null,
  current_module_index: 0,
  timer_state: { running: false },
  participant_count: 8,
  status: 'active',
  modules: [
    { title: 'Welcome & Icebreaker', duration: '10 min', notes: 'Introduce yourselves' },
    { title: 'Problem Statement', duration: '20 min', notes: '' },
  ],
  started_at: '2026-01-01T00:00:00Z',
  completed_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('WorkshopSlideView', () => {
  it('renders current module title', () => {
    render(<WorkshopSlideView initialSession={BASE_SESSION} />)
    expect(screen.getByText('Welcome & Icebreaker')).toBeTruthy()
  })

  it('renders module step indicator', () => {
    render(<WorkshopSlideView initialSession={BASE_SESSION} />)
    expect(screen.getByText('1 / 2')).toBeTruthy()
  })

  it('renders module duration', () => {
    render(<WorkshopSlideView initialSession={BASE_SESSION} />)
    expect(screen.getByText('10 min')).toBeTruthy()
  })

  it('renders module notes when present', () => {
    render(<WorkshopSlideView initialSession={BASE_SESSION} />)
    expect(screen.getByText('Introduce yourselves')).toBeTruthy()
  })

  it('renders timer', () => {
    render(<WorkshopSlideView initialSession={BASE_SESSION} />)
    expect(screen.getByTestId('workshop-timer')).toBeTruthy()
  })

  it('renders keyboard hint', () => {
    render(<WorkshopSlideView initialSession={BASE_SESSION} />)
    expect(screen.getByText(/fullscreen/)).toBeTruthy()
  })

  it('renders Session Complete for completed sessions', () => {
    const completed = { ...BASE_SESSION, status: 'completed' as const }
    render(<WorkshopSlideView initialSession={completed} />)
    expect(screen.getByText('Session Complete')).toBeTruthy()
  })

  it('renders no modules message when empty', () => {
    const noModules = { ...BASE_SESSION, modules: [] }
    render(<WorkshopSlideView initialSession={noModules} />)
    expect(screen.getByText('No modules in this session')).toBeTruthy()
  })
})
