import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FiveWhyForm } from '../five-why-form'

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
    helperText?: string
    rows?: number
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

describe('FiveWhyForm', () => {
  it('renders 5 Why Analysis title', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('5 Why Analysis')).toBeTruthy()
  })

  it('renders description', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText(/Drill down to the root cause/)).toBeTruthy()
  })

  it('renders 5 Why cards by default', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Why #1')).toBeTruthy()
    expect(screen.getByText('Why #5')).toBeTruthy()
  })

  it('renders Root Cause Conclusion field', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Root Cause Conclusion')).toBeTruthy()
  })

  it('renders Add another Why button', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Add another Why')).toBeTruthy()
  })

  it('adds a 6th Why on button click', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.queryByText('Why #6')).toBeNull()
    fireEvent.click(screen.getByText('Add another Why'))
    expect(screen.getByText('Why #6')).toBeTruthy()
  })

  it('shows problem statement when provided', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1="High defect rate"
      />,
    )
    expect(screen.getByText('Problem Statement')).toBeTruthy()
    expect(screen.getByText('High defect rate')).toBeTruthy()
  })

  it('renders Question and Answer labels for each why', () => {
    render(
      <FiveWhyForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    const questionLabels = screen.getAllByText('Question')
    const answerLabels = screen.getAllByText('Answer')
    expect(questionLabels.length).toBe(5)
    expect(answerLabels.length).toBe(5)
  })
})
