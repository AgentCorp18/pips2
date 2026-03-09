import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PresentationsPage } from './page'

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

describe('PresentationsPage', () => {
  it('renders the page with data-testid', () => {
    render(<PresentationsPage />)
    expect(screen.getByTestId('presentations-page')).toBeInTheDocument()
  })

  it('renders the heading', () => {
    render(<PresentationsPage />)
    expect(screen.getByText('Presenting to Leadership')).toBeInTheDocument()
  })

  it('renders breadcrumb with correct labels', () => {
    render(<PresentationsPage />)
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument()
    expect(screen.getByText('Guide')).toBeInTheDocument()
    expect(screen.getByText('Presentations')).toBeInTheDocument()
  })

  it('renders all 5 principle cards', () => {
    render(<PresentationsPage />)
    expect(screen.getByTestId('presentation-principle-0')).toBeInTheDocument()
    expect(screen.getByTestId('presentation-principle-1')).toBeInTheDocument()
    expect(screen.getByTestId('presentation-principle-2')).toBeInTheDocument()
    expect(screen.getByTestId('presentation-principle-3')).toBeInTheDocument()
    expect(screen.getByTestId('presentation-principle-4')).toBeInTheDocument()
  })

  it('renders principle names', () => {
    render(<PresentationsPage />)
    expect(screen.getByText('Lead with Impact')).toBeInTheDocument()
    expect(screen.getByText('Show the Data')).toBeInTheDocument()
    expect(screen.getByText('Tell the Story')).toBeInTheDocument()
    expect(screen.getByText('Acknowledge the Team')).toBeInTheDocument()
    expect(screen.getByText('Propose Next Steps')).toBeInTheDocument()
  })

  it('renders the tips section', () => {
    render(<PresentationsPage />)
    expect(screen.getByText('Preparation Tips')).toBeInTheDocument()
  })

  it('renders the intro text', () => {
    render(<PresentationsPage />)
    expect(
      screen.getByText(/The best improvement work fails if leadership never hears about it/),
    ).toBeInTheDocument()
  })
})
