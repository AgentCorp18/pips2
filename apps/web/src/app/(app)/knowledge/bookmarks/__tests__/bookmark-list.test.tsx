import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BookmarkList } from '../bookmark-list'
import type { BookmarkWithContent } from '../../actions'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: { children: React.ReactNode; href: string } & Record<string, unknown>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('../../actions', () => ({
  toggleBookmark: vi.fn().mockResolvedValue({ bookmarked: false }),
}))

const BOOKMARKS: BookmarkWithContent[] = [
  {
    id: 'bm-1',
    content_node_id: 'cn-1',
    note: 'Great chapter',
    created_at: '2026-01-15T00:00:00Z',
    title: 'Introduction to PIPS',
    pillar: 'book',
    slug: 'intro-pips',
    access_level: 'public',
  },
  {
    id: 'bm-2',
    content_node_id: 'cn-2',
    note: null,
    created_at: '2026-01-10T00:00:00Z',
    title: 'Workshop Guide',
    pillar: 'workshop',
    slug: 'workshop-guide',
    access_level: 'public',
  },
]

describe('BookmarkList', () => {
  it('renders bookmark titles', () => {
    render(<BookmarkList bookmarks={BOOKMARKS} />)
    expect(screen.getByText('Introduction to PIPS')).toBeTruthy()
    expect(screen.getByText('Workshop Guide')).toBeTruthy()
  })

  it('renders pillar badges', () => {
    render(<BookmarkList bookmarks={BOOKMARKS} />)
    expect(screen.getByText('Book')).toBeTruthy()
    expect(screen.getByText('Workshop')).toBeTruthy()
  })

  it('renders bookmark note when present', () => {
    render(<BookmarkList bookmarks={BOOKMARKS} />)
    expect(screen.getByText('Great chapter')).toBeTruthy()
  })

  it('renders saved items count', () => {
    render(<BookmarkList bookmarks={BOOKMARKS} />)
    expect(screen.getByText('2 saved items')).toBeTruthy()
  })

  it('renders Remove buttons', () => {
    render(<BookmarkList bookmarks={BOOKMARKS} />)
    expect(screen.getByLabelText('Remove bookmark for Introduction to PIPS')).toBeTruthy()
    expect(screen.getByLabelText('Remove bookmark for Workshop Guide')).toBeTruthy()
  })

  it('links to correct knowledge page', () => {
    render(<BookmarkList bookmarks={BOOKMARKS} />)
    const link = screen.getByText('Introduction to PIPS').closest('a')
    expect(link?.getAttribute('href')).toBe('/knowledge/book/intro-pips')
  })

  it('renders empty state when no bookmarks', () => {
    render(<BookmarkList bookmarks={[]} />)
    expect(screen.getByText('No bookmarks yet.')).toBeTruthy()
  })

  it('renders Browse Knowledge Hub button in empty state', () => {
    render(<BookmarkList bookmarks={[]} />)
    expect(screen.getByText('Browse Knowledge Hub')).toBeTruthy()
  })
})
