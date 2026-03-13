import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrainingExercise } from '../training-exercise'

vi.mock('@/app/(app)/training/exercise-actions', () => ({
  checkAnswer: vi.fn(),
  completeExercise: vi.fn(),
  completeModule: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const BASE_EXERCISE = {
  id: 'ex-1',
  module_id: 'mod-1',
  title: 'Test Exercise',
  instructions: 'Do the thing',
  type: 'multiple-choice' as const,
  expected_minutes: 10,
  sort_order: 0,
  config: { question: 'Q?', options: ['A', 'B'], correctIndex: 0 },
  form_type: null,
  scenario_id: null,
}

describe('TrainingExercise', () => {
  it('renders exercise title', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={0} />)
    expect(screen.getByText('Test Exercise')).toBeTruthy()
  })

  it('renders exercise instructions', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={0} />)
    expect(screen.getByText('Do the thing')).toBeTruthy()
  })

  it('renders exercise type badge', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={0} />)
    expect(screen.getByText('Quiz')).toBeTruthy()
  })

  it('renders estimated time', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={0} />)
    expect(screen.getByText(/10 min/)).toBeTruthy()
  })

  it('renders padded index number', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={0} />)
    expect(screen.getByText('01')).toBeTruthy()
  })

  it('renders index 10 correctly', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={9} />)
    expect(screen.getByText('10')).toBeTruthy()
  })

  it('has data-testid with index', () => {
    render(<TrainingExercise exercise={BASE_EXERCISE} pathId="path-1" index={2} />)
    expect(screen.getByTestId('exercise-2')).toBeTruthy()
  })

  it('renders fill-form type with Open Form button', () => {
    const exercise = { ...BASE_EXERCISE, type: 'fill-form' as const, config: {} }
    render(<TrainingExercise exercise={exercise} pathId="path-1" index={0} />)
    expect(screen.getByText('Open Form')).toBeTruthy()
    expect(screen.getByText('Form Practice')).toBeTruthy()
  })

  it('renders scenario-practice type with Start Scenario button', () => {
    const exercise = {
      ...BASE_EXERCISE,
      type: 'scenario-practice' as const,
      config: { scenarioSlug: 'test-scenario' },
    }
    render(<TrainingExercise exercise={exercise} pathId="path-1" index={0} />)
    expect(screen.getByText('Start Scenario')).toBeTruthy()
    expect(screen.getByText('Practice Scenario')).toBeTruthy()
  })

  it('renders reflection type badge', () => {
    const exercise = {
      ...BASE_EXERCISE,
      type: 'reflection' as const,
      config: { prompt: 'Think about it' },
    }
    render(<TrainingExercise exercise={exercise} pathId="path-1" index={0} />)
    expect(screen.getByText('Reflection')).toBeTruthy()
  })

  it('shows completed state with exerciseData', () => {
    const exerciseData = {
      id: 'ed-1',
      exercise_id: 'ex-1',
      status: 'completed' as const,
      data: { selectedIndex: 0 },
      score: 100,
      time_spent_seconds: 30,
      attempts: 1,
      last_attempt_at: '2026-01-01T00:00:00Z',
    }
    render(
      <TrainingExercise
        exercise={BASE_EXERCISE}
        exerciseData={exerciseData}
        pathId="path-1"
        index={0}
      />,
    )
    // Card should have emerald border class for completed state
    const card = screen.getByTestId('exercise-0')
    expect(card.className).toContain('emerald')
  })
})
