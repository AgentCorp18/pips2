import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WelcomeCards } from '../welcome-cards'

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

describe('WelcomeCards', () => {
  it('renders the welcome-cards container', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('welcome-cards')).toBeTruthy()
  })

  it('renders the heading', () => {
    render(<WelcomeCards />)
    expect(screen.getByTestId('welcome-cards-heading')).toBeTruthy()
    expect(screen.getByText('Get started with PIPS')).toBeTruthy()
  })

  it('renders description text', () => {
    render(<WelcomeCards />)
    expect(screen.getByText(/Here are a few things you can do/)).toBeTruthy()
  })

  it('renders the Create a Project action card', () => {
    render(<WelcomeCards />)
    const card = screen.getByTestId('welcome-action-create-project')
    expect(card).toBeTruthy()
    expect(card.getAttribute('href')).toBe('/projects/new')
    expect(screen.getByText('Create a Project')).toBeTruthy()
  })

  it('renders the Explore the Methodology action card', () => {
    render(<WelcomeCards />)
    const card = screen.getByTestId('welcome-action-explore-methodology')
    expect(card).toBeTruthy()
    expect(card.getAttribute('href')).toBe('/knowledge')
    expect(screen.getByText('Explore the Methodology')).toBeTruthy()
  })

  it('renders the Invite Your Team action card', () => {
    render(<WelcomeCards />)
    const card = screen.getByTestId('welcome-action-invite-team')
    expect(card).toBeTruthy()
    expect(card.getAttribute('href')).toBe('/settings/members')
    expect(screen.getByText('Invite Your Team')).toBeTruthy()
  })

  it('renders three "Get started" links', () => {
    render(<WelcomeCards />)
    const links = screen.getAllByText('Get started')
    expect(links.length).toBe(3)
  })
})
