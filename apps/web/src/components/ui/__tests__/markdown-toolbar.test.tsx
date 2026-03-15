import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { MarkdownToolbar } from '../markdown-toolbar'

describe('MarkdownToolbar', () => {
  it('renders all toolbar buttons', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<MarkdownToolbar textareaRef={ref} onChange={vi.fn()} />)

    expect(screen.getByTestId('markdown-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-bold')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-italic')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-heading')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-bullet-list')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-numbered-list')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-quote')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-code')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-link')).toBeInTheDocument()
  })

  it('applies bold formatting when bold button is clicked', async () => {
    const onChange = vi.fn()
    const textarea = document.createElement('textarea')
    textarea.value = 'hello world'
    textarea.selectionStart = 6
    textarea.selectionEnd = 11

    const ref = { current: textarea }
    const user = userEvent.setup()

    render(<MarkdownToolbar textareaRef={ref} onChange={onChange} />)

    await user.click(screen.getByTestId('markdown-bold'))

    expect(onChange).toHaveBeenCalledWith('hello **world**')
  })

  it('applies italic formatting', async () => {
    const onChange = vi.fn()
    const textarea = document.createElement('textarea')
    textarea.value = 'hello world'
    textarea.selectionStart = 6
    textarea.selectionEnd = 11

    const ref = { current: textarea }
    const user = userEvent.setup()

    render(<MarkdownToolbar textareaRef={ref} onChange={onChange} />)

    await user.click(screen.getByTestId('markdown-italic'))

    expect(onChange).toHaveBeenCalledWith('hello _world_')
  })

  it('inserts placeholder text when no selection', async () => {
    const onChange = vi.fn()
    const textarea = document.createElement('textarea')
    textarea.value = 'hello '
    textarea.selectionStart = 6
    textarea.selectionEnd = 6

    const ref = { current: textarea }
    const user = userEvent.setup()

    render(<MarkdownToolbar textareaRef={ref} onChange={onChange} />)

    await user.click(screen.getByTestId('markdown-bold'))

    expect(onChange).toHaveBeenCalledWith('hello **bold text**')
  })

  it('adds heading prefix to current line', async () => {
    const onChange = vi.fn()
    const textarea = document.createElement('textarea')
    textarea.value = 'Title here'
    textarea.selectionStart = 5
    textarea.selectionEnd = 5

    const ref = { current: textarea }
    const user = userEvent.setup()

    render(<MarkdownToolbar textareaRef={ref} onChange={onChange} />)

    await user.click(screen.getByTestId('markdown-heading'))

    expect(onChange).toHaveBeenCalledWith('## Title here')
  })

  it('disables buttons when disabled prop is true', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<MarkdownToolbar textareaRef={ref} onChange={vi.fn()} disabled />)

    const boldButton = screen.getByTestId('markdown-bold')
    expect(boldButton).toBeDisabled()
  })
})
