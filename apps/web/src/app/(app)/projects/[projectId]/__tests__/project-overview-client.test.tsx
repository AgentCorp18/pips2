import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectOverviewClient } from '../project-overview-client'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/components/pips/step-stepper', () => ({
  StepStepper: ({
    steps,
    currentStep,
    onStepClick,
  }: {
    steps: Array<{ number: number; name: string; status: string }>
    currentStep: number
    onStepClick: (n: number) => void
  }) => (
    <div data-testid="step-stepper">
      <span>Current: {currentStep}</span>
      {steps.map((s) => (
        <button key={s.number} onClick={() => onStepClick(s.number)}>
          {s.name}
        </button>
      ))}
    </div>
  ),
}))

const mockSteps = [
  {
    number: 1,
    name: 'Identify',
    status: 'completed' as const,
    completedAt: null,
    formCount: 2,
    completedForms: 2,
  },
  {
    number: 2,
    name: 'Analyze',
    status: 'in_progress' as const,
    completedAt: null,
    formCount: 3,
    completedForms: 1,
  },
]

describe('ProjectOverviewClient', () => {
  it('renders StepStepper', () => {
    render(
      <ProjectOverviewClient projectId="p-1" currentStep={1} steps={mockSteps} orgRole="admin" />,
    )
    expect(screen.getByTestId('step-stepper')).toBeTruthy()
  })

  it('passes currentStep to StepStepper', () => {
    render(
      <ProjectOverviewClient projectId="p-1" currentStep={1} steps={mockSteps} orgRole="admin" />,
    )
    expect(screen.getByText('Current: 1')).toBeTruthy()
  })

  it('renders step names', () => {
    render(
      <ProjectOverviewClient projectId="p-1" currentStep={1} steps={mockSteps} orgRole="admin" />,
    )
    expect(screen.getByText('Identify')).toBeTruthy()
    expect(screen.getByText('Analyze')).toBeTruthy()
  })

  it('navigates on step click', async () => {
    const { getByText } = render(
      <ProjectOverviewClient projectId="p-1" currentStep={1} steps={mockSteps} orgRole="admin" />,
    )
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(getByText('Identify'))
    expect(mockPush).toHaveBeenCalledWith('/projects/p-1/steps/1')
  })

  it('renders with null orgRole', () => {
    render(
      <ProjectOverviewClient projectId="p-1" currentStep={2} steps={mockSteps} orgRole={null} />,
    )
    expect(screen.getByText('Current: 2')).toBeTruthy()
  })
})
