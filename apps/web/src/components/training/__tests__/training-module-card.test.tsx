import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrainingModuleCard } from '../training-module-card'
import type { TrainingModuleRow } from '@/app/(app)/training/actions'

const mockModule: TrainingModuleRow = {
  id: 'mod-qs-1',
  path_id: 'path-quick-start',
  title: 'What Is PIPS?',
  description: 'A 15-minute overview of the six-step cycle.',
  estimated_minutes: 15,
  sort_order: 1,
  content_node_ids: [],
  prerequisites: [],
}

describe('TrainingModuleCard', () => {
  it('renders module title and description', () => {
    render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="not_started"
        isLocked={false}
        pathId="path-quick-start"
      />,
    )
    expect(screen.getByText('What Is PIPS?')).toBeTruthy()
    expect(screen.getByText('A 15-minute overview of the six-step cycle.')).toBeTruthy()
  })

  it('shows estimated time', () => {
    render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="not_started"
        isLocked={false}
        pathId="path-quick-start"
      />,
    )
    expect(screen.getByText('15 min')).toBeTruthy()
  })

  it('shows zero-padded index number', () => {
    render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="not_started"
        isLocked={false}
        pathId="path-quick-start"
      />,
    )
    expect(screen.getByText('01')).toBeTruthy()
  })

  it('shows In Progress badge when in progress', () => {
    render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="in_progress"
        isLocked={false}
        pathId="path-quick-start"
      />,
    )
    expect(screen.getByText('In Progress')).toBeTruthy()
  })

  it('shows Complete badge when completed', () => {
    render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="completed"
        isLocked={false}
        pathId="path-quick-start"
      />,
    )
    expect(screen.getByText('Complete')).toBeTruthy()
  })

  it('shows Locked badge when locked', () => {
    render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="not_started"
        isLocked={true}
        pathId="path-quick-start"
      />,
    )
    expect(screen.getByText('Locked')).toBeTruthy()
  })

  it('renders as a link when not locked', () => {
    const { container } = render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="not_started"
        isLocked={false}
        pathId="path-quick-start"
      />,
    )
    const link = container.querySelector('a[href="/training/path/path-quick-start/mod-qs-1"]')
    expect(link).toBeTruthy()
  })

  it('does not render as a link when locked', () => {
    const { container } = render(
      <TrainingModuleCard
        module={mockModule}
        index={0}
        status="not_started"
        isLocked={true}
        pathId="path-quick-start"
      />,
    )
    const link = container.querySelector('a')
    expect(link).toBeNull()
  })
})
