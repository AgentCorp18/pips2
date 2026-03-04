import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrainingMultipleChoice } from '../training-multiple-choice'

const DEFAULT_CONFIG = {
  question: 'What is the first PIPS step?',
  options: ['Identify', 'Analyze', 'Generate', 'Select'],
  correctIndex: 0,
}

describe('TrainingMultipleChoice', () => {
  let onComplete: (selectedIndex: number, isCorrect: boolean) => void

  beforeEach(() => {
    onComplete = vi.fn()
  })

  it('renders the question', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByText('What is the first PIPS step?')).toBeTruthy()
  })

  it('renders all options', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByText('Identify')).toBeTruthy()
    expect(screen.getByText('Analyze')).toBeTruthy()
    expect(screen.getByText('Generate')).toBeTruthy()
    expect(screen.getByText('Select')).toBeTruthy()
  })

  it('renders option letters (A, B, C, D)', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
    expect(screen.getByText('C')).toBeTruthy()
    expect(screen.getByText('D')).toBeTruthy()
  })

  it('renders a radiogroup with radio buttons', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByRole('radiogroup')).toBeTruthy()
    const radios = screen.getAllByRole('radio')
    expect(radios.length).toBe(4)
  })

  it('shows Submit Answer button initially', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByText('Submit Answer')).toBeTruthy()
  })

  it('disables Submit button when no option selected', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    const submitBtn = screen.getByText('Submit Answer')
    expect(submitBtn.closest('button')?.disabled).toBe(true)
  })

  it('enables Submit button after selecting an option', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Identify'))
    const submitBtn = screen.getByText('Submit Answer')
    expect(submitBtn.closest('button')?.disabled).toBe(false)
  })

  it('calls onComplete with correct answer on submit', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Identify'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(onComplete).toHaveBeenCalledWith(0, true)
  })

  it('calls onComplete with incorrect answer on submit', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Analyze'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(onComplete).toHaveBeenCalledWith(1, false)
  })

  it('shows "Correct!" feedback for right answer', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Identify'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(screen.getByRole('alert').textContent).toContain('Correct')
  })

  it('shows correct answer feedback for wrong answer', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Generate'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(screen.getByRole('alert').textContent).toContain('Identify')
  })

  it('hides Submit button after submission', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Identify'))
    fireEvent.click(screen.getByText('Submit Answer'))
    expect(screen.queryByText('Submit Answer')).toBeNull()
  })

  it('disables options after submission', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Identify'))
    fireEvent.click(screen.getByText('Submit Answer'))
    const radios = screen.getAllByRole('radio')
    radios.forEach((radio) => {
      expect((radio as HTMLButtonElement).disabled).toBe(true)
    })
  })

  it('renders in submitted state with savedAnswer', () => {
    render(
      <TrainingMultipleChoice config={DEFAULT_CONFIG} savedAnswer={0} onComplete={onComplete} />,
    )
    // Should show feedback, not submit button
    expect(screen.queryByText('Submit Answer')).toBeNull()
    expect(screen.getByRole('alert')).toBeTruthy()
  })

  it('has data-testid on container', () => {
    render(<TrainingMultipleChoice config={DEFAULT_CONFIG} onComplete={onComplete} />)
    expect(screen.getByTestId('multiple-choice')).toBeTruthy()
  })
})
