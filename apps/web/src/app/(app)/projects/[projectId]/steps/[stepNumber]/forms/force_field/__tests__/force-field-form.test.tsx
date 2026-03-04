import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ForceFieldForm } from '../force-field-form'

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

describe('ForceFieldForm', () => {
  it('renders Force Field Analysis title', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Force Field Analysis')).toBeTruthy()
  })

  it('renders description', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText(/Identify the forces driving change/)).toBeTruthy()
  })

  it('renders Driving Forces section', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Driving Forces')).toBeTruthy()
    expect(screen.getByText('Forces pushing toward change')).toBeTruthy()
  })

  it('renders Restraining Forces section', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Restraining Forces')).toBeTruthy()
    expect(screen.getByText('Forces resisting change')).toBeTruthy()
  })

  it('renders Add Force buttons', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    const addButtons = screen.getAllByText('Add Force')
    expect(addButtons.length).toBe(2)
  })

  it('renders balance indicator', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Driving: 0')).toBeTruthy()
    expect(screen.getByText('vs')).toBeTruthy()
    expect(screen.getByText('Restraining: 0')).toBeTruthy()
  })

  it('renders Strategy field', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Strategy')).toBeTruthy()
  })

  it('shows problem statement when provided', () => {
    render(
      <ForceFieldForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1="Late deliveries"
      />,
    )
    expect(screen.getByText('Problem Statement')).toBeTruthy()
    expect(screen.getByText('Late deliveries')).toBeTruthy()
  })
})
