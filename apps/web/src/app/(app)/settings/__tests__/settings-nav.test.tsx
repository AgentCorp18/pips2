import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsNav } from '../settings-nav'

let mockPathname = '/settings'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

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

describe('SettingsNav', () => {
  it('renders General link', () => {
    render(<SettingsNav />)
    expect(screen.getByText('General')).toBeTruthy()
  })

  it('renders Members link', () => {
    render(<SettingsNav />)
    expect(screen.getByText('Members')).toBeTruthy()
  })

  it('renders Notifications link', () => {
    render(<SettingsNav />)
    expect(screen.getByText('Notifications')).toBeTruthy()
  })

  it('hides Audit Log link for non-admin', () => {
    render(<SettingsNav />)
    expect(screen.queryByText('Audit Log')).toBeNull()
  })

  it('renders Audit Log link for admin', () => {
    render(<SettingsNav role="admin" />)
    expect(screen.getByText('Audit Log')).toBeTruthy()
  })

  it('renders nav element', () => {
    const { container } = render(<SettingsNav />)
    expect(container.querySelector('nav')).toBeTruthy()
  })

  it('links to correct paths', () => {
    render(<SettingsNav role="owner" />)
    expect(screen.getByText('General').closest('a')?.getAttribute('href')).toBe('/settings')
    expect(screen.getByText('Members').closest('a')?.getAttribute('href')).toBe('/settings/members')
    expect(screen.getByText('Notifications').closest('a')?.getAttribute('href')).toBe(
      '/settings/notifications',
    )
    expect(screen.getByText('Audit Log').closest('a')?.getAttribute('href')).toBe(
      '/settings/audit-log',
    )
  })

  it('highlights active General tab', () => {
    mockPathname = '/settings'
    render(<SettingsNav />)
    const generalLink = screen.getByText('General').closest('a')
    expect(generalLink?.className).toContain('border-[var(--color-primary)]')
  })

  it('highlights active Members tab', () => {
    mockPathname = '/settings/members'
    render(<SettingsNav />)
    const membersLink = screen.getByText('Members').closest('a')
    expect(membersLink?.className).toContain('border-[var(--color-primary)]')
  })

  it('hides Permissions link for non-admin', () => {
    render(<SettingsNav />)
    expect(screen.queryByText('Permissions')).toBeNull()
  })

  it('renders Permissions link for admin', () => {
    render(<SettingsNav role="admin" />)
    expect(screen.getByText('Permissions')).toBeTruthy()
    expect(screen.getByText('Permissions').closest('a')?.getAttribute('href')).toBe(
      '/settings/permissions',
    )
  })

  it('hides Admin link for non-admin', () => {
    render(<SettingsNav />)
    expect(screen.queryByText('Admin')).toBeNull()
  })

  it('renders Admin link for owner', () => {
    render(<SettingsNav role="owner" />)
    expect(screen.getByText('Admin')).toBeTruthy()
    expect(screen.getByText('Admin').closest('a')?.getAttribute('href')).toBe('/settings/admin')
  })

  it('highlights active Admin tab', () => {
    mockPathname = '/settings/admin'
    render(<SettingsNav role="admin" />)
    const adminLink = screen.getByText('Admin').closest('a')
    expect(adminLink?.className).toContain('border-[var(--color-primary)]')
  })
})
