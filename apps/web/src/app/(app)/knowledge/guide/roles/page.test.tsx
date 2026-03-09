import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RolesPage } from './page'

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

describe('RolesPage', () => {
  it('renders the page with data-testid', () => {
    render(<RolesPage />)
    expect(screen.getByTestId('roles-page')).toBeInTheDocument()
  })

  it('renders the heading', () => {
    render(<RolesPage />)
    expect(screen.getByText('Roles & Responsibilities')).toBeInTheDocument()
  })

  it('renders breadcrumb with correct labels', () => {
    render(<RolesPage />)
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument()
    expect(screen.getByText('Guide')).toBeInTheDocument()
    expect(screen.getByText('Roles')).toBeInTheDocument()
  })

  it('renders role cards from GUIDE_ROLES data', () => {
    render(<RolesPage />)
    expect(screen.getByTestId('role-card-0')).toBeInTheDocument()
    expect(screen.getByText('Leader')).toBeInTheDocument()
  })

  it('renders the adapting roles section', () => {
    render(<RolesPage />)
    expect(screen.getByText('Adapting Roles for Small Teams')).toBeInTheDocument()
  })

  it('renders the intro text', () => {
    render(<RolesPage />)
    expect(screen.getByText(/A PIPS improvement team works best/)).toBeInTheDocument()
  })
})
