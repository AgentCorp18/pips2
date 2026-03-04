import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContentReader } from '../content-reader'

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

vi.mock('next/dynamic', () => ({
  default: () => {
    const MockMarkdown = ({ content }: { content: string }) => (
      <div data-testid="mock-markdown">{content}</div>
    )
    MockMarkdown.displayName = 'MockMarkdown'
    return MockMarkdown
  },
}))

vi.mock('@/app/(app)/knowledge/actions', () => ({
  recordReadHistory: vi.fn(),
  updateReadingSession: vi.fn(),
}))

vi.mock('../bookmark-button', () => ({
  BookmarkButton: ({ contentNodeId }: { contentNodeId: string }) => (
    <button data-testid="bookmark-btn">Bookmark {contentNodeId}</button>
  ),
}))

const BASE_NODE = {
  id: 'node-1',
  title: 'Chapter 1: Introduction',
  slug: 'ch1-intro',
  pillar: 'book',
  sort_order: 0,
  body_md: '# Hello World',
  summary: 'An introduction to PIPS',
  estimated_read_minutes: 5,
  parent_id: null,
}

const SECTIONS = [
  {
    id: 'sec-1',
    title: 'What is PIPS?',
    slug: 'what-is-pips',
    pillar: 'book',
    sort_order: 1,
    body_md: 'PIPS is...',
    summary: null,
    estimated_read_minutes: 2,
    parent_id: 'node-1',
  },
  {
    id: 'sec-2',
    title: 'Key Concepts',
    slug: 'key-concepts',
    pillar: 'book',
    sort_order: 2,
    body_md: 'Key concepts are...',
    summary: null,
    estimated_read_minutes: 3,
    parent_id: 'node-1',
  },
]

const PREV_NODE = {
  id: 'prev-1',
  title: 'Preface',
  slug: 'preface',
  pillar: 'book',
  sort_order: -1,
  body_md: '',
  summary: null,
  estimated_read_minutes: 2,
  parent_id: null,
}

const NEXT_NODE = {
  id: 'next-1',
  title: 'Chapter 2: Identify',
  slug: 'ch2-identify',
  pillar: 'book',
  sort_order: 1,
  body_md: '',
  summary: null,
  estimated_read_minutes: 8,
  parent_id: null,
}

const BREADCRUMBS = [
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Book', href: '/knowledge/book' },
  { label: 'Chapter 1', href: '/knowledge/book/ch1-intro' },
]

describe('ContentReader', () => {
  it('renders data-testid on container', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByTestId('content-reader')).toBeTruthy()
  })

  it('renders node title', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByTestId('content-title').textContent).toBe('Chapter 1: Introduction')
  })

  it('renders breadcrumbs', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByTestId('breadcrumbs')).toBeTruthy()
    expect(screen.getByText('Knowledge')).toBeTruthy()
    expect(screen.getByText('Book')).toBeTruthy()
  })

  it('renders read time', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByText('5 min read')).toBeTruthy()
  })

  it('renders summary when present', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByText('An introduction to PIPS')).toBeTruthy()
  })

  it('renders section count', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={SECTIONS}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByText('2 sections')).toBeTruthy()
  })

  it('renders section titles', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={SECTIONS}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    // Titles appear in both sidebar TOC and article body
    expect(screen.getAllByText('What is PIPS?').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Key Concepts').length).toBeGreaterThanOrEqual(1)
  })

  it('renders On This Page heading when sections exist', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={SECTIONS}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByText('On This Page')).toBeTruthy()
  })

  it('renders previous navigation link', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={PREV_NODE}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    const prevLink = screen.getByTestId('nav-prev')
    expect(prevLink.getAttribute('href')).toBe('/knowledge/book/preface')
    expect(prevLink.textContent).toContain('Preface')
  })

  it('renders next navigation link', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={NEXT_NODE}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    const nextLink = screen.getByTestId('nav-next')
    expect(nextLink.getAttribute('href')).toBe('/knowledge/book/ch2-identify')
    expect(nextLink.textContent).toContain('Chapter 2: Identify')
  })

  it('renders bookmark button', () => {
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(screen.getByTestId('bookmark-btn')).toBeTruthy()
  })

  it('calls recordReadHistory on mount', async () => {
    const { recordReadHistory } = await import('@/app/(app)/knowledge/actions')
    render(
      <ContentReader
        node={BASE_NODE}
        sections={[]}
        prevNode={null}
        nextNode={null}
        breadcrumbs={BREADCRUMBS}
      />,
    )
    expect(recordReadHistory).toHaveBeenCalledWith('node-1')
  })
})
