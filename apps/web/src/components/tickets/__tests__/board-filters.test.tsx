import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardFilters } from '../board-filters'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))

const MEMBERS = [
  { user_id: 'u-1', display_name: 'Alice' },
  { user_id: 'u-2', display_name: 'Bob' },
]

const PROJECTS = [
  { id: 'p-1', name: 'Safety Improvement' },
  { id: 'p-2', name: 'Process Optimization' },
]

describe('BoardFilters', () => {
  it('renders Project filter trigger', () => {
    render(<BoardFilters members={MEMBERS} projects={PROJECTS} />)
    expect(screen.getByText('Project')).toBeTruthy()
  })

  it('renders Priority filter trigger', () => {
    render(<BoardFilters members={MEMBERS} projects={PROJECTS} />)
    expect(screen.getByText('Priority')).toBeTruthy()
  })

  it('renders Assignee filter trigger', () => {
    render(<BoardFilters members={MEMBERS} projects={PROJECTS} />)
    expect(screen.getByText('Assignee')).toBeTruthy()
  })

  it('does not show Clear button when no filters active', () => {
    render(<BoardFilters members={MEMBERS} projects={PROJECTS} />)
    expect(screen.queryByText('Clear')).toBeNull()
  })

  it('renders filter container', () => {
    const { container } = render(<BoardFilters members={MEMBERS} projects={PROJECTS} />)
    expect(container.firstElementChild?.className).toContain('flex')
  })
})
