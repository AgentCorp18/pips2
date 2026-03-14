import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FishboneForm } from '../fishbone-form'

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

describe('FishboneForm', () => {
  it('renders Fishbone Diagram title', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Fishbone Diagram (Cause & Effect)')).toBeTruthy()
  })

  it('renders description', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText(/Identify potential causes organized by category/)).toBeTruthy()
  })

  it('renders all 6 default categories', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.getByText('Man (People)')).toBeTruthy()
    expect(screen.getByText('Machine (Equipment)')).toBeTruthy()
    expect(screen.getByText('Method (Process)')).toBeTruthy()
    expect(screen.getByText('Material (Inputs)')).toBeTruthy()
    expect(screen.getByText('Measurement (Metrics)')).toBeTruthy()
    expect(screen.getByText('Mother Nature (Environment)')).toBeTruthy()
  })

  it('renders Add Cause buttons for each category', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    const addButtons = screen.getAllByText('Add Cause')
    expect(addButtons.length).toBe(6)
  })

  it('renders cause count badges', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    const zeroBadges = screen.getAllByText('0')
    expect(zeroBadges.length).toBe(6)
  })

  it('shows problem statement when provided', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1="High defect rate"
      />,
    )
    expect(screen.getByText('Problem Statement')).toBeTruthy()
    expect(screen.getByText('High defect rate')).toBeTruthy()
  })

  it('does not show problem statement section when empty', () => {
    render(
      <FishboneForm
        projectId="p-1"
        stepNumber={2}
        initialData={null}
        problemStatementFromStep1=""
      />,
    )
    expect(screen.queryByText('Problem Statement')).toBeNull()
  })
})
