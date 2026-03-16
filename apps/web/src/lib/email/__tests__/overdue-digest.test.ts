import { describe, it, expect } from 'vitest'
import { overdueDigestTemplate } from '../overdue-digest'
import type { OverdueDigestParams } from '../overdue-digest'

const makeTicket = (overrides: Partial<Parameters<typeof overdueDigestTemplate>[0]['projects'][0]['tickets'][0]> = {}) => ({
  id: 'ticket-1',
  title: 'Fix login bug',
  priority: 'high',
  assigneeName: 'Alice',
  daysOverdue: 3,
  ticketUrl: 'https://pips-app.vercel.app/tickets/ticket-1',
  ...overrides,
})

const defaultParams: OverdueDigestParams = {
  recipientName: 'Bob',
  orgName: 'ACME Corp',
  totalOverdue: 2,
  projects: [
    {
      projectName: 'Quality Initiative',
      tickets: [
        makeTicket(),
        makeTicket({ id: 'ticket-2', title: 'Update docs', priority: 'low', assigneeName: null, daysOverdue: 10 }),
      ],
    },
  ],
  overdueListUrl: 'https://pips-app.vercel.app/tickets?status=overdue',
}

describe('overdueDigestTemplate', () => {
  it('returns a string', () => {
    expect(typeof overdueDigestTemplate(defaultParams)).toBe('string')
  })

  it('wraps content in base HTML template', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('includes recipient name', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('Bob')
  })

  it('includes org name', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('ACME Corp')
  })

  it('includes total overdue count', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('2 overdue tickets')
  })

  it('uses singular "ticket" for count of 1', () => {
    const result = overdueDigestTemplate({ ...defaultParams, totalOverdue: 1 })
    expect(result).toContain('1 overdue ticket')
    expect(result).not.toContain('1 overdue tickets')
  })

  it('includes project name', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('Quality Initiative')
  })

  it('includes ticket title', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('Fix login bug')
  })

  it('includes ticket URL as a link', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('https://pips-app.vercel.app/tickets/ticket-1')
  })

  it('includes overdue list URL', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('https://pips-app.vercel.app/tickets?status=overdue')
  })

  it('shows assignee name when provided', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('Alice')
  })

  it('shows "Unassigned" when assigneeName is null', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('Unassigned')
  })

  it('shows days overdue', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('3 days overdue')
  })

  it('uses singular "day" for 1 day overdue', () => {
    const params: OverdueDigestParams = {
      ...defaultParams,
      projects: [{ projectName: 'Proj', tickets: [makeTicket({ daysOverdue: 1 })] }],
    }
    const result = overdueDigestTemplate(params)
    expect(result).toContain('1 day overdue')
    expect(result).not.toContain('1 days overdue')
  })

  it('uses red color for critical priority badge', () => {
    const params: OverdueDigestParams = {
      ...defaultParams,
      projects: [{ projectName: 'Proj', tickets: [makeTicket({ priority: 'critical' })] }],
    }
    const result = overdueDigestTemplate(params)
    expect(result).toContain('#DC2626')
  })

  it('uses orange color for high priority badge', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('#EA580C')
  })

  it('uses amber color for medium priority badge', () => {
    const params: OverdueDigestParams = {
      ...defaultParams,
      projects: [{ projectName: 'Proj', tickets: [makeTicket({ priority: 'medium' })] }],
    }
    const result = overdueDigestTemplate(params)
    expect(result).toContain('#F59E0B')
  })

  it('escapes HTML in ticket title', () => {
    const params: OverdueDigestParams = {
      ...defaultParams,
      projects: [
        {
          projectName: 'Proj',
          tickets: [makeTicket({ title: '<script>alert(1)</script>' })],
        },
      ],
    }
    const result = overdueDigestTemplate(params)
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('escapes HTML in org name', () => {
    const result = overdueDigestTemplate({ ...defaultParams, orgName: '<b>Evil</b>' })
    expect(result).not.toContain('<b>')
    expect(result).toContain('&lt;b&gt;')
  })

  it('escapes HTML in recipient name', () => {
    const result = overdueDigestTemplate({ ...defaultParams, recipientName: '<img src=x>' })
    expect(result).not.toContain('<img')
    expect(result).toContain('&lt;img')
  })

  it('renders multiple project sections', () => {
    const params: OverdueDigestParams = {
      ...defaultParams,
      projects: [
        { projectName: 'Project Alpha', tickets: [makeTicket()] },
        { projectName: 'Project Beta', tickets: [makeTicket({ id: 'ticket-3', title: 'Task B' })] },
      ],
    }
    const result = overdueDigestTemplate(params)
    expect(result).toContain('Project Alpha')
    expect(result).toContain('Project Beta')
  })

  it('includes ticket count per project', () => {
    const result = overdueDigestTemplate(defaultParams)
    expect(result).toContain('2 tickets')
  })

  it('uses singular "ticket" in project count for 1 ticket', () => {
    const params: OverdueDigestParams = {
      ...defaultParams,
      projects: [{ projectName: 'Proj', tickets: [makeTicket()] }],
    }
    const result = overdueDigestTemplate(params)
    expect(result).toContain('1 ticket)')
  })
})
