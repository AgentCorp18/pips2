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
    expect(screen.getByText(/Parking Lot Safety Improvement/)).toBeTruthy()
  })

  it('renders Try a Sample Project button', () => {
    render(<CreateSampleProject />)
    expect(screen.getByText('Try a Sample Project')).toBeTruthy()
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
