import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrainwritingForm } from '../brainwriting-form'

vi.mock('@/components/pips/form-shell', () => ({
  FormShell: ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode
    title: string
    description: string
  }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  ),
}))

describe('BrainwritingForm', () => {
  it('renders Brainwriting title', () => {
    render(<BrainwritingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Brainwriting (6-3-5)')).toBeTruthy()
  })

  it('renders description', () => {
    render(<BrainwritingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText(/Silent written idea generation/)).toBeTruthy()
  })

  it('renders 6-3-5 explanation', () => {
    render(<BrainwritingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText(/6 participants each write 3 ideas/)).toBeTruthy()
  })

  it('renders Add Round button', () => {
    render(<BrainwritingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Add Round')).toBeTruthy()
  })

  it('starts with no rounds', () => {
    render(<BrainwritingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.queryByText('Round 1')).toBeNull()
  })

  it('does not show All Ideas section when empty', () => {
    render(<BrainwritingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.queryByText(/All Ideas/)).toBeNull()
  })
})
