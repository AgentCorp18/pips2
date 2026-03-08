import { describe, it, expect } from 'vitest'
import { baseTemplate, ctaButton, escapeHtml } from '../base-template'

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('A & B')).toBe('A &amp; B')
  })

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    )
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
  })

  it('returns plain strings unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('escapes multiple special characters', () => {
    expect(escapeHtml('a & b < c > d "e" f\'g')).toBe(
      'a &amp; b &lt; c &gt; d &quot;e&quot; f&#39;g',
    )
  })
})

describe('ctaButton', () => {
  it('returns HTML string with label and href', () => {
    const result = ctaButton('Click Me', 'https://example.com')
    expect(result).toContain('Click Me')
    expect(result).toContain('https://example.com')
  })

  it('includes role="presentation" for email compatibility', () => {
    const result = ctaButton('Test', 'https://test.com')
    expect(result).toContain('role="presentation"')
  })

  it('includes the PIPS brand color', () => {
    const result = ctaButton('Test', 'https://test.com')
    expect(result).toContain('#4F46E5')
  })
})

describe('baseTemplate', () => {
  it('returns full HTML document', () => {
    const result = baseTemplate({ body: '<p>Hello</p>' })
    expect(result).toContain('<!DOCTYPE html>')
    expect(result).toContain('</html>')
  })

  it('includes the body content', () => {
    const result = baseTemplate({ body: '<p>Test body content</p>' })
    expect(result).toContain('<p>Test body content</p>')
  })

  it('includes preheader when provided', () => {
    const result = baseTemplate({ preheader: 'Preview text', body: '<p>Body</p>' })
    expect(result).toContain('Preview text')
  })

  it('omits preheader div when not provided', () => {
    const result = baseTemplate({ body: '<p>Body</p>' })
    expect(result).not.toContain('display:none;max-height:0;overflow:hidden;')
  })

  it('includes PIPS branding', () => {
    const result = baseTemplate({ body: '<p>Body</p>' })
    expect(result).toContain('PIPS')
  })

  it('includes unsubscribe link', () => {
    const result = baseTemplate({
      body: '<p>Body</p>',
      unsubscribeUrl: 'https://pips.com/unsubscribe',
    })
    expect(result).toContain('https://pips.com/unsubscribe')
  })

  it('uses fallback # for unsubscribe when not provided', () => {
    const result = baseTemplate({ body: '<p>Body</p>' })
    expect(result).toContain('href="#"')
  })
})
