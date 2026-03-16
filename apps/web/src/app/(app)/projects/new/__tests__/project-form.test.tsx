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

vi.mock('../../../dashboard/sample-project-action', () => ({
  createSampleProject: vi.fn().mockResolvedValue({ projectId: 'test-123' }),
}))

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    name,
    id,
    value,
    onChange,
    disabled,
  }: {
    name: string
    id?: string
    value?: string
    onChange?: (val: string) => void
    disabled?: boolean
  }) => (
    <input
      type="date"
      id={id}
      name={name}
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
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
    expect(screen.getByLabelText(/^Project name/)).toBeTruthy()
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
    const input = screen.getByLabelText(/^Project name/)
    expect(input.getAttribute('placeholder')).toContain('Reduce onboarding')
  })

  it('name input is required', () => {
    render(<ProjectForm />)
    const input = screen.getByLabelText(/^Project name/)
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

  it('shows target date in review summary when a date is selected', () => {
    const { container } = render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    // The mock DatePicker renders as <input type="date" name="target_completion_date">
    // We use container.querySelector to target the visible date input (not the hidden one)
    const dateInput = container.querySelector(
      'input[name="target_completion_date"][type="date"]',
    ) as HTMLInputElement
    expect(dateInput).toBeTruthy()
    fireEvent.change(dateInput, { target: { value: '2027-01-01' } })
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByTestId('review-target-date')).toHaveTextContent('2027-01-01')
  })

  it('includes target_completion_date hidden input on all steps', () => {
    const { container } = render(<ProjectForm />)
    const nameInput = screen.getByTestId('project-name-input')
    fireEvent.change(nameInput, { target: { value: 'Test Project' } })
    // Step 1 — hidden input should be present
    const hiddenInput = container.querySelector(
      'input[name="target_completion_date"][type="hidden"]',
    )
    expect(hiddenInput).toBeTruthy()
    // Move to step 3 — hidden input should still be present
    fireEvent.click(screen.getByTestId('step-next-button'))
    fireEvent.click(screen.getByTestId('step-next-button'))
    const hiddenInputOnStep3 = container.querySelector(
      'input[name="target_completion_date"][type="hidden"]',
    )
    expect(hiddenInputOnStep3).toBeTruthy()
  })

  it('renders mode toggle with blank and template options', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('create-mode-toggle')).toBeTruthy()
    expect(screen.getByTestId('mode-blank')).toBeTruthy()
    expect(screen.getByTestId('mode-template')).toBeTruthy()
  })

  it('defaults to blank mode with stepper visible', () => {
    render(<ProjectForm />)
    expect(screen.getByTestId('stepper')).toBeTruthy()
    expect(screen.queryByTestId('template-picker')).toBeNull()
  })

  it('switches to template mode when template toggle is clicked', () => {
    render(<ProjectForm />)
    fireEvent.click(screen.getByTestId('mode-template'))
    expect(screen.getByTestId('template-picker')).toBeTruthy()
    expect(screen.queryByTestId('stepper')).toBeNull()
  })

  it('shows template cards in template mode', () => {
    render(<ProjectForm />)
    fireEvent.click(screen.getByTestId('mode-template'))
    expect(screen.getByTestId('template-parking-lot-safety')).toBeTruthy()
  })

  it('switches back to blank mode', () => {
    render(<ProjectForm />)
    fireEvent.click(screen.getByTestId('mode-template'))
    expect(screen.getByTestId('template-picker')).toBeTruthy()
    fireEvent.click(screen.getByTestId('mode-blank'))
    expect(screen.getByTestId('stepper')).toBeTruthy()
    expect(screen.queryByTestId('template-picker')).toBeNull()
  })
})
