import type { ReactNode } from 'react'

/**
 * Parses inline markdown-style formatting in plain text strings.
 * Supports **bold** and *italic* markers, rendering them as
 * <strong> and <em> elements respectively. Handles italic
 * nested inside bold (e.g., **bold *italic* bold**).
 *
 * This is a lightweight server-compatible alternative to full markdown
 * rendering, designed for short content strings in the guide.
 */

/** Parse only *italic* markers in a string */
const parseItalic = (text: string, keyPrefix: number): ReactNode[] => {
  const pattern = /\*(.+?)\*/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(<em key={`${keyPrefix}-i-${match.index}`}>{match[1]}</em>)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export const parseRichText = (text: string): ReactNode[] => {
  // First pass: match **bold** segments (which may contain *italic* inside)
  // Then match standalone *italic* segments
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[2]) {
      // **bold** match — parse inner content for *italic* markers
      const innerContent = parseItalic(match[2], match.index)
      parts.push(
        <strong key={match.index} className="text-[var(--color-text-primary)] font-semibold">
          {innerContent}
        </strong>,
      )
    } else if (match[3]) {
      // *italic* match
      parts.push(<em key={match.index}>{match[3]}</em>)
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

type RichTextProps = {
  text: string
  className?: string
  as?: 'p' | 'span' | 'li'
}

export const RichText = ({ text, className, as: Tag = 'span' }: RichTextProps) => {
  return <Tag className={className}>{parseRichText(text)}</Tag>
}
