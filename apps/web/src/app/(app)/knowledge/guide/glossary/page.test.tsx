import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlossaryPage } from './page'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/knowledge/content-breadcrumb', () => ({
  ContentBreadcrumb: ({ items }: { items: { label: string }[] }) => (
    <nav data-testid="breadcrumb">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
}))

describe('GlossaryPage', () => {
  it('renders the page with data-testid', () => {
    render(<GlossaryPage />)
    expect(screen.getByTestId('glossary-page')).toBeInTheDocument()
  })

  it('renders the heading', () => {
    render(<GlossaryPage />)
    expect(screen.getByText('PIPS Glossary')).toBeInTheDocument()
  })

  it('renders breadcrumb with correct labels', () => {
    render(<GlossaryPage />)
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument()
    expect(screen.getByText('Guide')).toBeInTheDocument()
    expect(screen.getByText('Glossary')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    render(<GlossaryPage />)
    expect(screen.getByTestId('glossary-search')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search terms...')).toBeInTheDocument()
  })

  it('renders glossary terms', () => {
    render(<GlossaryPage />)
    expect(screen.getByTestId('glossary-term-0')).toBeInTheDocument()
  })

  it('renders the PIPS term', () => {
    render(<GlossaryPage />)
    expect(screen.getByText('PIPS')).toBeInTheDocument()
  })

  it('filters terms when searching', () => {
    render(<GlossaryPage />)
    const searchInput = screen.getByTestId('glossary-search')
    fireEvent.change(searchInput, { target: { value: 'PIPS' } })
    expect(screen.getByText('PIPS')).toBeInTheDocument()
  })

  it('shows no-results message for unmatched search', () => {
    render(<GlossaryPage />)
    const searchInput = screen.getByTestId('glossary-search')
    fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } })
    expect(screen.getByText('No terms match your search.')).toBeInTheDocument()
  })

  it('displays term count in subtitle', () => {
    render(<GlossaryPage />)
    expect(screen.getByText(/terms across the PIPS methodology/)).toBeInTheDocument()
  })
})
