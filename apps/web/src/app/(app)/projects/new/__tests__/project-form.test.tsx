import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectForm } from '../project-form'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../actions', () => ({
  createProject: vi.fn(),
}))

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: (props: Record<string, unknown>) => <input type="date" {...props} />,
}))

describe('ProjectForm', () => {
  it('renders Create a new project heading', () => {
    render(<ProjectForm />)
    expect(screen.getByText('Create a new project')).toBeTruthy()
  })

  it('renders description text', () => {
    render(<ProjectForm />)
    expect(screen.getByText(/Start a PIPS improvement cycle/)).toBeTruthy()
  })

  it('renders Project name label', () => {
    render(<ProjectForm />)
    expect(screen.getByLabelText('Project name *')).toBeTruthy()
  })

  it('renders Description label', () => {
    render(<ProjectForm />)
    expect(screen.getByLabelText('Description')).toBeTruthy()
  })

  it('renders Target completion date label', () => {
    render(<ProjectForm />)
    expect(screen.getByText('Target completion date')).toBeTruthy()
  })

  it('renders Create project submit button', () => {
    render(<ProjectForm />)
    expect(screen.getByText('Create project')).toBeTruthy()
  })

  it('submit button is inside a form', () => {
    render(<ProjectForm />)
    const button = screen.getByText('Create project')
    expect(button.closest('form')).toBeTruthy()
  })

  it('name input has placeholder', () => {
    render(<ProjectForm />)
    const input = screen.getByLabelText('Project name *')
    expect(input.getAttribute('placeholder')).toContain('Reduce onboarding')
  })

  it('name input is required', () => {
    render(<ProjectForm />)
    const input = screen.getByLabelText('Project name *')
    expect(input.getAttribute('aria-required')).toBe('true')
  })
})
