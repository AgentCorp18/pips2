import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeCards } from '../welcome-cards'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode
    href: string
    onClick?: () => void
    [key: string]: unknown
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}))

const mockDismiss = vi.fn()
const mockCompleteStep = vi.fn()
const mockIsStepComplete = vi.fn().mockReturnValue(false)

vi.mock('@/hooks/use-onboarding-progress', () => ({
  useOnboardingProgress: () => ({
    completedSteps: [],
    isStepComplete: mockIsStepComplete,
    completeStep: mockCompleteStep,
    dismiss: mockDismiss,
    allComplete: false,
    dismissed: false,
  }),
}))

describe('WelcomeCards', () => {
  it('renders the welcome-cards container', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('welcome-cards')).toBeTruthy()
  })

  it('renders the heading', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('welcome-cards-heading')).toBeTruthy()
    expect(screen.getByText('Your first 30 minutes with PIPS')).toBeTruthy()
  })

  it('renders description text', () => {
    render(<WelcomeCards />)
    expect(screen.getByText(/Complete these steps to get the most/)).toBeTruthy()
  })

  it('renders all four onboarding steps', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('onboarding-step-read-overview')).toBeTruthy()
    expect(screen.getByTestId('onboarding-step-explore-sample')).toBeTruthy()
    expect(screen.getByTestId('onboarding-step-create-project')).toBeTruthy()
    expect(screen.getByTestId('onboarding-step-invite-member')).toBeTruthy()
  })

  it('shows the first step as active with a Go button', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('onboarding-action-read-overview')).toBeTruthy()
    expect(screen.getByTestId('onboarding-action-read-overview').getAttribute('href')).toBe(
      '/knowledge/guide/getting-started',
    )
  })

  it('shows progress counter', () => {
    render(<WelcomeCards />)
    expect(screen.getByText('0/4')).toBeTruthy()
  })

  it('renders dismiss button', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('dismiss-onboarding')).toBeTruthy()
  })

  it('calls dismiss when dismiss button is clicked', () => {
    render(<WelcomeCards />)
    fireEvent.click(screen.getByTestId('dismiss-onboarding'))
    expect(mockDismiss).toHaveBeenCalled()
  })
})
