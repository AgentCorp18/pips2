import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { FormCard } from '../form-card'

/* ============================================================
   Fixtures
   ============================================================ */

const baseProps = {
  id: 'form-1',
  formDisplayName: 'Fishbone Diagram',
  stepNumber: 2,
  stepName: 'Analyze',
  stepColor: '#D97706',
  projectName: 'Reduce Customer Churn',
  projectId: 'proj-99',
  creatorName: 'Alice Johnson',
  updatedAt: '2026-03-01T12:00:00Z',
  dataFieldCount: 8,
  formSlug: 'fishbone',
}

/* ============================================================
   Tests
   ============================================================ */

describe('FormCard', () => {
  it('renders form display name', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByText('Fishbone Diagram')).toBeTruthy()
  })

  it('renders project name', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByText('Reduce Customer Churn')).toBeTruthy()
  })

  it('renders step badge with step number', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('renders step name', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByText('Step 2: Analyze')).toBeTruthy()
  })

  it('renders step color indicator on top stripe', () => {
    render(<FormCard {...baseProps} />)
    const card = screen.getByTestId('form-card-form-1')
    // Find any element with an inline backgroundColor matching the stepColor
    const allDivs = card.querySelectorAll('[style]')
    const stripe = Array.from(allDivs).find((el) => {
      const style = (el as HTMLElement).style
      return (
        style.backgroundColor === '#D97706' ||
        style.backgroundColor === 'rgb(217, 119, 6)' ||
        style.background === '#D97706'
      )
    })
    expect(stripe).toBeTruthy()
  })

  it('links to correct project form URL', () => {
    render(<FormCard {...baseProps} />)
    const links = screen.getAllByRole('link')
    const formLink = links.find(
      (l) => l.getAttribute('href') === '/projects/proj-99/steps/2/forms/fishbone',
    )
    expect(formLink).toBeTruthy()
    expect(formLink?.textContent).toContain('Fishbone Diagram')
  })

  it('links project name to project page', () => {
    render(<FormCard {...baseProps} />)
    const links = screen.getAllByRole('link')
    const projectLink = links.find((l) => l.getAttribute('href') === '/projects/proj-99')
    expect(projectLink).toBeTruthy()
    expect(projectLink?.textContent).toBe('Reduce Customer Churn')
  })

  it('shows knowledge link icon with aria-label', () => {
    render(<FormCard {...baseProps} />)
    const knowledgeLink = screen.getByLabelText('Knowledge guide for Fishbone Diagram')
    expect(knowledgeLink).toBeTruthy()
    expect(knowledgeLink.getAttribute('href')).toBe('/knowledge/guide/tools/fishbone')
  })

  it('renders creator name', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByText('Alice Johnson')).toBeTruthy()
  })

  it('renders data-testid on card', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByTestId('form-card-form-1')).toBeTruthy()
  })

  it('renders field count', () => {
    render(<FormCard {...baseProps} />)
    expect(screen.getByText('8 fields')).toBeTruthy()
  })
})
