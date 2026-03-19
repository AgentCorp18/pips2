import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ProjectSearchInput } from '../project-search-input'

/* ============================================================
   Mocks
   ============================================================ */

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/projects',
  useSearchParams: () => ({
    toString: () => '',
  }),
}))

/* ============================================================
   Tests
   ============================================================ */

describe('ProjectSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an input with the correct placeholder', () => {
    render(<ProjectSearchInput />)
    expect(screen.getByTestId('project-search-input')).toBeInTheDocument()
  })

  it('uses custom placeholder when provided', () => {
    render(<ProjectSearchInput placeholder="Find projects…" />)
    expect(screen.getByPlaceholderText('Find projects…')).toBeInTheDocument()
  })

  it('pre-fills the input with initialValue', () => {
    render(<ProjectSearchInput initialValue="cycle time" />)
    const input = screen.getByTestId('project-search-input') as HTMLInputElement
    expect(input.value).toBe('cycle time')
  })

  it('shows clear button when input has a value', () => {
    render(<ProjectSearchInput initialValue="test" />)
    expect(screen.getByTestId('project-search-clear')).toBeInTheDocument()
  })

  it('does not show clear button when input is empty', () => {
    render(<ProjectSearchInput />)
    expect(screen.queryByTestId('project-search-clear')).not.toBeInTheDocument()
  })

  it('updates the URL after debounce when user types', () => {
    render(<ProjectSearchInput />)
    const input = screen.getByTestId('project-search-input')

    fireEvent.change(input, { target: { value: 'lean' } })
    expect(mockReplace).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(mockReplace).toHaveBeenCalledWith('/projects?q=lean')
  })

  it('clears the query param when clear button is clicked', () => {
    render(<ProjectSearchInput initialValue="waste" />)
    const clearBtn = screen.getByTestId('project-search-clear')

    fireEvent.click(clearBtn)
    // Clear is synchronous — no debounce
    expect(mockReplace).toHaveBeenCalledWith('/projects')
  })

  it('has an accessible aria-label', () => {
    render(<ProjectSearchInput />)
    expect(screen.getByLabelText('Search projects')).toBeInTheDocument()
  })
})
