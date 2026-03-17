import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InitiativesFilters } from '../initiatives-filters'

/* ============================================================
   Mocks
   ============================================================ */

const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}))

/* ============================================================
   Helpers
   ============================================================ */

/** Reset the mocked URLSearchParams to an empty state between tests */
const clearParams = () => {
  for (const key of [...mockSearchParams.keys()]) {
    mockSearchParams.delete(key)
  }
}

/* ============================================================
   Tests
   ============================================================ */

describe('InitiativesFilters', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    clearParams()
  })

  it('renders the search input', () => {
    render(<InitiativesFilters />)
    const input = screen.getByTestId('initiative-search')
    expect(input).toBeTruthy()
  })

  it('renders the filter select trigger', () => {
    render(<InitiativesFilters />)
    const trigger = screen.getByTestId('initiative-filter')
    expect(trigger).toBeTruthy()
  })

  it('renders the sort select trigger', () => {
    render(<InitiativesFilters />)
    const trigger = screen.getByTestId('initiative-sort')
    expect(trigger).toBeTruthy()
  })

  it('does not render a clear button when no filters are active', () => {
    render(<InitiativesFilters />)
    expect(screen.queryByRole('button', { name: /clear/i })).toBeNull()
  })

  it('renders a clear button when search param is present', () => {
    mockSearchParams.set('search', 'test')
    render(<InitiativesFilters />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeTruthy()
  })

  it('renders a clear button when status param is present', () => {
    mockSearchParams.set('status', 'active')
    render(<InitiativesFilters />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeTruthy()
  })

  it('renders a clear button when sort param is present', () => {
    mockSearchParams.set('sort', 'oldest')
    render(<InitiativesFilters />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeTruthy()
  })

  it('navigates to /initiatives without params when clear is clicked', () => {
    mockSearchParams.set('search', 'remove me')
    render(<InitiativesFilters />)
    fireEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(mockReplace).toHaveBeenCalledWith('/initiatives')
  })

  it('updates search param on Enter keydown', () => {
    render(<InitiativesFilters />)
    const input = screen.getByTestId('initiative-search') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'reduce churn' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=reduce+churn'))
  })

  it('updates search param on blur', () => {
    render(<InitiativesFilters />)
    const input = screen.getByTestId('initiative-search') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'efficiency' } })
    fireEvent.blur(input)
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('search=efficiency'))
  })

  it('removes the search param when blurred with empty value', () => {
    mockSearchParams.set('search', 'existing')
    render(<InitiativesFilters />)
    const input = screen.getByTestId('initiative-search') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    // replace called with URL not containing search param
    const lastCall = mockReplace.mock.calls.at(-1)?.[0] as string | undefined
    expect(lastCall).toBeDefined()
    expect(lastCall).not.toContain('search=')
  })

  it('pre-fills search input from searchParams', () => {
    mockSearchParams.set('search', 'pre-filled')
    render(<InitiativesFilters />)
    const input = screen.getByTestId('initiative-search') as HTMLInputElement
    expect(input.defaultValue).toBe('pre-filled')
  })
})
