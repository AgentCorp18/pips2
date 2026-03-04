import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EvaluationForm } from '../evaluation-form'

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

describe('EvaluationForm', () => {
  it('renders Evaluation Summary title', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Evaluation Summary')).toBeTruthy()
  })

  it('renders description', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Assess the overall effectiveness/)).toBeTruthy()
  })

  it('renders goals achieved question', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Were the project goals achieved/)).toBeTruthy()
  })

  it('renders Yes and No buttons', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Yes')).toBeTruthy()
    expect(screen.getByText('No')).toBeTruthy()
  })

  it('renders rating labels', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Effectiveness of the Solution')).toBeTruthy()
    expect(screen.getByText('Sustainability')).toBeTruthy()
    expect(screen.getByText('Team Satisfaction')).toBeTruthy()
  })

  it('renders rating section heading', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Rate the following aspects (1-5)')).toBeTruthy()
  })

  it('renders text area labels', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Unexpected Outcomes')).toBeTruthy()
    expect(screen.getByText('Recommendations')).toBeTruthy()
    expect(screen.getByText('Next Steps')).toBeTruthy()
  })

  it('renders default Average rating label', () => {
    render(<EvaluationForm projectId="p-1" initialData={null} />)
    // Default rating is 3 = Average, there should be 3 instances (one per slider)
    const averageLabels = screen.getAllByText('Average')
    expect(averageLabels.length).toBe(3)
  })
})
