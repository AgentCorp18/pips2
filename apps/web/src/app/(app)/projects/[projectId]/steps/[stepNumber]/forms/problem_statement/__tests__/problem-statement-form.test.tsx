import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProblemStatementForm } from '../problem-statement-form'

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

vi.mock('@/components/pips/form-textarea', () => ({
  FormTextarea: ({
    id,
    label,
    value,
    onChange,
    placeholder,
  }: {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),
}))

describe('ProblemStatementForm', () => {
  it('renders Problem Statement title', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    const matches = screen.getAllByText('Problem Statement')
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders description', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText(/Define the current state/)).toBeTruthy()
  })

  it('renders Current State field', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Current State (As-Is)')).toBeTruthy()
  })

  it('renders Desired State field', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Desired State')).toBeTruthy()
  })

  it('renders Gap Analysis field', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Gap Analysis')).toBeTruthy()
  })

  it('renders Problem Area label', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Problem Area')).toBeTruthy()
  })

  it('renders Team Members label', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Team Members')).toBeTruthy()
  })

  it('renders Data Sources label', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Data Sources')).toBeTruthy()
  })

  it('renders textarea fields with placeholders', () => {
    render(<ProblemStatementForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByPlaceholderText(/Describe how things work today/)).toBeTruthy()
    expect(screen.getByPlaceholderText(/Describe what success looks like/)).toBeTruthy()
  })
})
