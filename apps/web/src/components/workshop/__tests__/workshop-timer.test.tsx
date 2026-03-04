import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkshopTimer } from '../workshop-timer'

vi.mock('@/hooks/use-workshop-realtime', () => ({
  useWorkshopTimer: (state: { elapsed?: number }) => state.elapsed ?? 0,
  formatTime: (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  },
}))

const IDLE_TIMER = { mode: null, running: false, elapsed: 0 }
const RUNNING_COUNTDOWN = { mode: 'countdown' as const, running: true, elapsed: 300 }
const PAUSED_COUNTDOWN = { mode: 'countdown' as const, running: false, elapsed: 300 }
const EXPIRED_COUNTDOWN = { mode: 'countdown' as const, running: true, elapsed: 0 }
const RUNNING_COUNTUP = { mode: 'countup' as const, running: true, elapsed: 150 }

describe('WorkshopTimer', () => {
  it('renders data-testid on container', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} />)
    expect(screen.getByTestId('workshop-timer')).toBeTruthy()
  })

  it('renders timer display', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} />)
    expect(screen.getByTestId('timer-display')).toBeTruthy()
    expect(screen.getByTestId('timer-display').textContent).toBe('00:00')
  })

  it('renders timer role element', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} />)
    expect(screen.getByRole('timer')).toBeTruthy()
  })

  it('shows countdown aria-label', () => {
    render(<WorkshopTimer timerState={RUNNING_COUNTDOWN} />)
    const timer = screen.getByRole('timer')
    expect(timer.getAttribute('aria-label')).toContain('Countdown')
  })

  it('shows elapsed aria-label for countup', () => {
    render(<WorkshopTimer timerState={RUNNING_COUNTUP} />)
    const timer = screen.getByRole('timer')
    expect(timer.getAttribute('aria-label')).toContain('Elapsed')
  })

  it('hides controls by default', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} />)
    expect(screen.queryByText('Pause')).toBeNull()
    expect(screen.queryByText('Start Stopwatch')).toBeNull()
  })

  it('shows preset duration buttons when no timer active and showControls', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} showControls />)
    expect(screen.getByText('5m')).toBeTruthy()
    expect(screen.getByText('10m')).toBeTruthy()
    expect(screen.getByText('15m')).toBeTruthy()
    expect(screen.getByText('20m')).toBeTruthy()
    expect(screen.getByText('30m')).toBeTruthy()
  })

  it('shows Start Stopwatch button when idle with controls', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} showControls />)
    expect(screen.getByText('Start Stopwatch')).toBeTruthy()
  })

  it('shows helper text for countdown', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} showControls />)
    expect(screen.getByText('Start a countdown timer')).toBeTruthy()
  })

  it('calls onStartCountdown with preset seconds', () => {
    const onStartCountdown = vi.fn()
    render(
      <WorkshopTimer timerState={IDLE_TIMER} showControls onStartCountdown={onStartCountdown} />,
    )
    fireEvent.click(screen.getByText('10m'))
    expect(onStartCountdown).toHaveBeenCalledWith(600)
  })

  it('calls onStartCountup on stopwatch click', () => {
    const onStartCountup = vi.fn()
    render(<WorkshopTimer timerState={IDLE_TIMER} showControls onStartCountup={onStartCountup} />)
    fireEvent.click(screen.getByText('Start Stopwatch'))
    expect(onStartCountup).toHaveBeenCalled()
  })

  it('shows Pause button when timer is running', () => {
    render(<WorkshopTimer timerState={RUNNING_COUNTDOWN} showControls />)
    expect(screen.getByText('Pause')).toBeTruthy()
  })

  it('calls onPause when Pause clicked', () => {
    const onPause = vi.fn()
    render(<WorkshopTimer timerState={RUNNING_COUNTDOWN} showControls onPause={onPause} />)
    fireEvent.click(screen.getByText('Pause'))
    expect(onPause).toHaveBeenCalled()
  })

  it('shows Resume button when timer is paused', () => {
    render(<WorkshopTimer timerState={PAUSED_COUNTDOWN} showControls />)
    expect(screen.getByText('Resume')).toBeTruthy()
  })

  it('calls onResume when Resume clicked', () => {
    const onResume = vi.fn()
    render(<WorkshopTimer timerState={PAUSED_COUNTDOWN} showControls onResume={onResume} />)
    fireEvent.click(screen.getByText('Resume'))
    expect(onResume).toHaveBeenCalled()
  })

  it('shows Reset button when timer has a mode', () => {
    render(<WorkshopTimer timerState={PAUSED_COUNTDOWN} showControls />)
    expect(screen.getByText('Reset')).toBeTruthy()
  })

  it('calls onReset when Reset clicked', () => {
    const onReset = vi.fn()
    render(<WorkshopTimer timerState={PAUSED_COUNTDOWN} showControls onReset={onReset} />)
    fireEvent.click(screen.getByText('Reset'))
    expect(onReset).toHaveBeenCalled()
  })

  it("shows Time's up alert when countdown expires", () => {
    render(<WorkshopTimer timerState={EXPIRED_COUNTDOWN} />)
    expect(screen.getByRole('alert').textContent).toContain("Time's up")
  })

  it('renders custom minutes input when idle with controls', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} showControls />)
    expect(screen.getByLabelText('Custom timer duration in minutes')).toBeTruthy()
  })

  it('disables Start button when custom minutes is empty', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} showControls />)
    const startBtn = screen.getByText('Start')
    expect(startBtn.closest('button')?.disabled).toBe(true)
  })

  it('calls onStartCountdown with custom minutes', () => {
    const onStartCountdown = vi.fn()
    render(
      <WorkshopTimer timerState={IDLE_TIMER} showControls onStartCountdown={onStartCountdown} />,
    )
    const input = screen.getByLabelText('Custom timer duration in minutes')
    fireEvent.change(input, { target: { value: '7' } })
    fireEvent.click(screen.getByText('Start'))
    expect(onStartCountdown).toHaveBeenCalledWith(420)
  })

  it('applies large class when large prop is true', () => {
    render(<WorkshopTimer timerState={IDLE_TIMER} large />)
    expect(screen.getByTestId('timer-display').className).toContain('text-6xl')
  })
})
