import { marked } from 'marked'
import TurndownService from 'turndown'

/* ============================================================
   Markdown → HTML (for loading into Tiptap editor)
   ============================================================ */

export const markdownToHtml = (markdown: string): string => {
  if (!markdown.trim()) return ''

  // marked.parse can return string | Promise<string>; with async: false (default) it returns string
  const result = marked.parse(markdown, {
    gfm: true,
    breaks: false,
  })

  return typeof result === 'string' ? result : ''
}

/* ============================================================
   HTML → Markdown (for saving from Tiptap editor)
   ============================================================ */

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
})

export const htmlToMarkdown = (html: string): string => {
  if (!html.trim()) return ''

  // Tiptap outputs <p></p> for empty content
  if (html === '<p></p>') return ''

  return turndown.turndown(html)
}
