import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImplementationPlanForm } from '../implementation-plan-form'

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

describe('ImplementationPlanForm', () => {
  it('renders Implementation Plan title', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Implementation Plan')).toBeTruthy()
  })

  it('renders description', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Create a detailed plan with tasks/)).toBeTruthy()
  })

  it('renders Selected Solution label', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Selected Solution')).toBeTruthy()
  })

  it('renders Tasks label', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Tasks')).toBeTruthy()
  })

  it('renders Add Task button', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Task')).toBeTruthy()
  })

  it('renders Timeline, Resources, Budget labels', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Timeline')).toBeTruthy()
    expect(screen.getByText('Resources Needed')).toBeTruthy()
    expect(screen.getByText('Budget')).toBeTruthy()
  })

  it('renders Risks & Mitigation label', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Risks & Mitigation')).toBeTruthy()
  })

  it('renders Add Risk button', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Risk')).toBeTruthy()
  })

  it('renders empty state for tasks', () => {
    render(<ImplementationPlanForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/No tasks yet/)).toBeTruthy()
  })
})
