import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketProjectForms } from '../ticket-project-forms'
import type { ProjectForm } from '../ticket-project-forms'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('@pips/shared', () => ({
  pipsStepEnumToNumber: (step: string) => {
    const map: Record<string, number> = {
      identify: 1,
      analyze: 2,
      generate: 3,
      select_plan: 4,
      implement: 5,
      evaluate: 6,
    }
    return map[step] ?? 1
  },
}))

const FORMS: ProjectForm[] = [
  { id: 'f1', step: 'identify', form_type: 'problem_statement', title: 'Problem Statement' },
  { id: 'f2', step: 'analyze', form_type: 'fishbone', title: 'Fishbone Diagram' },
  { id: 'f3', step: 'analyze', form_type: 'five_why', title: null },
]

const DEFAULT_PROPS = {
  projectId: 'proj-123',
  projectTitle: 'My Test Project',
  forms: FORMS,
}

describe('TicketProjectForms', () => {
  it('renders the section title', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    expect(screen.getByText('PIPS Forms')).toBeTruthy()
  })

  it('renders project title in header', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    expect(screen.getByText('My Test Project')).toBeTruthy()
  })

  it('renders form count badge', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('renders forms grouped by step label', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    expect(screen.getByText('Step 1: Identify')).toBeTruthy()
    expect(screen.getByText('Step 2: Analyze')).toBeTruthy()
  })

  it('renders form titles', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    // Each form title may appear in both the link text and the badge — use getAllByText
    expect(screen.getAllByText('Problem Statement').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Fishbone Diagram').length).toBeGreaterThan(0)
  })

  it('uses formatted form_type as title when title is null', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    // form f3 has title=null, form_type='five_why' -> "Five Why"
    // It appears as title in the link text
    expect(screen.getAllByText('Five Why').length).toBeGreaterThan(0)
  })

  it('links each form to the correct URL', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    const link = screen.getByTestId('form-link-f1').closest('a')
    expect(link?.getAttribute('href')).toBe('/projects/proj-123/steps/1/forms/problem_statement')
  })

  it('links analyze forms to step 2 URL', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    const link = screen.getByTestId('form-link-f2').closest('a')
    expect(link?.getAttribute('href')).toBe('/projects/proj-123/steps/2/forms/fishbone')
  })

  it('shows empty state message when no forms provided', () => {
    render(<TicketProjectForms projectId="proj-1" projectTitle="Empty Project" forms={[]} />)
    expect(screen.getByTestId('ticket-project-forms-empty')).toBeTruthy()
    expect(screen.getByText(/No forms have been filled out/)).toBeTruthy()
  })

  it('does not render step groups when forms is empty', () => {
    render(<TicketProjectForms projectId="proj-1" projectTitle="Empty Project" forms={[]} />)
    expect(screen.queryByTestId('step-group-identify')).toBeNull()
  })

  it('collapses content when toggle is clicked', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    const toggle = screen.getByTestId('ticket-project-forms-toggle')
    // Initially expanded — forms visible
    expect(screen.getByTestId('step-group-identify')).toBeTruthy()
    fireEvent.click(toggle)
    // After collapse — forms not visible
    expect(screen.queryByTestId('step-group-identify')).toBeNull()
  })

  it('toggle button has aria-expanded=true when open', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    const toggle = screen.getByTestId('ticket-project-forms-toggle')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('toggle button has aria-expanded=false when collapsed', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    const toggle = screen.getByTestId('ticket-project-forms-toggle')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('renders separate step groups for identify and analyze', () => {
    render(<TicketProjectForms {...DEFAULT_PROPS} />)
    expect(screen.getByTestId('step-group-identify')).toBeTruthy()
    expect(screen.getByTestId('step-group-analyze')).toBeTruthy()
  })
})
