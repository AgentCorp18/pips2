import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeightedVotingForm } from '../weighted-voting-form'

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

describe('WeightedVotingForm', () => {
  it('renders without crashing', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(document.body).toBeTruthy()
  })

  it('displays the form title', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Weighted Voting')).toBeTruthy()
  })

  it('renders Total votes per person label', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Total votes per person')).toBeTruthy()
  })

  it('renders default total votes value of 5', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    const input = screen.getByLabelText('Total votes per person') as HTMLInputElement
    expect(input.value).toBe('5')
  })

  it('renders Add an option label', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Add an option')).toBeTruthy()
  })

  it('renders Add a voter label', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Add a voter')).toBeTruthy()
  })

  it('renders option and voter input placeholders', () => {
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByPlaceholderText('Option text...')).toBeTruthy()
    expect(screen.getByPlaceholderText('Voter name...')).toBeTruthy()
  })

  it('handles view mode with initial data', () => {
    const initialData = {
      totalVotesPerPerson: 5,
      options: [
        { id: 'opt-1', text: 'Solution A', votes: 3 },
        { id: 'opt-2', text: 'Solution B', votes: 2 },
      ],
      voters: [
        {
          id: 'voter-1',
          name: 'Alice',
          allocations: { 'opt-1': 3, 'opt-2': 2 },
        },
      ],
    }
    render(<WeightedVotingForm projectId="p-1" stepNumber={1} initialData={initialData} />)
    // Option text appears in both the option list and the results summary
    expect(screen.getAllByText('Solution A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Solution B').length).toBeGreaterThan(0)
  })
})
