import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceSheetForm } from '../balance-sheet-form'

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

describe('BalanceSheetForm', () => {
  it('renders Balance Sheet title', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Balance Sheet')).toBeTruthy()
  })

  it('renders description', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Weigh gains against losses/)).toBeTruthy()
  })

  it('renders Gains section', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Gains')).toBeTruthy()
    expect(screen.getByText(/Positive outcomes/)).toBeTruthy()
  })

  it('renders Losses section', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Losses')).toBeTruthy()
    expect(screen.getByText(/Negative outcomes/)).toBeTruthy()
  })

  it('renders Observations section', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Observations')).toBeTruthy()
    expect(screen.getByText(/Neutral findings/)).toBeTruthy()
  })

  it('renders add buttons for each section', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Add Gain')).toBeTruthy()
    expect(screen.getByText('Add Loss')).toBeTruthy()
    expect(screen.getByText('Add Observation')).toBeTruthy()
  })

  it('renders Overall Assessment label', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Overall Assessment')).toBeTruthy()
  })

  it('renders Recommendation label', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText('Recommendation')).toBeTruthy()
  })

  it('renders recommendation options', () => {
    render(<BalanceSheetForm projectId="p-1" initialData={null} />)
    expect(screen.getByText(/Sustain/)).toBeTruthy()
    expect(screen.getByText(/Modify/)).toBeTruthy()
    expect(screen.getByText(/Abandon/)).toBeTruthy()
  })
})
