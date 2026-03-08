import { describe, it, expect } from 'vitest'
import { invitationTemplate } from '../invitation'

describe('invitationTemplate', () => {
  const defaultParams = {
    recipientEmail: 'user@example.com',
    orgName: 'Acme Corp',
    role: 'admin',
    inviterName: 'Jane Doe',
    acceptUrl: 'https://pips.com/accept/abc123',
  }

  it('returns a string', () => {
    const result = invitationTemplate(defaultParams)
    expect(typeof result).toBe('string')
  })

  it('contains the recipient email', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('user@example.com')
  })

  it('contains the org name', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('Acme Corp')
  })

  it('contains the inviter name', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('Jane Doe')
  })

  it('contains the role', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('admin')
  })

  it('contains the accept URL', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('https://pips.com/accept/abc123')
  })

  it('wraps content in base template HTML', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('<!DOCTYPE html>')
    expect(result).toContain('</html>')
  })

  it('includes preheader text', () => {
    const result = invitationTemplate(defaultParams)
    expect(result).toContain('invited you to join')
  })
})
