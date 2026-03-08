import { describe, it, expect } from 'vitest'
import robots from '../robots'

describe('robots', () => {
  it('returns a robots config object', () => {
    const result = robots()
    expect(result).toBeDefined()
    expect(result.rules).toBeDefined()
  })

  it('has a sitemap URL', () => {
    const result = robots()
    expect(result.sitemap).toContain('sitemap.xml')
  })

  it('disallows dashboard and other app routes', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    const firstRule = rules[0]!
    expect(firstRule.disallow).toContain('/dashboard/')
    expect(firstRule.disallow).toContain('/projects/')
    expect(firstRule.disallow).toContain('/settings/')
    expect(firstRule.disallow).toContain('/api/')
  })

  it('allows root path', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    expect(rules[0]!.allow).toBe('/')
  })
})
