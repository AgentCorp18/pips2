import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickCreateFab } from '../quick-create-fab'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('QuickCreateFab', () => {
  it('renders the FAB trigger button', () => {
    render(<QuickCreateFab />)
    expect(screen.getByTestId('fab-trigger')).toBeTruthy()
  })

  it('has correct aria-label when closed', () => {
    render(<QuickCreateFab />)
    expect(screen.getByLabelText('Open quick create menu')).toBeTruthy()
  })

  it('does not show menu items when closed', () => {
    render(<QuickCreateFab />)
    expect(screen.queryByTestId('fab-menu')).toBeNull()
  })

  it('shows menu items when trigger is clicked', () => {
    render(<QuickCreateFab />)
    fireEvent.click(screen.getByTestId('fab-trigger'))
    expect(screen.getByTestId('fab-menu')).toBeTruthy()
  })

  it('shows New Ticket link in menu', () => {
    render(<QuickCreateFab />)
    fireEvent.click(screen.getByTestId('fab-trigger'))
    const link = screen.getByTestId('fab-new-ticket')
    expect(link.getAttribute('href')).toBe('/tickets/new')
    expect(screen.getByText('New Ticket')).toBeTruthy()
  })

  it('shows New Project link in menu', () => {
    render(<QuickCreateFab />)
    fireEvent.click(screen.getByTestId('fab-trigger'))
    const link = screen.getByTestId('fab-new-project')
    expect(link.getAttribute('href')).toBe('/projects/new')
    expect(screen.getByText('New Project')).toBeTruthy()
  })

  it('changes aria-label when opened', () => {
    render(<QuickCreateFab />)
    fireEvent.click(screen.getByTestId('fab-trigger'))
    expect(screen.getByLabelText('Close quick create menu')).toBeTruthy()
  })

  it('closes menu when trigger is clicked again', () => {
    render(<QuickCreateFab />)
    fireEvent.click(screen.getByTestId('fab-trigger'))
    expect(screen.getByTestId('fab-menu')).toBeTruthy()
    fireEvent.click(screen.getByTestId('fab-trigger'))
    expect(screen.queryByTestId('fab-menu')).toBeNull()
  })
})
