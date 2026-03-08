import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MethodologySection } from '../methodology-section'

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

describe('MethodologySection', () => {
  it('renders section heading', () => {
    render(<MethodologySection />)
    expect(screen.getByText('Six Steps to Better Processes')).toBeTruthy()
  })

  it('renders heading as h2', () => {
    render(<MethodologySection />)
    expect(screen.getByText('Six Steps to Better Processes').tagName).toBe('H2')
  })

  it('renders overline text', () => {
    render(<MethodologySection />)
    expect(screen.getByText('The PIPS Framework')).toBeTruthy()
  })

  it('renders description', () => {
    render(<MethodologySection />)
    expect(screen.getByText(/proven methodology that transforms/)).toBeTruthy()
  })

  it('renders all 6 step names', () => {
    render(<MethodologySection />)
    expect(screen.getByText('Identify')).toBeTruthy()
    expect(screen.getByText('Analyze')).toBeTruthy()
    expect(screen.getByText('Generate')).toBeTruthy()
    expect(screen.getByText('Select & Plan')).toBeTruthy()
    expect(screen.getByText('Implement')).toBeTruthy()
    expect(screen.getByText('Evaluate')).toBeTruthy()
  })

  it('renders step numbers 1-6', () => {
    render(<MethodologySection />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(String(i))).toBeTruthy()
    }
  })

  it('renders 6 step cards as h3', () => {
    render(<MethodologySection />)
    const names = ['Identify', 'Analyze', 'Generate', 'Select & Plan', 'Implement', 'Evaluate']
    names.forEach((name) => {
      expect(screen.getByText(name).tagName).toBe('H3')
    })
  })

  it('renders step cards as links to methodology steps', () => {
    render(<MethodologySection />)
    const link1 = screen.getByText('Identify').closest('a')
    expect(link1?.getAttribute('href')).toBe('/methodology/step/1')
  })

  it('renders section with methodology id', () => {
    const { container } = render(<MethodologySection />)
    expect(container.querySelector('section#methodology')).toBeTruthy()
  })
})
