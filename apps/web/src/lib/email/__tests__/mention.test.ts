import { describe, it, expect } from 'vitest'
import { mentionTemplate } from '../mention'

describe('mentionTemplate', () => {
  const defaultParams = {
    recipientName: 'Alice',
    commenterName: 'Bob',
    commentSnippet: 'Great analysis on the root cause!',
    entityLabel: 'Ticket #42',
    mentionUrl: 'https://pips.com/ticket/42',
  }

  it('returns a string', () => {
    const result = mentionTemplate(defaultParams)
    expect(typeof result).toBe('string')
  })

  it('contains the commenter name', () => {
    const result = mentionTemplate(defaultParams)
    expect(result).toContain('Bob')
  })

  it('contains the entity label', () => {
    const result = mentionTemplate(defaultParams)
    expect(result).toContain('Ticket #42')
  })

  it('contains the mention URL', () => {
    const result = mentionTemplate(defaultParams)
    expect(result).toContain('https://pips.com/ticket/42')
  })

  it('contains the comment snippet', () => {
    const result = mentionTemplate(defaultParams)
    expect(result).toContain('Great analysis on the root cause!')
  })

  it('wraps content in base template', () => {
    const result = mentionTemplate(defaultParams)
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('escapes HTML in user-controlled strings', () => {
    const result = mentionTemplate({
      ...defaultParams,
      recipientName: '<script>alert("xss")</script>',
    })
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })
})
