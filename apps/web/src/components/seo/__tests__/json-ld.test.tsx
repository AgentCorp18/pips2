import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLd } from '../json-ld'

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

  it('handles nested data structures', () => {
    const data = { '@type': 'Product', offers: { price: '0', priceCurrency: 'USD' } }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')
    const parsed = JSON.parse(script?.innerHTML ?? '{}')
    expect(parsed.offers.price).toBe('0')
  })
})
