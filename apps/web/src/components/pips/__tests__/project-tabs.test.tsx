import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectTabs } from '../project-tabs'

/* ============================================================
   Mocks
   ============================================================ */

const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

/* ============================================================
   Tests
   ============================================================ */

describe('ProjectTabs', () => {
  /* ---- Basic rendering ---- */

  it('renders three tab links', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
  })

  it('renders Overview tab', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('renders Board tab', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    expect(screen.getByText('Board')).toBeInTheDocument()
  })

  it('renders Forms tab', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    expect(screen.getByText('Forms')).toBeInTheDocument()
  })

  /* ---- Tab hrefs ---- */

  it('Overview tab links to project root', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    const link = screen.getByText('Overview').closest('a')
    expect(link).toHaveAttribute('href', '/projects/proj-1')
  })

  it('Board tab links to project board page', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    const link = screen.getByText('Board').closest('a')
    expect(link).toHaveAttribute('href', '/projects/proj-1/board')
  })

  it('Forms tab links to project forms page', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    const link = screen.getByText('Forms').closest('a')
    expect(link).toHaveAttribute('href', '/projects/proj-1/forms')
  })

  /* ---- Active tab highlighting ---- */

  it('uses different projectId in href', () => {
    mockPathname.mockReturnValue('/projects/abc-123')
    render(<ProjectTabs projectId="abc-123" />)
    const overviewLink = screen.getByText('Overview').closest('a')
    expect(overviewLink).toHaveAttribute('href', '/projects/abc-123')
    const boardLink = screen.getByText('Board').closest('a')
    expect(boardLink).toHaveAttribute('href', '/projects/abc-123/board')
  })

  it('renders navigation element', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders SVG icons for each tab', () => {
    mockPathname.mockReturnValue('/projects/proj-1')
    render(<ProjectTabs projectId="proj-1" />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs).toHaveLength(3)
  })
})
