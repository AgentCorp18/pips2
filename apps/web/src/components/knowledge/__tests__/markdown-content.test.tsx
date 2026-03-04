import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownContent } from '../markdown-content'

describe('MarkdownContent', () => {
  it('renders paragraph text', () => {
    render(<MarkdownContent content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeTruthy()
  })

  it('renders heading elements', () => {
    const { container } = render(<MarkdownContent content="## Section Title" />)
    const h2 = container.querySelector('h2')
    expect(h2).toBeTruthy()
    expect(h2?.textContent).toContain('Section Title')
  })

  it('renders links', () => {
    render(<MarkdownContent content="[PIPS](https://example.com)" />)
    const link = screen.getByText('PIPS')
    expect(link.closest('a')?.getAttribute('href')).toBe('https://example.com')
  })

  it('adds target _blank for external links', () => {
    render(<MarkdownContent content="[External](https://example.com)" />)
    const link = screen.getByText('External').closest('a')
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toContain('noopener')
  })

  it('does not add target _blank for internal links', () => {
    render(<MarkdownContent content="[Internal](/about)" />)
    const link = screen.getByText('Internal').closest('a')
    expect(link?.getAttribute('target')).toBeNull()
  })

  it('renders bold text', () => {
    render(<MarkdownContent content="This is **bold** text" />)
    const strong = screen.getByText('bold')
    expect(strong.tagName).toBe('STRONG')
  })

  it('renders tables with overflow wrapper', () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |'
    const { container } = render(<MarkdownContent content={markdown} />)
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('.overflow-x-auto')).toBeTruthy()
  })

  it('renders images with alt text', () => {
    render(<MarkdownContent content="![Alt text](https://example.com/img.png)" />)
    const img = screen.getByAltText('Alt text')
    expect(img).toBeTruthy()
  })

  it('wraps content in prose container', () => {
    const { container } = render(<MarkdownContent content="test" />)
    expect(container.firstElementChild?.className).toContain('prose')
  })
})
