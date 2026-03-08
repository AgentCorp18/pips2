import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('renders stepper', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('stepper')).toBeTruthy()
  })

  it('renders all three stepper steps', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('stepper-step-1')).toBeTruthy()
    expect(screen.getByTestId('stepper-step-2')).toBeTruthy()
    expect(screen.getByTestId('stepper-step-3')).toBeTruthy()
  })

  it('renders tip box', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('step-tip')).toBeTruthy()
  })

  it('renders Project name label on step 1', () => {
    render(<ProjectForm />)
    expect(screen.getByLabelText('Project name *')).toBeTruthy()
  })

  it('renders Description label on step 1', () => {
    render(<ProjectForm />)
    expect(screen.getByLabelText('Description')).toBeTruthy()
  })

  it('renders Next button on step 1', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('step-next-button')).toBeTruthy()
  })

  it('Next button is disabled when name is empty', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('step-next-button')).toBeDisabled()
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

  it('navigates to step 2 when Next is clicked', () => {
    render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByText('Target completion date')).toBeTruthy()
  })

  it('renders Back button on step 2', () => {
    render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByTestId('step-back-button')).toBeTruthy()
  })

  it('navigates to step 3 with review summary', () => {
    render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByTestId('review-summary')).toBeTruthy()
    expect(screen.getByTestId('review-name')).toHaveTextContent('Test Project')
  })

  it('renders Create project button on step 3', () => {
    render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByTestId('create-project-button')).toBeTruthy()
    expect(screen.getByText('Create project')).toBeTruthy()
  })

  it('navigates back from step 3 to step 2', () => {
    render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    fireEvent.click(screen.getByTestId('step-next-button'))
    fireEvent.click(screen.getByTestId('step-back-button'))
    expect(screen.getByText('Target completion date')).toBeTruthy()
  })
})
