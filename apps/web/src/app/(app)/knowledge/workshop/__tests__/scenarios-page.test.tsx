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

import ScenariosPage from '../scenarios/page'

describe('ScenariosPage', () => {
  it('renders the page title', () => {
    render(<ScenariosPage />)
    expect(screen.getByText('Practice Scenarios')).toBeTruthy()
  })

  it('renders breadcrumb links', () => {
    render(<ScenariosPage />)
    const knowledgeLink = screen.getByText('Knowledge Hub')
    expect(knowledgeLink.closest('a')?.getAttribute('href')).toBe('/knowledge')
    const workshopLink = screen.getByText('Workshop')
    expect(workshopLink.closest('a')?.getAttribute('href')).toBe('/knowledge/workshop')
  })

  it('renders scenario cards from module data', () => {
    render(<ScenariosPage />)
    // From intro-to-pips
    expect(screen.getByText('The Recurring Complaint')).toBeTruthy()
    // From identify-workshop
    expect(screen.getByText('Onboarding Delays')).toBeTruthy()
    expect(screen.getByText('Quality Defects')).toBeTruthy()
    // From root-cause-workshop
    expect(screen.getByText('Delivery Delays')).toBeTruthy()
    expect(screen.getByText('Employee Turnover')).toBeTruthy()
  })

  it('renders scenario descriptions', () => {
    render(<ScenariosPage />)
    expect(
      screen.getByText('A customer complaint that keeps coming back despite multiple fixes'),
    ).toBeTruthy()
  })

  it('links scenarios to practice pages', () => {
    render(<ScenariosPage />)
    const link = screen.getByText('The Recurring Complaint').closest('a')
    expect(link?.getAttribute('href')).toBe('/training/practice/recurring-complaint')
  })

  it('shows module source badge on each card', () => {
    render(<ScenariosPage />)
    expect(screen.getByText('Introduction to PIPS')).toBeTruthy()
    // Step 1 has 2 scenarios, so its badge appears twice
    const step1Badges = screen.getAllByText('Step 1: Identify Workshop')
    expect(step1Badges.length).toBe(2)
  })

  it('shows difficulty level on each card', () => {
    render(<ScenariosPage />)
    // Multiple "Beginner" / "Intermediate" / "Advanced" badges
    const beginnerBadges = screen.getAllByText('Beginner')
    expect(beginnerBadges.length).toBeGreaterThan(0)
  })
})
