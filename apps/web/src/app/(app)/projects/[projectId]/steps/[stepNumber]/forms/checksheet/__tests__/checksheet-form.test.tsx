import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChecksheetForm } from '../checksheet-form'

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

describe('ChecksheetForm', () => {
  it('renders Check Sheet title', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Check Sheet')).toBeTruthy()
  })

  it('renders description', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText(/structured tally sheet/)).toBeTruthy()
  })

  it('renders Title label', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Title')).toBeTruthy()
  })

  it('renders Categories heading', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Categories (Rows)')).toBeTruthy()
  })

  it('renders Time Periods heading', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Time Periods (Columns)')).toBeTruthy()
  })

  it('renders Add Category button', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Add Category')).toBeTruthy()
  })

  it('renders Add Time Period button', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Add Time Period')).toBeTruthy()
  })

  it('renders Notes field', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Notes')).toBeTruthy()
  })

  it('renders empty state when no categories or time periods', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText(/Add at least one category/)).toBeTruthy()
  })

  it('shows problem statement when provided', () => {
    render(
      <ChecksheetForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1="Delivery delays"
      />,
    )
    expect(screen.getByText('Problem Statement')).toBeTruthy()
    expect(screen.getByText('Delivery delays')).toBeTruthy()
  })
})
