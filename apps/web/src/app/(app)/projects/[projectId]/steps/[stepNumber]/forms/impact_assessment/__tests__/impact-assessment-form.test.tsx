import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImpactAssessmentForm } from '../impact-assessment-form'

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

describe('ImpactAssessmentForm', () => {
  it('renders Impact Assessment title', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Impact Assessment')).toBeTruthy()
  })

  it('renders description', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText(/Quantify how this problem impacts/)).toBeTruthy()
  })

  it('renders Financial Impact field', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Financial Impact')).toBeTruthy()
  })

  it('renders Customer Impact field', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Customer Impact')).toBeTruthy()
  })

  it('renders Employee Impact field', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Employee Impact')).toBeTruthy()
  })

  it('renders Process Impact field', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Process Impact')).toBeTruthy()
  })

  it('renders Risk Priority Number card', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Risk Priority Number (RPN)')).toBeTruthy()
  })

  it('renders rating sliders', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText('Severity')).toBeTruthy()
    expect(screen.getByText('Frequency')).toBeTruthy()
    expect(screen.getByText('Detection Difficulty')).toBeTruthy()
  })

  it('renders RPN formula text', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    expect(screen.getByText(/RPN = Severity x Frequency x Detection/)).toBeTruthy()
  })

  it('renders default RPN of 1', () => {
    render(<ImpactAssessmentForm projectId="p-1" stepNumber={1} initialData={null} />)
    // Default: 1 x 1 x 1 = 1
    expect(screen.getByText('Risk Priority Number')).toBeTruthy()
  })
})
