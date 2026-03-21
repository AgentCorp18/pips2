import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OnboardingForm } from '../onboarding-form'

vi.mock('../actions', () => ({
  createOrganization: vi.fn(),
  checkSlugAvailability: vi.fn().mockResolvedValue({ available: true }),
}))

// Mock useActionState to return initial state
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useActionState: (_action: unknown, initialState: { error?: string }) => [
      initialState,
      vi.fn(),
      false,
    ],
  }
})

describe('OnboardingForm', () => {
  it('renders card title', () => {
    render(<OnboardingForm />)
    expect(screen.getByText('Create your organization')).toBeTruthy()
  })

  it('renders card description', () => {
    render(<OnboardingForm />)
    expect(screen.getByText(/Set up your workspace to start improving processes/)).toBeTruthy()
  })

  it('renders Organization name label', () => {
    render(<OnboardingForm />)
    expect(screen.getByText('Organization name *')).toBeTruthy()
  })

  it('renders URL slug label', () => {
    render(<OnboardingForm />)
    expect(screen.getByText('URL slug *')).toBeTruthy()
  })

  it('renders pips-app.vercel.app/ prefix', () => {
    render(<OnboardingForm />)
    expect(screen.getByText('pips-app.vercel.app/')).toBeTruthy()
  })

  it('renders name input with placeholder', () => {
    render(<OnboardingForm />)
    expect(screen.getByPlaceholderText('Acme Corporation')).toBeTruthy()
  })

  it('renders slug input with placeholder', () => {
    render(<OnboardingForm />)
    expect(screen.getByPlaceholderText('acme-corp')).toBeTruthy()
  })

  it('renders submit button', () => {
    render(<OnboardingForm />)
    expect(screen.getByText('Create organization')).toBeTruthy()
  })

  it('renders pip dots for step indicator', () => {
    const { container } = render(<OnboardingForm />)
    const dots = container.querySelectorAll('.pip-dot')
    expect(dots.length).toBe(6)
  })
})
