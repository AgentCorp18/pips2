import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '../../ui/skeleton'

describe('Skeleton', () => {
  it('renders a div element', () => {
    render(<Skeleton data-testid="skeleton" />)
    const el = screen.getByTestId('skeleton')
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe('DIV')
  })

  it('applies the base animate-pulse class', () => {
    render(<Skeleton data-testid="skeleton" />)
    const el = screen.getByTestId('skeleton')
    expect(el.className).toContain('animate-pulse')
  })

  it('merges custom className with base classes', () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-full" />)
    const el = screen.getByTestId('skeleton')
    expect(el.className).toContain('animate-pulse')
    expect(el.className).toContain('h-4')
    expect(el.className).toContain('w-full')
  })

  it('passes through additional props', () => {
    render(<Skeleton data-testid="skeleton" aria-label="Loading" />)
    const el = screen.getByTestId('skeleton')
    expect(el).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with custom style', () => {
    render(<Skeleton data-testid="skeleton" style={{ height: '20px', width: '100px' }} />)
    const el = screen.getByTestId('skeleton')
    expect(el).toHaveStyle({ height: '20px', width: '100px' })
  })

  it('renders children when provided', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading text</span>
      </Skeleton>,
    )
    expect(screen.getByText('Loading text')).toBeInTheDocument()
  })
})
