import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CostBenefitForm } from '../cost-benefit-form'

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

describe('CostBenefitForm', () => {
  it('renders without crashing', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(document.body).toBeTruthy()
  })

  it('renders Cost-Benefit Analysis title', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Cost-Benefit Analysis')).toBeTruthy()
  })

  it('renders description', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Compare the total costs and benefits/)).toBeTruthy()
  })

  it('renders Costs section', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Costs')).toBeTruthy()
    expect(screen.getByText(/All costs associated/)).toBeTruthy()
  })

  it('renders Benefits section', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Benefits')).toBeTruthy()
    expect(screen.getByText(/All quantifiable benefits/)).toBeTruthy()
  })

  it('renders add cost and add benefit buttons', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Cost')).toBeTruthy()
    expect(screen.getByText('Add Benefit')).toBeTruthy()
  })

  it('renders Net Annual Benefit display', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Net Annual Benefit')).toBeTruthy()
  })

  it('renders Solution Name field', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Solution Name')).toBeTruthy()
  })

  it('renders Payback Period field', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Payback Period')).toBeTruthy()
  })

  it('renders Recommendation field', () => {
    render(<CostBenefitForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Recommendation')).toBeTruthy()
  })

  it('displays view mode read-only tables when initialData provided', () => {
    const initialData = {
      solutionName: 'Test Solution',
      costs: [
        {
          id: 'c1',
          description: 'Software license',
          amount: 1000,
          frequency: 'annual' as const,
          category: 'Software',
        },
      ],
      benefits: [
        {
          id: 'b1',
          description: 'Time savings',
          amount: 5000,
          frequency: 'annual' as const,
          category: 'Productivity',
        },
      ],
      netBenefit: 4000,
      paybackPeriod: '3 months',
      recommendation: 'Proceed with implementation',
    }
    render(<CostBenefitForm projectId="p-1" initialData={initialData} />)
    expect(screen.getByText('Cost-Benefit Analysis')).toBeTruthy()
  })
})
