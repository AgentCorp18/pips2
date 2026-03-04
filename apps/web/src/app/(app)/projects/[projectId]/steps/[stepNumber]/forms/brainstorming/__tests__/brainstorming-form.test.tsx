import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrainstormingForm } from '../brainstorming-form'

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

describe('BrainstormingForm', () => {
  it('renders Brainstorming title', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Brainstorming')).toBeTruthy()
  })

  it('renders description', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText(/Generate as many ideas as possible/)).toBeTruthy()
  })

  it('renders Add a new idea label', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Add a new idea')).toBeTruthy()
  })

  it('renders idea input placeholder', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByPlaceholderText('Type your idea here...')).toBeTruthy()
  })

  it('renders author input placeholder', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByPlaceholderText('Author (optional)')).toBeTruthy()
  })

  it('renders Add button', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Add')).toBeTruthy()
  })

  it('renders stats with zero counts', () => {
    render(<BrainstormingForm projectId="p-1" stepNumber={3} initialData={null} />)
    expect(screen.getByText('Total: 0')).toBeTruthy()
    expect(screen.getByText('Active: 0')).toBeTruthy()
    expect(screen.getByText('Selected: 0')).toBeTruthy()
    expect(screen.getByText('Eliminated: 0')).toBeTruthy()
  })
})
