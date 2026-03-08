import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollProgressBar } from '../scroll-progress-bar'

describe('ScrollProgressBar', () => {
  it('renders the progress bar container', () => {
    render(<ScrollProgressBar />)
    expect(screen.getByTestId('scroll-progress-bar')).toBeInTheDocument()
  })

  it('starts at 0% width', () => {
    render(<ScrollProgressBar />)
    const bar = screen.getByTestId('scroll-progress-bar')
    const inner = bar.firstElementChild as HTMLElement
    expect(inner.style.width).toBe('0%')
  })
})
