import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ParetoForm } from '../pareto-form'

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

describe('ParetoForm', () => {
  it('renders without crashing', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(document.body).toBeTruthy()
  })

  it('renders Pareto Analysis title', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText('Pareto Analysis')).toBeTruthy()
  })

  it('renders description', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText(/80\/20 principle/)).toBeTruthy()
  })

  it('renders Analysis Title field', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText('Analysis Title')).toBeTruthy()
  })

  it('renders Categories section', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText('Categories')).toBeTruthy()
  })

  it('renders Add Category button', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText('Add Category')).toBeTruthy()
  })

  it('renders Notes field', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText('Notes')).toBeTruthy()
  })

  it('handles view mode with initial data', () => {
    const initialData = {
      title: 'Q1 Defects',
      categories: [
        { id: 'cat1', name: 'Missing parts', count: 50, percentage: 50, cumulative: 50 },
        { id: 'cat2', name: 'Late delivery', count: 30, percentage: 30, cumulative: 80 },
        { id: 'cat3', name: 'Wrong item', count: 20, percentage: 20, cumulative: 100 },
      ],
      eightyTwentyLine: '',
      notes: 'Focus on top 2 categories',
    }
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={initialData} />)
    expect(screen.getByText('Pareto Analysis')).toBeTruthy()
  })

  it('shows column headers for count, percentage, and cumulative', () => {
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={null} />)
    expect(screen.getByText('Count')).toBeTruthy()
    expect(screen.getByText('%')).toBeTruthy()
    expect(screen.getByText('Cumulative')).toBeTruthy()
  })

  it('calculates and shows 80/20 note when categories have counts', () => {
    const initialData = {
      title: 'Test',
      categories: [
        { id: 'cat1', name: 'Big issue', count: 80, percentage: 80, cumulative: 80 },
        { id: 'cat2', name: 'Small issue', count: 20, percentage: 20, cumulative: 100 },
      ],
      eightyTwentyLine: '',
      notes: '',
    }
    render(<ParetoForm projectId="p-1" stepNumber={2} initialData={initialData} />)
    expect(screen.getByText('Vital Few — 80% Rule')).toBeTruthy()
  })
})
