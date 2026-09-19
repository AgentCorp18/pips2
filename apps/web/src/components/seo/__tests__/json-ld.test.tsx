import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLd, serializeJsonLd } from '../json-ld'

describe('JsonLd', () => {
  it('renders a script tag with type application/ld+json', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Organization', name: 'PIPS' }} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeTruthy()
  })

  it('serializes data as JSON in script content', () => {
    const data = { '@type': 'WebSite', name: 'PIPS', url: 'https://pips.com' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')
    expect(script?.innerHTML).toBe(JSON.stringify(data))
  })

  it('escapes < so a payload cannot break out of the script element', () => {
    const data = { '@type': 'Article', headline: '</script><img src=x onerror=alert(1)>' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')

    expect(script?.innerHTML).not.toContain('</script>')
    expect(script?.innerHTML).not.toContain('<img')
    expect(container.querySelector('img')).toBeNull()
    // Still valid, unchanged JSON once parsed.
    expect(JSON.parse(script?.innerHTML ?? '{}').headline).toBe(data.headline)
  })

  it('escapes >, & and the JS-invalid line separators', () => {
    const separators = String.fromCharCode(0x2028) + String.fromCharCode(0x2029)
    const out = serializeJsonLd({ a: '<>&', b: separators })

    expect(out).not.toMatch(/[<>&]/)
    expect(out).not.toContain(String.fromCharCode(0x2028))
    expect(out).not.toContain(String.fromCharCode(0x2029))
    expect(JSON.parse(out)).toEqual({ a: '<>&', b: separators })
  })

  it('handles nested data structures', () => {
    const data = { '@type': 'Product', offers: { price: '0', priceCurrency: 'USD' } }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')
    const parsed = JSON.parse(script?.innerHTML ?? '{}')
    expect(parsed.offers.price).toBe('0')
  })
})
