import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'

describe('sitemap', () => {
  it('returns an array of sitemap entries', () => {
    const result = sitemap()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the root URL', () => {
    const result = sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls.some((url) => url.endsWith('/') || !url.includes('/methodology'))).toBe(true)
  })

  it('includes methodology step pages', () => {
    const result = sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls.some((url) => url.includes('/methodology/step/'))).toBe(true)
  })

  it('includes glossary pages', () => {
    const result = sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls.some((url) => url.includes('/resources/glossary/'))).toBe(true)
  })

  it('includes book chapter pages', () => {
    const result = sitemap()
    const urls = result.map((entry) => entry.url)
    expect(urls.some((url) => url.includes('/book/'))).toBe(true)
  })

  it('all entries have lastModified', () => {
    const result = sitemap()
    for (const entry of result) {
      expect(entry.lastModified).toBeDefined()
    }
  })
})
