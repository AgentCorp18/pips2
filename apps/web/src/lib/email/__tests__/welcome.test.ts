import { describe, it, expect } from 'vitest'
import { welcomeTemplate } from '../welcome'

describe('welcomeTemplate', () => {
  const defaultParams = {
    recipientName: 'Marc',
    dashboardUrl: 'https://pips.com/dashboard',
  }

  it('returns a string', () => {
    const result = welcomeTemplate(defaultParams)
    expect(typeof result).toBe('string')
  })

  it('contains the recipient name', () => {
    const result = welcomeTemplate(defaultParams)
    expect(result).toContain('Marc')
  })

  it('contains the dashboard URL', () => {
    const result = welcomeTemplate(defaultParams)
    expect(result).toContain('https://pips.com/dashboard')
  })

  it('contains step color codes', () => {
    const result = welcomeTemplate(defaultParams)
    expect(result).toContain('#3B82F6')
    expect(result).toContain('#F59E0B')
    expect(result).toContain('#10B981')
  })

  it('wraps content in base template', () => {
    const result = welcomeTemplate(defaultParams)
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('contains welcome preheader', () => {
    const result = welcomeTemplate(defaultParams)
    expect(result).toContain('Welcome to PIPS')
  })

  it('contains getting started steps', () => {
    const result = welcomeTemplate(defaultParams)
    expect(result).toContain('Create a project')
    expect(result).toContain('Invite your team')
  })
})
