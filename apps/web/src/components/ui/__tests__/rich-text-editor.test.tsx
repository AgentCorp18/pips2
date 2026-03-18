import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

/* ============================================================
   Mocks — Tiptap doesn't work well in jsdom, so we mock it
   ============================================================ */

const mockChain = {
  focus: vi.fn().mockReturnThis(),
  toggleBold: vi.fn().mockReturnThis(),
  toggleItalic: vi.fn().mockReturnThis(),
  toggleHeading: vi.fn().mockReturnThis(),
  toggleBulletList: vi.fn().mockReturnThis(),
  toggleOrderedList: vi.fn().mockReturnThis(),
  toggleCodeBlock: vi.fn().mockReturnThis(),
  toggleBlockquote: vi.fn().mockReturnThis(),
  setLink: vi.fn().mockReturnThis(),
  unsetLink: vi.fn().mockReturnThis(),
  run: vi.fn(),
}

const mockEditor = {
  chain: vi.fn(() => mockChain),
  isActive: vi.fn(() => false),
  getHTML: vi.fn(() => '<p></p>'),
  setEditable: vi.fn(),
  commands: {
    setContent: vi.fn(),
  },
}

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: vi.fn(({ editor }: { editor: unknown }) =>
    editor ? <div data-testid="tiptap-editor-content">Editor content</div> : null,
  ),
}))

vi.mock('@tiptap/starter-kit', () => ({
  default: {
    configure: vi.fn(() => ({})),
  },
}))

vi.mock('@tiptap/extension-link', () => ({
  default: {
    configure: vi.fn(() => ({})),
  },
}))

vi.mock('@tiptap/extension-placeholder', () => ({
  default: {
    configure: vi.fn(() => ({})),
  },
}))

vi.mock('@/lib/markdown-convert', () => ({
  markdownToHtml: vi.fn((md: string) => `<p>${md}</p>`),
  htmlToMarkdown: vi.fn((html: string) => html.replace(/<[^>]+>/g, '')),
}))

/* ============================================================
   Import
   ============================================================ */

import { RichTextEditor } from '../rich-text-editor'

/* ============================================================
   Tests
   ============================================================ */

describe('RichTextEditor', () => {
  it('renders the editor with toolbar', () => {
    render(<RichTextEditor content="" onChange={vi.fn()} />)

    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument()
    expect(screen.getByTestId('tiptap-editor-content')).toBeInTheDocument()
  })

  it('renders all toolbar buttons', () => {
    render(<RichTextEditor content="" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Bold')).toBeInTheDocument()
    expect(screen.getByLabelText('Italic')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Heading 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument()
    expect(screen.getByLabelText('Ordered List')).toBeInTheDocument()
    expect(screen.getByLabelText('Code Block')).toBeInTheDocument()
    expect(screen.getByLabelText('Blockquote')).toBeInTheDocument()
    expect(screen.getByLabelText('Add Link')).toBeInTheDocument()
  })

  it('passes data-testid to the container', () => {
    render(<RichTextEditor content="" onChange={vi.fn()} data-testid="my-editor" />)

    expect(screen.getByTestId('my-editor')).toBeInTheDocument()
  })

  it('applies disabled styling when disabled', () => {
    render(<RichTextEditor content="" onChange={vi.fn()} disabled data-testid="disabled-editor" />)

    const container = screen.getByTestId('disabled-editor')
    expect(container.className).toContain('opacity-50')
    expect(container.className).toContain('cursor-not-allowed')
  })

  it('disables toolbar buttons when disabled', () => {
    render(<RichTextEditor content="" onChange={vi.fn()} disabled />)

    expect(screen.getByLabelText('Bold')).toBeDisabled()
    expect(screen.getByLabelText('Italic')).toBeDisabled()
  })
})
