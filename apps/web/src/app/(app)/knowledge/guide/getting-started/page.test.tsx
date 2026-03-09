import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GettingStartedPage } from './page'

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

describe('GettingStartedPage', () => {
  it('renders the page with data-testid', () => {
    render(<GettingStartedPage />)
    expect(screen.getByTestId('getting-started-page')).toBeInTheDocument()
  })

  it('renders the heading', () => {
    render(<GettingStartedPage />)
    expect(screen.getByText('Getting Started with PIPS')).toBeInTheDocument()
  })

  it('renders breadcrumb with correct labels', () => {
    render(<GettingStartedPage />)
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument()
    expect(screen.getByText('Guide')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  it('renders timeline steps', () => {
    render(<GettingStartedPage />)
    expect(screen.getByTestId('getting-started-step-0')).toBeInTheDocument()
  })

  it('renders the first step title', () => {
    render(<GettingStartedPage />)
    expect(screen.getByText('Assemble Your Team')).toBeInTheDocument()
  })

  it('renders the CTA section', () => {
    render(<GettingStartedPage />)
    expect(screen.getByText('Ready to begin?')).toBeInTheDocument()
    expect(screen.getByText('Create your first project')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<GettingStartedPage />)
    expect(
      screen.getByText('From team assembly to your first improvement cycle'),
    ).toBeInTheDocument()
  })
})
