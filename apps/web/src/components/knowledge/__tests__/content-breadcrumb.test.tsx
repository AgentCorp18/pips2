import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContentBreadcrumb } from '../content-breadcrumb'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('ContentBreadcrumb', () => {
  const items = [
    { label: 'Knowledge Hub', href: '/knowledge' },
    { label: 'Book', href: '/knowledge/book' },
    { label: 'Chapter 1', href: '/knowledge/book/chapter-1' },
  ]

  it('renders all breadcrumb items', () => {
    render(<ContentBreadcrumb items={items} />)
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument()
    expect(screen.getByText('Book')).toBeInTheDocument()
    expect(screen.getByText('Chapter 1')).toBeInTheDocument()
  })

  it('renders last item as non-link with aria-current', () => {
    render(<ContentBreadcrumb items={items} />)
    const lastItem = screen.getByText('Chapter 1')
    expect(lastItem).toHaveAttribute('aria-current', 'page')
    expect(lastItem.tagName).toBe('SPAN')
  })

  it('renders non-last items as links', () => {
    render(<ContentBreadcrumb items={items} />)
    const hubLink = screen.getByText('Knowledge Hub')
    expect(hubLink.tagName).toBe('A')
    expect(hubLink).toHaveAttribute('href', '/knowledge')
  })

  it('renders separator between items', () => {
    render(<ContentBreadcrumb items={items} />)
    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2)
  })

  it('has breadcrumb nav with aria-label', () => {
    render(<ContentBreadcrumb items={items} />)
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
  })
})
