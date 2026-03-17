import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepPageClient } from '../step-page-client'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../../actions', () => ({
  advanceStep: vi.fn().mockResolvedValue({ success: true }),
  overrideStep: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@pips/shared', () => ({
  STEP_CONTENT: {
    1: {
      title: 'Identify',
      objective: 'Define a clear problem statement.',
      prompts: ['What is the current state?'],
      forms: [
        {
          type: 'problem_statement',
          name: 'Problem Statement',
          description: 'Define the problem',
          required: true,
        },
      ],
      completionCriteria: ['Problem defined'],
      methodology: { tips: [], bestPractices: [], facilitationGuide: '' },
    },
  },
  buildProductContext: vi.fn().mockReturnValue({ stepNumber: 1 }),
  hasPermission: (_role: string, _perm: string) => true,
}))

vi.mock('@/components/pips/step-view', () => ({
  StepView: ({
    stepNumber,
    status,
    canAdvance,
    canOverride,
  }: {
    stepNumber: number
    status: string
    canAdvance: boolean
    canOverride: boolean
  }) => (
    <div data-testid="step-view">
      <span>Step {stepNumber}</span>
      <span>Status: {status}</span>
      <span>canAdvance: {String(canAdvance)}</span>
      <span>canOverride: {String(canOverride)}</span>
    </div>
  ),
}))

describe('StepPageClient', () => {
  it('renders StepView', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByTestId('step-view')).toBeTruthy()
  })

  it('passes step number', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByText('Step 1')).toBeTruthy()
  })

  it('passes status', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByText('Status: in_progress')).toBeTruthy()
  })

  it('sets canAdvance=true when current step and not completed', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByText('canAdvance: true')).toBeTruthy()
  })

  it('sets canAdvance=false when not current step', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={2}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByText('canAdvance: false')).toBeTruthy()
  })

  it('sets canAdvance=false when completed', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="completed"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByText('canAdvance: false')).toBeTruthy()
  })

  it('sets canOverride=true when admin on current step', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByText('canOverride: true')).toBeTruthy()
  })

  it('sets canOverride=false when orgRole is null', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole={null}
      />,
    )
    expect(screen.getByText('canOverride: false')).toBeTruthy()
  })

  /* ---- Step navigation buttons ---- */

  it('renders next-step-nav button on step 1', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByTestId('next-step-nav')).toBeTruthy()
  })

  it('does not render prev-step-nav button on step 1 (first step boundary)', () => {
    render(
      <StepPageClient
        projectId="p-1"
        stepNumber={1}
        stepStatus="in_progress"
        currentStep={1}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.queryByTestId('prev-step-nav')).toBeNull()
  })

  it('renders prev-step-nav button on step 6', () => {
    render(
      <StepPageClient
        projectId="p-6"
        stepNumber={6}
        stepStatus="in_progress"
        currentStep={6}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByTestId('prev-step-nav')).toBeTruthy()
  })

  it('does not render next-step-nav button on step 6 (last step boundary)', () => {
    render(
      <StepPageClient
        projectId="p-6"
        stepNumber={6}
        stepStatus="in_progress"
        currentStep={6}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.queryByTestId('next-step-nav')).toBeNull()
  })

  it('renders both prev-step-nav and next-step-nav on a middle step', () => {
    render(
      <StepPageClient
        projectId="p-3"
        stepNumber={3}
        stepStatus="in_progress"
        currentStep={3}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByTestId('prev-step-nav')).toBeTruthy()
    expect(screen.getByTestId('next-step-nav')).toBeTruthy()
  })

  it('next-step-nav links to correct step URL', () => {
    render(
      <StepPageClient
        projectId="p-3"
        stepNumber={3}
        stepStatus="in_progress"
        currentStep={3}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    // When Button uses asChild with Link, the rendered element is an <a> tag
    const nextNav = screen.getByTestId('next-step-nav')
    expect(nextNav.getAttribute('href')).toBe('/projects/p-3/steps/4')
  })

  it('prev-step-nav links to correct step URL', () => {
    render(
      <StepPageClient
        projectId="p-3"
        stepNumber={3}
        stepStatus="in_progress"
        currentStep={3}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    // When Button uses asChild with Link, the rendered element is an <a> tag
    const prevNav = screen.getByTestId('prev-step-nav')
    expect(prevNav.getAttribute('href')).toBe('/projects/p-3/steps/2')
  })

  it('next-step-nav shows correct step name', () => {
    render(
      <StepPageClient
        projectId="p-3"
        stepNumber={3}
        stepStatus="in_progress"
        currentStep={3}
        formStatuses={[]}
        orgRole="admin"
      />,
    )
    expect(screen.getByTestId('next-step-nav')).toBeTruthy()
    // Step 4 is "Select & Plan"
    expect(screen.getByText(/Select & Plan/)).toBeTruthy()
  })
})
