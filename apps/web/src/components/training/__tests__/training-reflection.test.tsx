import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrainingReflection } from '../training-reflection'

const DEFAULT_CONFIG = { prompt: 'Reflect on the PIPS methodology.', minWords: 5 }

describe('TrainingReflection', () => {
  let onComplete: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onComplete = vi.fn()
  })

  it('renders the prompt', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByText('Reflect on the PIPS methodology.')).toBeTruthy()
  })

  it('renders a textarea with aria-label', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeTruthy()
    expect(textarea.getAttribute('aria-label')).toBe('Reflection response')
  })

  it('shows word count indicator', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByText('0/5 words minimum')).toBeTruthy()
  })

  it('updates word count as user types', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'one two three' } })
    expect(screen.getByText('3/5 words minimum')).toBeTruthy()
  })

  it('disables Submit button when below word minimum', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'too short' } })
    const submitBtn = screen.getByText('Submit Reflection')
    expect(submitBtn.closest('button')?.disabled).toBe(true)
  })

  it('enables Submit button when word minimum met', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'one two three four five' } })
    const submitBtn = screen.getByText('Submit Reflection')
    expect(submitBtn.closest('button')?.disabled).toBe(false)
  })

  it('calls onComplete with text on submit', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'one two three four five' } })
    fireEvent.click(screen.getByText('Submit Reflection'))
    expect(onComplete).toHaveBeenCalledWith('one two three four five')
  })

  it('shows submitted state after submission', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'one two three four five' } })
    fireEvent.click(screen.getByText('Submit Reflection'))
    expect(screen.getByText('Reflection submitted')).toBeTruthy()
  })

  it('shows Edit Response button after submission', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'one two three four five' } })
    fireEvent.click(screen.getByText('Submit Reflection'))
    expect(screen.getByText('Edit Response')).toBeTruthy()
  })

  it('returns to editing on Edit Response click', () => {
    render(<TrainingReflection config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'one two three four five' } })
    fireEvent.click(screen.getByText('Submit Reflection'))
    fireEvent.click(screen.getByText('Edit Response'))
    // Should show textarea again
    expect(screen.getByRole('textbox')).toBeTruthy()
    expect(screen.getByText('Submit Reflection')).toBeTruthy()
  })

  it('renders in submitted state with savedText', () => {
    render(
      <TrainingReflection
        config={DEFAULT_CONFIG}
        savedText="previously saved reflection"
        onComplete={onComplete}
      />,
    )
    expect(screen.getByText('Reflection submitted')).toBeTruthy()
    expect(screen.getByText('previously saved reflection')).toBeTruthy()
  })

  it('uses default minWords of 20 when not specified', () => {
    render(<TrainingReflection config={{ prompt: 'Write something' }} onComplete={onComplete} />)
    expect(screen.getByText('0/20 words minimum')).toBeTruthy()
  })
})
