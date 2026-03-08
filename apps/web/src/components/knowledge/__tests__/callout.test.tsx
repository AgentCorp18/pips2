import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Callout } from '../callout'

describe('Callout', () => {
  it('renders with default note variant', () => {
    render(<Callout>Some note content</Callout>)
    expect(screen.getByTestId('callout-note')).toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
    expect(screen.getByText('Some note content')).toBeInTheDocument()
  })

  it('renders tip variant', () => {
    render(<Callout variant="tip">A helpful tip</Callout>)
    expect(screen.getByTestId('callout-tip')).toBeInTheDocument()
    expect(screen.getByText('Tip')).toBeInTheDocument()
  })

  it('renders warning variant', () => {
    render(<Callout variant="warning">Be careful</Callout>)
    expect(screen.getByTestId('callout-warning')).toBeInTheDocument()
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('renders success variant', () => {
    render(<Callout variant="success">Well done</Callout>)
    expect(screen.getByTestId('callout-success')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
  })

  it('uses custom title when provided', () => {
    render(
      <Callout variant="tip" title="Custom Title">
        Content
      </Callout>,
    )
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.queryByText('Tip')).not.toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Callout variant="note">
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </Callout>,
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Callout className="my-custom-class">Content</Callout>)
    expect(screen.getByTestId('callout-note')).toHaveClass('my-custom-class')
  })

  it('has aria-hidden icon', () => {
    const { container } = render(<Callout>Content</Callout>)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
