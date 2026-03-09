import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import ToolsPage from './page'

describe('ToolsPage', () => {
  it('renders the heading', () => {
    render(<ToolsPage />)
    expect(screen.getByText('Tools Library')).toBeInTheDocument()
  })

  it('renders the filter bar', () => {
    render(<ToolsPage />)
    expect(screen.getByTestId('tools-filter-bar')).toBeInTheDocument()
    expect(screen.getByTestId('tools-filter-all')).toBeInTheDocument()
  })

  it('renders step filter buttons', () => {
    render(<ToolsPage />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByTestId(`tools-filter-${i}`)).toBeInTheDocument()
    }
  })

  it('renders tool cards', () => {
    render(<ToolsPage />)
    expect(screen.getByTestId('tool-card-problem-statement')).toBeInTheDocument()
    expect(screen.getByText('Problem Statement')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation', () => {
    render(<ToolsPage />)
    expect(screen.getByText('Knowledge Hub')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
  })

  it('renders the back to guide link', () => {
    render(<ToolsPage />)
    const backLink = screen.getByText(/Back to Guide/)
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/knowledge/guide')
  })

  it('filters tools when a step filter is clicked', () => {
    render(<ToolsPage />)
    const step1Button = screen.getByTestId('tools-filter-1')
    fireEvent.click(step1Button)
    // Problem Statement should still be visible (it's a Step 1 tool)
    expect(screen.getByText('Problem Statement')).toBeInTheDocument()
  })

  it('shows tool count in subtitle', () => {
    render(<ToolsPage />)
    expect(screen.getByText(/tools across the 6 PIPS steps/)).toBeInTheDocument()
  })
})
