import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

vi.mock('@/components/knowledge/content-breadcrumb', () => ({
  ContentBreadcrumb: ({ items }: { items: { label: string }[] }) => (
    <nav data-testid="breadcrumb">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}))

vi.mock('@/components/knowledge/expandable-section', () => ({
  ExpandableSection: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="expandable-section">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}))

vi.mock('@/components/knowledge/guide/step-section-header', () => ({
  StepSectionHeader: ({ stepNumber, stepName }: { stepNumber: number; stepName: string }) => (
    <div data-testid="step-section-header">
      Step {stepNumber}: {stepName}
    </div>
  ),
}))

vi.mock('@/components/knowledge/guide/pips-cycle-diagram', () => ({
  PipsCycleDiagram: () => <div data-testid="pips-cycle-diagram" />,
}))

vi.mock('@/components/knowledge/guide/step-diagram', () => ({
  StepDiagram: () => <div data-testid="step-diagram" />,
}))

vi.mock('@/components/knowledge/guide/example-comparison', () => ({
  ExampleComparison: () => <div data-testid="example-comparison" />,
}))

vi.mock('@/components/knowledge/guide/interactive-checklist', () => ({
  InteractiveChecklist: () => <div data-testid="interactive-checklist" />,
}))

vi.mock('@/components/knowledge/guide/why-this-matters', () => ({
  WhyThisMatters: () => <div data-testid="why-this-matters" />,
}))

vi.mock('@/components/knowledge/guide/tool-tag', () => ({
  ToolTag: ({ toolName }: { toolName: string }) => <span data-testid="tool-tag">{toolName}</span>,
}))

vi.mock('@/components/knowledge/guide/guide-navigation', () => ({
  GuideNavigation: () => <div data-testid="guide-navigation" />,
}))

vi.mock('@/components/knowledge/guide/section-anchor-nav', () => ({
  SectionAnchorNav: () => <div data-testid="section-anchor-nav" />,
}))

import StepPage from './page'

const renderStepPage = async (stepNumber: string) => {
  const Component = await StepPage({ params: Promise.resolve({ stepNumber }) })
  return render(Component)
}

describe('StepPage', () => {
  it('renders step 1 with data-testid', async () => {
    await renderStepPage('1')
    expect(screen.getByTestId('step-detail-page')).toBeInTheDocument()
  })

  it('renders breadcrumb', async () => {
    await renderStepPage('1')
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
  })

  it('renders step section header', async () => {
    await renderStepPage('1')
    expect(screen.getByTestId('step-section-header')).toBeInTheDocument()
  })

  it('renders key sections', async () => {
    await renderStepPage('1')
    expect(screen.getByTestId('section-objective')).toBeInTheDocument()
    expect(screen.getByTestId('section-diagram')).toBeInTheDocument()
    expect(screen.getByTestId('section-questions')).toBeInTheDocument()
    expect(screen.getByTestId('section-examples')).toBeInTheDocument()
    expect(screen.getByTestId('section-checklist')).toBeInTheDocument()
    expect(screen.getByTestId('section-tips')).toBeInTheDocument()
    expect(screen.getByTestId('section-why-matters')).toBeInTheDocument()
    expect(screen.getByTestId('section-facilitation')).toBeInTheDocument()
    expect(screen.getByTestId('section-related')).toBeInTheDocument()
  })

  it('renders guide navigation', async () => {
    await renderStepPage('1')
    expect(screen.getByTestId('guide-navigation')).toBeInTheDocument()
  })

  it('throws for invalid step number', async () => {
    await expect(renderStepPage('7')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('throws for non-numeric step', async () => {
    await expect(renderStepPage('abc')).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('renders step 6 correctly', async () => {
    await renderStepPage('6')
    expect(screen.getByTestId('step-detail-page')).toBeInTheDocument()
  })
})
