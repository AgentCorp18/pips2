import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/knowledge/guide/pips-cycle-diagram', () => ({
  PipsCycleDiagram: (props: Record<string, unknown>) => (
    <div data-testid="pips-cycle-diagram" data-size={props.size} />
  ),
}))

vi.mock('@/components/knowledge/guide/tool-tag', () => ({
  ToolTag: ({ toolName }: { toolName: string }) => <span data-testid="tool-tag">{toolName}</span>,
}))

import GuidePage from './page'

describe('GuidePage', () => {
  it('renders the page with data-testid', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-landing-page')).toBeInTheDocument()
  })

  it('renders the hero section with title', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-hero')).toBeInTheDocument()
    expect(screen.getByText('The PIPS Methodology')).toBeInTheDocument()
  })

  it('renders the philosophy section', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-philosophy')).toBeInTheDocument()
  })

  it('renders the iteration section', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-iteration')).toBeInTheDocument()
    expect(screen.getByText('Non-Linear by Design')).toBeInTheDocument()
  })

  it('renders all 6 step preview cards', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-step-cards')).toBeInTheDocument()
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByTestId(`step-preview-${i}`)).toBeInTheDocument()
    }
  })

  it('renders the quick access section with links', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-quick-access')).toBeInTheDocument()
    expect(screen.getByText('Tools Library')).toBeInTheDocument()
    expect(screen.getByText('Roles & Responsibilities')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  it('renders the resources section', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('guide-resources')).toBeInTheDocument()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
    expect(screen.getByText('Book')).toBeInTheDocument()
    expect(screen.getByText('Workbook')).toBeInTheDocument()
    expect(screen.getByText('Workshop')).toBeInTheDocument()
  })

  it('renders the PipsCycleDiagram in hero', () => {
    render(<GuidePage />)
    expect(screen.getByTestId('pips-cycle-diagram')).toBeInTheDocument()
  })

  it('renders Explore Step links for each step', () => {
    render(<GuidePage />)
    const exploreLinks = screen.getAllByText('Explore Step')
    expect(exploreLinks).toHaveLength(6)
  })
})
