import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepDiagram } from './step-diagram'

describe('StepDiagram', () => {
  const diagramTypes = [
    'problem-framework',
    'fishbone',
    'diverge-converge',
    'flowchart-phases',
    'milestone-timeline',
    'cycle-return',
  ] as const

  it.each(diagramTypes)('renders %s diagram with data-testid', (type) => {
    render(<StepDiagram diagramType={type} stepColor="#3B82F6" />)
    expect(screen.getByTestId('step-diagram')).toBeInTheDocument()
    expect(screen.getByTestId(`step-diagram-${type}`)).toBeInTheDocument()
  })

  it('renders nothing for invalid diagram type', () => {
    // @ts-expect-error testing invalid type
    const { container } = render(<StepDiagram diagramType="invalid" stepColor="#3B82F6" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies custom className', () => {
    render(<StepDiagram diagramType="fishbone" stepColor="#3B82F6" className="my-diagram" />)
    expect(screen.getByTestId('step-diagram')).toHaveClass('my-diagram')
  })

  it('problem-framework contains funnel labels', () => {
    render(<StepDiagram diagramType="problem-framework" stepColor="#3B82F6" />)
    expect(screen.getByText('Symptoms')).toBeInTheDocument()
    expect(screen.getByText('Root Problem')).toBeInTheDocument()
    expect(screen.getByText('Clear Statement')).toBeInTheDocument()
  })

  it('fishbone contains cause categories', () => {
    render(<StepDiagram diagramType="fishbone" stepColor="#F59E0B" />)
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Process')).toBeInTheDocument()
    expect(screen.getByText('Equipment')).toBeInTheDocument()
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(screen.getByText('Measurement')).toBeInTheDocument()
    expect(screen.getByText('Environment')).toBeInTheDocument()
  })

  it('diverge-converge contains phase labels', () => {
    render(<StepDiagram diagramType="diverge-converge" stepColor="#10B981" />)
    expect(screen.getByText('Diverge')).toBeInTheDocument()
    expect(screen.getByText('Converge')).toBeInTheDocument()
  })

  it('flowchart-phases contains step labels', () => {
    render(<StepDiagram diagramType="flowchart-phases" stepColor="#6366F1" />)
    expect(screen.getByText('Evaluate')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    expect(screen.getByText('Assign')).toBeInTheDocument()
  })

  it('milestone-timeline contains milestone labels', () => {
    render(<StepDiagram diagramType="milestone-timeline" stepColor="#CA8A04" />)
    expect(screen.getByText('Kickoff')).toBeInTheDocument()
    expect(screen.getByText('Deliver')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('cycle-return contains step numbers', () => {
    render(<StepDiagram diagramType="cycle-return" stepColor="#0891B2" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('Continuous')).toBeInTheDocument()
  })

  it('each diagram has accessible role=img', () => {
    render(<StepDiagram diagramType="problem-framework" stepColor="#3B82F6" />)
    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('aria-label')
  })
})
