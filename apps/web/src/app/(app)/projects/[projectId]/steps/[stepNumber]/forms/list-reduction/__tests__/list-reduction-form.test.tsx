import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ListReductionForm } from '../list-reduction-form'

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

describe('ListReductionForm', () => {
  it('renders without crashing', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(document.body).toBeTruthy()
  })

  it('displays the form title', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('List Reduction')).toBeTruthy()
  })

  it('renders Add an item label', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Add an item')).toBeTruthy()
  })

  it('renders item input placeholder', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByPlaceholderText('Type item text...')).toBeTruthy()
  })

  it('renders Add button', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Add')).toBeTruthy()
  })

  it('renders stats with zero counts in edit mode', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Total: 0')).toBeTruthy()
    expect(screen.getByText('Kept: 0')).toBeTruthy()
    expect(screen.getByText('Eliminated: 0')).toBeTruthy()
  })

  it('handles view mode with initial data', () => {
    const initialData = {
      criteria: 'Must be low cost',
      items: [
        { id: 'item-1', text: 'Option A', kept: true, reason: '' },
        { id: 'item-2', text: 'Option B', kept: false, reason: 'Too expensive' },
      ],
      finalList: ['Option A'],
    }
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={initialData} />)
    // 'Option A' is kept so it appears in both the item list and the Final List section
    expect(screen.getAllByText('Option A').length).toBeGreaterThan(0)
    expect(screen.getByText('Option B')).toBeTruthy()
  })

  it('renders Elimination Criteria label', () => {
    render(<ListReductionForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Elimination Criteria')).toBeTruthy()
  })
})
