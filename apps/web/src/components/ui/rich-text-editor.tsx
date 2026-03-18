'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Quote,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { markdownToHtml, htmlToMarkdown } from '@/lib/markdown-convert'

/* ============================================================
   Types
   ============================================================ */

type RichTextEditorProps = {
  content: string // markdown string
  onChange: (markdown: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  'data-testid'?: string
}

/* ============================================================
   Toolbar Button
   ============================================================ */

type ToolbarButtonProps = {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

const ToolbarButton = ({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn('h-7 w-7', isActive && 'bg-accent text-accent-foreground')}
    aria-label={title}
  >
    {children}
  </Button>
)

/* ============================================================
   Component
   ============================================================ */

export const RichTextEditor = ({
  content,
  onChange,
  placeholder = '',
  disabled = false,
  className,
  'data-testid': testId,
}: RichTextEditorProps) => {
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: markdownToHtml(content),
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true
      onChange(htmlToMarkdown(ed.getHTML()))
    },
    immediatelyRender: false,
  })

  // Sync disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  // Sync external content changes (e.g., AI assist setting content)
  useEffect(() => {
    if (!editor || isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    const currentMarkdown = htmlToMarkdown(editor.getHTML())
    if (currentMarkdown !== content) {
      editor.commands.setContent(markdownToHtml(content))
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }

    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) {
    return (
      <div
        className={cn('rounded-md border', 'min-h-[120px] animate-pulse bg-muted', className)}
        style={{ borderColor: 'var(--color-border)' }}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-md border transition-colors focus-within:ring-1 focus-within:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      style={{ borderColor: 'var(--color-border)' }}
      data-testid={testId}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1"
        style={{ borderColor: 'var(--color-border)' }}
        role="toolbar"
        aria-label="Text formatting"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          disabled={disabled}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          disabled={disabled}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          disabled={disabled}
          title="Bullet List"
        >
          <List size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          disabled={disabled}
          title="Ordered List"
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          disabled={disabled}
          title="Code Block"
        >
          <Code2 size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          disabled={disabled}
          title="Blockquote"
        >
          <Quote size={14} />
        </ToolbarButton>

        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          disabled={disabled}
          title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
        >
          {editor.isActive('link') ? <Unlink size={14} /> : <LinkIcon size={14} />}
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}
