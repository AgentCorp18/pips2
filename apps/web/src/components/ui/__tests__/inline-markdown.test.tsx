import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InlineMarkdown } from '../inline-markdown'

describe('InlineMarkdown', () => {
  it('renders plain text without markdown parser', () => {
    render(<InlineMarkdown content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByTestId('inline-markdown')).not.toBeInTheDocument()
  })

  it('renders markdown content with parser', () => {
    render(<InlineMarkdown content="**bold text**" />)
    expect(screen.getByTestId('inline-markdown')).toBeInTheDocument()
    expect(screen.getByText('bold text')).toBeInTheDocument()
  })

  it('renders italic text', () => {
    render(<InlineMarkdown content="_italic_" />)
    expect(screen.getByText('italic')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<InlineMarkdown content="Use `console.log` for debugging" />)
    expect(screen.getByText('console.log')).toBeInTheDocument()
  })

  it('renders bullet lists', () => {
    render(<InlineMarkdown content={'- Item 1\n- Item 2'} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders links', () => {
    render(<InlineMarkdown content="[Google](https://google.com)" />)
    const link = screen.getByRole('link', { name: 'Google' })
    expect(link).toHaveAttribute('href', 'https://google.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders blockquotes', () => {
    render(<InlineMarkdown content="> This is a quote" />)
    expect(screen.getByText('This is a quote')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<InlineMarkdown content="text" className="custom-class" />)
    const el = screen.getByText('text')
    expect(el.className).toContain('custom-class')
  })

  it('renders headings from markdown', () => {
    render(<InlineMarkdown content="## Section Title" />)
    expect(screen.getByText('Section Title')).toBeInTheDocument()
  })
})
