import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormTextarea } from '../form-textarea'

describe('FormTextarea', () => {
  const defaultProps = {
    id: 'test-textarea',
    label: 'Description',
    value: '',
    onChange: vi.fn(),
  }

  it('renders the label', () => {
    render(<FormTextarea {...defaultProps} />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders the textarea with the correct id', () => {
    render(<FormTextarea {...defaultProps} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'test-textarea')
  })

  it('renders the textarea with the provided value', () => {
    render(<FormTextarea {...defaultProps} value="Hello world" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Hello world')
  })

  it('calls onChange when text is typed', () => {
    const onChange = vi.fn()
    render(<FormTextarea {...defaultProps} onChange={onChange} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'New text' } })
    expect(onChange).toHaveBeenCalledWith('New text')
  })

  it('renders the placeholder', () => {
    render(<FormTextarea {...defaultProps} placeholder="Enter description..." />)
    const textarea = screen.getByPlaceholderText('Enter description...')
    expect(textarea).toBeInTheDocument()
  })

  it('renders the helper text', () => {
    render(<FormTextarea {...defaultProps} helperText="Keep it concise" />)
    expect(screen.getByText('Keep it concise')).toBeInTheDocument()
  })

  it('does not render helper text when not provided', () => {
    render(<FormTextarea {...defaultProps} />)
    // Only the character count element should exist
    expect(screen.getByText('0/2000')).toBeInTheDocument()
  })

  it('shows character count with default maxLength of 2000', () => {
    render(<FormTextarea {...defaultProps} value="Hello" />)
    expect(screen.getByText('5/2000')).toBeInTheDocument()
  })

  it('shows character count with custom maxLength', () => {
    render(<FormTextarea {...defaultProps} value="Hello" maxLength={500} />)
    expect(screen.getByText('5/500')).toBeInTheDocument()
  })

  it('sets the correct number of rows', () => {
    render(<FormTextarea {...defaultProps} rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('uses default rows of 3', () => {
    render(<FormTextarea {...defaultProps} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '3')
  })

  it('shows required asterisk when required is true', () => {
    render(<FormTextarea {...defaultProps} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show required asterisk when required is false', () => {
    render(<FormTextarea {...defaultProps} required={false} />)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('sets maxLength attribute on the textarea element', () => {
    render(<FormTextarea {...defaultProps} maxLength={100} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })

  it('associates label with textarea via htmlFor', () => {
    render(<FormTextarea {...defaultProps} />)
    const label = screen.getByText('Description')
    expect(label).toHaveAttribute('for', 'test-textarea')
  })
})
