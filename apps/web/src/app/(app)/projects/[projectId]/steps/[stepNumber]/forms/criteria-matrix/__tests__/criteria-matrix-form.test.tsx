import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CriteriaMatrixForm } from '../criteria-matrix-form'

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

vi.mock('../actions', () => ({
  saveFormData: vi.fn().mockResolvedValue({ success: true }),
}))

describe('CriteriaMatrixForm', () => {
  it('renders Criteria Matrix title', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Criteria Matrix')).toBeTruthy()
  })

  it('renders description', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Score and rank solutions/)).toBeTruthy()
  })

  it('renders coaching prompt', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Add your evaluation criteria/)).toBeTruthy()
  })

  it('renders table headers', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Criteria')).toBeTruthy()
    expect(screen.getByText('Weight')).toBeTruthy()
  })

  it('renders Weighted Total row', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Weighted Total')).toBeTruthy()
  })

  it('renders Add Criteria button', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Criteria')).toBeTruthy()
  })

  it('renders Add Solution button', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Solution')).toBeTruthy()
  })

  it('renders score buttons (1-5)', () => {
    render(<CriteriaMatrixForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })
})
