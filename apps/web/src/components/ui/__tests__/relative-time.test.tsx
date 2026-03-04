import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { RelativeTime } from '../relative-time'

vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true,
}))

describe('RelativeTime', () => {
  it('renders relative time text', () => {
    const recentDate = new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    const { container } = render(<RelativeTime date={recentDate} />)
    expect(container.textContent).toContain('ago')
  })

  it('handles invalid date gracefully', () => {
    const { container } = render(<RelativeTime date="not-a-date" />)
    expect(container.textContent).toBe('just now')
  })

  it('renders recent dates with "ago" suffix', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { container } = render(<RelativeTime date={oneHourAgo} />)
    expect(container.textContent).toContain('ago')
  })
})
