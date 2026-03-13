import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KnowledgeCadenceBar } from '../knowledge-cadence-bar'

const mockGetContentForContext = vi.fn()

vi.mock('@/app/(app)/knowledge/actions', () => ({
  getContentForContext: (...args: unknown[]) => mockGetContentForContext(...args),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@pips/shared', () => ({
  PILLAR_META: {
    book: { label: 'Book', description: '', pillar: 'book' },
    guide: { label: 'Guide', description: '', pillar: 'guide' },
    workbook: { label: 'Workbook', description: '', pillar: 'workbook' },
    workshop: { label: 'Workshop', description: '', pillar: 'workshop' },
  },
}))

import type { ProductContext } from '@pips/shared'

const CONTEXT: ProductContext = {
  steps: ['step-1'],
  tools: ['fishbone'],
  roles: [],
  principles: [],
}

describe('KnowledgeCadenceBar', () => {
  beforeEach(() => {
    mockGetContentForContext.mockReset()
  })

  it('renders toggle button with PIPS Knowledge text', () => {
    mockGetContentForContext.mockResolvedValue([])
    render(<KnowledgeCadenceBar context={CONTEXT} />)
    expect(screen.getByText('PIPS Knowledge')).toBeTruthy()
  })

  it('has aria-expanded attribute on toggle button', () => {
    mockGetContentForContext.mockResolvedValue([])
    render(<KnowledgeCadenceBar context={CONTEXT} />)
    const toggle = screen.getByTestId('cadence-bar-toggle')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('has data-testid on container', () => {
    mockGetContentForContext.mockResolvedValue([])
    render(<KnowledgeCadenceBar context={CONTEXT} />)
    expect(screen.getByTestId('cadence-bar')).toBeTruthy()
  })

  it('collapses content on toggle click', () => {
    mockGetContentForContext.mockResolvedValue([])
    render(<KnowledgeCadenceBar context={CONTEXT} />)
    const toggle = screen.getByTestId('cadence-bar-toggle')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('starts collapsed when defaultCollapsed is true', () => {
    mockGetContentForContext.mockResolvedValue([])
    render(<KnowledgeCadenceBar context={CONTEXT} defaultCollapsed />)
    const toggle = screen.getByTestId('cadence-bar-toggle')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('shows loading skeletons initially', () => {
    mockGetContentForContext.mockResolvedValue([])
    const { container } = render(<KnowledgeCadenceBar context={CONTEXT} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders pillar cards after loading', async () => {
    mockGetContentForContext.mockResolvedValue([
      { id: 'n1', pillar: 'book', title: 'Chapter 1', slug: 'ch1', sort_order: 0 },
    ])
    render(<KnowledgeCadenceBar context={CONTEXT} />)

    await waitFor(() => {
      expect(screen.getByText('Book')).toBeTruthy()
    })
  })

  it('renders "Coming soon" for pillars without content', async () => {
    mockGetContentForContext.mockResolvedValue([
      { id: 'n1', pillar: 'book', title: 'Chapter 1', slug: 'ch1', sort_order: 0 },
    ])
    render(<KnowledgeCadenceBar context={CONTEXT} />)

    await waitFor(() => {
      const comingSoon = screen.getAllByText('Coming soon')
      expect(comingSoon.length).toBe(3) // guide, workbook, workshop
    })
  })

  it('calls getContentForContext with steps and tools', () => {
    mockGetContentForContext.mockResolvedValue([])
    render(<KnowledgeCadenceBar context={CONTEXT} />)
    expect(mockGetContentForContext).toHaveBeenCalledWith(['step-1'], ['fishbone'])
  })

  it('renders nothing when no content and not loading', async () => {
    mockGetContentForContext.mockResolvedValue([])
    const { container } = render(<KnowledgeCadenceBar context={CONTEXT} />)

    await waitFor(() => {
      // The component should return null if no content
      const card = container.querySelector('[data-testid="cadence-bar"]')
      expect(card).toBeNull()
    })
  })

  it('renders nav element when content is loaded', async () => {
    mockGetContentForContext.mockResolvedValue([
      { id: 'n1', pillar: 'book', title: 'Chapter 1', slug: 'ch1', sort_order: 0 },
    ])
    render(<KnowledgeCadenceBar context={CONTEXT} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Related knowledge content')).toBeTruthy()
    })
  })
})
