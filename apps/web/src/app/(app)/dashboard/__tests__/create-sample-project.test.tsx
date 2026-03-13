import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreateSampleProject } from '../create-sample-project'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../sample-project-action', () => ({
  createSampleProject: vi.fn().mockResolvedValue({ projectId: 'p-1' }),
}))

describe('CreateSampleProject', () => {
  it('renders heading text', () => {
    render(<CreateSampleProject />)
    expect(screen.getByText('New to PIPS? Try a sample project')).toBeTruthy()
  })

  it('renders description', () => {
    render(<CreateSampleProject />)
    expect(screen.getByText(/pre-filled projects/)).toBeTruthy()
  })

  it('renders the first 3 templates by default', () => {
    render(<CreateSampleProject />)
    expect(screen.getByTestId('sample-project-parking-lot-safety')).toBeTruthy()
    expect(screen.getByTestId('sample-project-customer-onboarding')).toBeTruthy()
    expect(screen.getByTestId('sample-project-manufacturing-defect')).toBeTruthy()
  })

  it('renders heading as h3', () => {
    render(<CreateSampleProject />)
    const heading = screen.getByText('New to PIPS? Try a sample project')
    expect(heading.tagName).toBe('H3')
  })

  it('has dashed border container', () => {
    const { container } = render(<CreateSampleProject />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('border-dashed')
  })

  it('shows step count for each visible template', () => {
    render(<CreateSampleProject />)
    // Each template card shows "X/6 steps"
    const stepLabels = screen.getAllByText(/\/6 steps/)
    expect(stepLabels.length).toBeGreaterThanOrEqual(3)
  })
})
