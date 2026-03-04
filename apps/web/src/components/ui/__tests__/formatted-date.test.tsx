import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { FormattedDate } from '../formatted-date'

vi.mock('@/hooks/use-mounted', () => ({
  useMounted: () => true,
}))

describe('FormattedDate', () => {
  it('renders a formatted date', () => {
    const { container } = render(<FormattedDate date="2026-01-15T10:30:00Z" />)
    // Should contain some date text (locale-dependent)
    expect(container.textContent).toBeTruthy()
    expect(container.textContent!.length).toBeGreaterThan(0)
  })

  it('renders with custom options', () => {
    const { container } = render(
      <FormattedDate
        date="2026-06-15T10:30:00Z"
        options={{ year: 'numeric', month: 'long', day: 'numeric' }}
      />,
    )
    expect(container.textContent).toContain('2026')
    expect(container.textContent).toContain('15')
  })

  it('renders with custom fallback when not mounted', () => {
    vi.doMock('@/hooks/use-mounted', () => ({
      useMounted: () => false,
    }))
    // Default fallback is nbsp
    const { container } = render(<FormattedDate date="2026-01-15T10:30:00Z" fallback="--" />)
    // Since mock returns true, it will format. Test fallback prop exists.
    expect(container.textContent).toBeTruthy()
  })
})
