import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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

import FacilitatorPage from '../facilitator/page'

describe('FacilitatorPage', () => {
  it('renders the page title', () => {
    render(<FacilitatorPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Facilitator Guide')
  })

  it('renders breadcrumb links', () => {
    render(<FacilitatorPage />)
    const knowledgeLink = screen.getByText('Knowledge Hub')
    expect(knowledgeLink.closest('a')?.getAttribute('href')).toBe('/knowledge')
    const workshopLink = screen.getByText('Workshop')
    expect(workshopLink.closest('a')?.getAttribute('href')).toBe('/knowledge/workshop')
  })

  it('renders the masterclass callout', () => {
    render(<FacilitatorPage />)
    const matches = screen.getAllByText("Facilitator's Masterclass")
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('links masterclass callout to the module page', () => {
    render(<FacilitatorPage />)
    const links = screen.getAllByText("Facilitator's Masterclass")
    // The first instance is the callout card
    const link = links[0]!.closest('a')
    expect(link?.getAttribute('href')).toBe('/knowledge/workshop/modules/facilitator-masterclass')
  })

  it('renders facilitation tips section', () => {
    render(<FacilitatorPage />)
    expect(screen.getByText('Facilitation Tips')).toBeTruthy()
    expect(screen.getByText('Set the tone early')).toBeTruthy()
    expect(screen.getByText('Time-box ruthlessly')).toBeTruthy()
    expect(screen.getByText('Ask, do not tell')).toBeTruthy()
    expect(screen.getByText('Use the parking lot')).toBeTruthy()
    expect(screen.getByText('Balance participation')).toBeTruthy()
    expect(screen.getByText('Close the loop')).toBeTruthy()
  })

  it('renders best practices checklist', () => {
    render(<FacilitatorPage />)
    expect(screen.getByText('Best Practices Checklist')).toBeTruthy()
    expect(
      screen.getByText('Prepare all materials and templates before the session starts'),
    ).toBeTruthy()
  })

  it('renders module facilitator notes section', () => {
    render(<FacilitatorPage />)
    expect(screen.getByText('Module Facilitator Notes')).toBeTruthy()
  })

  it('lists all modules with facilitator notes', () => {
    render(<FacilitatorPage />)
    expect(screen.getByText('Introduction to PIPS')).toBeTruthy()
    expect(screen.getByText('Step 1: Identify Workshop')).toBeTruthy()
    expect(screen.getByText('Step 2: Root Cause Analysis')).toBeTruthy()
    expect(screen.getByText('Step 3: Ideation Workshop')).toBeTruthy()
    expect(screen.getByText('Step 4: Selection & Planning')).toBeTruthy()
  })

  it('links modules to their detail pages', () => {
    render(<FacilitatorPage />)
    const link = screen.getByText('Step 1: Identify Workshop').closest('a')
    expect(link?.getAttribute('href')).toBe('/knowledge/workshop/modules/identify-workshop')
  })

  it('shows truncated facilitator notes with +more indicator', () => {
    render(<FacilitatorPage />)
    // Each module shows first 2 notes and a "+X more notes" link for modules with >2 notes
    const moreLinks = screen.getAllByText(/\+\d+ more notes/)
    expect(moreLinks.length).toBeGreaterThan(0)
  })
})
