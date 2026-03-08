import { describe, it, expect } from 'vitest'
import { ticketAssignedTemplate } from '../ticket-assigned'

describe('ticketAssignedTemplate', () => {
  const defaultParams = {
    recipientName: 'Alice',
    ticketTitle: 'Fix login bug',
    ticketId: 'PIPS-42',
    projectName: 'Quality Initiative',
    priority: 'high',
    ticketUrl: 'https://pips.com/tickets/42',
  }

  it('returns a string', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(typeof result).toBe('string')
  })

  it('contains the ticket title', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('Fix login bug')
  })

  it('contains the ticket ID', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('PIPS-42')
  })

  it('contains the project name', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('Quality Initiative')
  })

  it('contains the ticket URL', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('https://pips.com/tickets/42')
  })

  it('uses correct color for high priority', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('#EA580C')
  })

  it('uses correct color for critical priority', () => {
    const result = ticketAssignedTemplate({ ...defaultParams, priority: 'critical' })
    expect(result).toContain('#DC2626')
  })

  it('uses correct color for medium priority', () => {
    const result = ticketAssignedTemplate({ ...defaultParams, priority: 'medium' })
    expect(result).toContain('#F59E0B')
  })

  it('uses correct color for low priority', () => {
    const result = ticketAssignedTemplate({ ...defaultParams, priority: 'low' })
    expect(result).toContain('#6B7280')
  })

  it('capitalizes priority label', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('High')
  })

  it('wraps content in base template', () => {
    const result = ticketAssignedTemplate(defaultParams)
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('escapes HTML in user input', () => {
    const result = ticketAssignedTemplate({
      ...defaultParams,
      ticketTitle: '<img src=x onerror=alert(1)>',
    })
    expect(result).not.toContain('<img')
    expect(result).toContain('&lt;img')
  })
})
