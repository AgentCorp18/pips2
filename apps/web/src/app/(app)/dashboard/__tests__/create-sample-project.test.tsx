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
    expect(screen.getByText(/pre-filled project/)).toBeTruthy()
  })

  it('renders template buttons for all 3 templates', () => {
    render(<CreateSampleProject />)
    expect(screen.getByTestId('sample-project-parking-lot-safety')).toBeTruthy()
    expect(screen.getByTestId('sample-project-customer-onboarding')).toBeTruthy()
    expect(screen.getByTestId('sample-project-employee-turnover')).toBeTruthy()
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
})
