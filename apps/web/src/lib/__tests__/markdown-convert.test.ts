import { describe, it, expect } from 'vitest'
import { markdownToHtml, htmlToMarkdown } from '../markdown-convert'

describe('markdownToHtml', () => {
  it('returns empty string for empty input', () => {
    expect(markdownToHtml('')).toBe('')
    expect(markdownToHtml('   ')).toBe('')
  })

  it('converts bold text', () => {
    const result = markdownToHtml('**bold text**')
    expect(result).toContain('<strong>bold text</strong>')
  })

  it('converts italic text', () => {
    const result = markdownToHtml('*italic text*')
    expect(result).toContain('<em>italic text</em>')
  })

  it('converts headings', () => {
    const h2 = markdownToHtml('## Heading 2')
    expect(h2).toContain('<h2')
    expect(h2).toContain('Heading 2')

    const h3 = markdownToHtml('### Heading 3')
    expect(h3).toContain('<h3')
    expect(h3).toContain('Heading 3')
  })

  it('converts bullet lists', () => {
    const result = markdownToHtml('- item 1\n- item 2')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>item 1</li>')
    expect(result).toContain('<li>item 2</li>')
  })

  it('converts ordered lists', () => {
    const result = markdownToHtml('1. first\n2. second')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>first</li>')
    expect(result).toContain('<li>second</li>')
  })

  it('converts code blocks', () => {
    const result = markdownToHtml('```\nconst x = 1\n```')
    expect(result).toContain('<code>')
    expect(result).toContain('const x = 1')
  })

  it('converts blockquotes', () => {
    const result = markdownToHtml('> quoted text')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('quoted text')
  })

  it('converts links', () => {
    const result = markdownToHtml('[click here](https://example.com)')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('click here')
  })

  it('handles plain text without markdown', () => {
    const result = markdownToHtml('Just plain text')
    expect(result).toContain('Just plain text')
  })
})

describe('htmlToMarkdown', () => {
  it('returns empty string for empty input', () => {
    expect(htmlToMarkdown('')).toBe('')
    expect(htmlToMarkdown('   ')).toBe('')
  })

  it('returns empty string for empty Tiptap content', () => {
    expect(htmlToMarkdown('<p></p>')).toBe('')
  })

  it('converts bold HTML', () => {
    const result = htmlToMarkdown('<p><strong>bold</strong></p>')
    expect(result).toContain('**bold**')
  })

  it('converts italic HTML', () => {
    const result = htmlToMarkdown('<p><em>italic</em></p>')
    expect(result).toContain('*italic*')
  })

  it('converts heading HTML', () => {
    const result = htmlToMarkdown('<h2>Title</h2>')
    expect(result).toContain('## Title')
  })

  it('converts list HTML', () => {
    const result = htmlToMarkdown('<ul><li>one</li><li>two</li></ul>')
    expect(result).toMatch(/-\s+one/)
    expect(result).toMatch(/-\s+two/)
  })

  it('converts blockquote HTML', () => {
    const result = htmlToMarkdown('<blockquote><p>quoted</p></blockquote>')
    expect(result).toContain('> quoted')
  })

  it('converts link HTML', () => {
    const result = htmlToMarkdown('<a href="https://example.com">link</a>')
    expect(result).toContain('[link](https://example.com)')
  })
})

describe('round-trip', () => {
  it('preserves bold text semantics', () => {
    const original = '**bold**'
    const roundTripped = htmlToMarkdown(markdownToHtml(original))
    expect(roundTripped).toContain('**bold**')
  })

  it('preserves heading semantics', () => {
    const original = '## My Heading'
    const roundTripped = htmlToMarkdown(markdownToHtml(original))
    expect(roundTripped).toContain('## My Heading')
  })

  it('preserves list semantics', () => {
    const original = '- item one\n- item two'
    const roundTripped = htmlToMarkdown(markdownToHtml(original))
    expect(roundTripped).toMatch(/-\s+item one/)
    expect(roundTripped).toMatch(/-\s+item two/)
  })
})
