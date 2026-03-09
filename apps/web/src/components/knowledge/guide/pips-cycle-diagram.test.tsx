import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PipsCycleDiagram } from './pips-cycle-diagram'

describe('PipsCycleDiagram', () => {
  it('renders without crashing', () => {
    render(<PipsCycleDiagram />)
    expect(screen.getByTestId('pips-cycle-diagram')).toBeInTheDocument()
  })

  it('renders all 6 step nodes', () => {
    render(<PipsCycleDiagram />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByTestId(`pips-cycle-node-${i}`)).toBeInTheDocument()
    }
  })

  it('applies size sm', () => {
    render(<PipsCycleDiagram size="sm" />)
    const svg = screen.getByTestId('pips-cycle-diagram')
    expect(svg.getAttribute('width')).toBe('200')
    expect(svg.getAttribute('height')).toBe('200')
  })

  it('applies size lg', () => {
    render(<PipsCycleDiagram size="lg" />)
    const svg = screen.getByTestId('pips-cycle-diagram')
    expect(svg.getAttribute('width')).toBe('400')
    expect(svg.getAttribute('height')).toBe('400')
  })

  it('defaults to size md', () => {
    render(<PipsCycleDiagram />)
    const svg = screen.getByTestId('pips-cycle-diagram')
    expect(svg.getAttribute('width')).toBe('300')
    expect(svg.getAttribute('height')).toBe('300')
  })

  it('highlights active step with full opacity', () => {
    render(<PipsCycleDiagram activeStep={3} />)
    const activeNode = screen.getByTestId('pips-cycle-node-3')
    expect(activeNode.getAttribute('opacity')).toBe('1')
  })

  it('dims non-active steps when activeStep is set', () => {
    render(<PipsCycleDiagram activeStep={3} />)
    const inactiveNode = screen.getByTestId('pips-cycle-node-1')
    expect(inactiveNode.getAttribute('opacity')).toBe('0.4')
  })

  it('applies custom className', () => {
    render(<PipsCycleDiagram className="my-custom" />)
    expect(screen.getByTestId('pips-cycle-diagram')).toHaveClass('my-custom')
  })

  it('has accessible role and label', () => {
    render(<PipsCycleDiagram />)
    const svg = screen.getByTestId('pips-cycle-diagram')
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBeTruthy()
  })

  it('renders step numbers in nodes', () => {
    render(<PipsCycleDiagram />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('renders links when interactive', () => {
    render(<PipsCycleDiagram interactive />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(6)
  })
})
