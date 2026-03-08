import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyTakeaway } from '../key-takeaway'

describe('KeyTakeaway', () => {
  it('renders children content', () => {
    render(<KeyTakeaway>Important takeaway here</KeyTakeaway>)
    expect(screen.getByText('Important takeaway here')).toBeInTheDocument()
  })

  it('renders "Key Takeaway" label', () => {
    render(<KeyTakeaway>Content</KeyTakeaway>)
    expect(screen.getByText('Key Takeaway')).toBeInTheDocument()
  })

  it('has data-testid', () => {
    render(<KeyTakeaway>Content</KeyTakeaway>)
    expect(screen.getByTestId('key-takeaway')).toBeInTheDocument()
  })

  it('applies stepColor to border', () => {
    render(<KeyTakeaway stepColor="#3B82F6">Content</KeyTakeaway>)
    const el = screen.getByTestId('key-takeaway')
    expect(el.style.borderColor).toBe('rgb(59, 130, 246)')
  })

  it('applies custom className', () => {
    render(<KeyTakeaway className="my-class">Content</KeyTakeaway>)
    expect(screen.getByTestId('key-takeaway')).toHaveClass('my-class')
  })
})
