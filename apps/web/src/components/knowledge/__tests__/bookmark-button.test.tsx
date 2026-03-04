import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookmarkButton } from '../bookmark-button'

/* ============================================================
   Mock server action
   ============================================================ */

const mockToggleBookmark = vi.fn()

vi.mock('@/app/(app)/knowledge/actions', () => ({
  toggleBookmark: (...args: unknown[]) => mockToggleBookmark(...args),
}))

/* ============================================================
   Tests
   ============================================================ */

describe('BookmarkButton', () => {
  beforeEach(() => {
    mockToggleBookmark.mockReset()
  })

  it('renders "Bookmark" text when not bookmarked', () => {
    render(<BookmarkButton contentNodeId="book/ch01" />)
    expect(screen.getByText('Bookmark')).toBeTruthy()
  })

  it('renders "Bookmarked" text when initially bookmarked', () => {
    render(<BookmarkButton contentNodeId="book/ch01" initialBookmarked />)
    expect(screen.getByText('Bookmarked')).toBeTruthy()
  })

  it('has accessible aria-label for unbookmarked state', () => {
    render(<BookmarkButton contentNodeId="book/ch01" />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).toBe('Add bookmark')
  })

  it('has accessible aria-label for bookmarked state', () => {
    render(<BookmarkButton contentNodeId="book/ch01" initialBookmarked />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).toBe('Remove bookmark')
  })

  it('calls toggleBookmark with content node ID on click', async () => {
    mockToggleBookmark.mockResolvedValue({ bookmarked: true })
    render(<BookmarkButton contentNodeId="book/ch01" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToggleBookmark).toHaveBeenCalledWith('book/ch01')
    })
  })

  it('toggles from unbookmarked to bookmarked after click', async () => {
    mockToggleBookmark.mockResolvedValue({ bookmarked: true })
    render(<BookmarkButton contentNodeId="book/ch01" />)

    expect(screen.getByText('Bookmark')).toBeTruthy()

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Bookmarked')).toBeTruthy()
    })
  })

  it('toggles from bookmarked to unbookmarked after click', async () => {
    mockToggleBookmark.mockResolvedValue({ bookmarked: false })
    render(<BookmarkButton contentNodeId="book/ch01" initialBookmarked />)

    expect(screen.getByText('Bookmarked')).toBeTruthy()

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Bookmark')).toBeTruthy()
    })
  })
})
