import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MilestoneTrackerForm } from '../milestone-tracker-form'

vi.mock('@/components/pips/form-shell', () => ({
  FormShell: ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode
    title: string
    description: string
  }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  ),
}))

vi.mock('../actions', () => ({
  saveFormData: vi.fn().mockResolvedValue({ success: true }),
}))

describe('MilestoneTrackerForm', () => {
  it('renders Milestone Tracker title', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Milestone Tracker')).toBeTruthy()
  })

  it('renders description', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Track progress against planned milestones/)).toBeTruthy()
  })

  it('renders Overall Progress label', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Overall Progress')).toBeTruthy()
  })

  it('renders 0% initial progress', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('renders milestones completed count', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/0 of 0 milestones completed/)).toBeTruthy()
  })

  it('renders Add Milestone button', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Milestone')).toBeTruthy()
  })

  it('renders coaching text', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Add milestones with target dates/)).toBeTruthy()
  })

  it('renders empty state when no milestones', () => {
    render(<MilestoneTrackerForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/No milestones yet/)).toBeTruthy()
  })
})
