'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'

type MarkdownContentProps = {
  content: string
}

const components: Components = {
  h2: ({ children, id, ...props }) => (
    <h2 id={id} className="scroll-mt-20 group" {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 text-[var(--color-text-tertiary)] no-underline"
        >
          #
        </a>
      )}
    </h2>
  ),
  h3: ({ children, id, ...props }) => (
    <h3 id={id} className="scroll-mt-20 group" {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 text-[var(--color-text-tertiary)] no-underline"
        >
          #
        </a>
      )}
    </h3>
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http')
    return (
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    )
  },
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} className="rounded-lg max-w-full" {...props} />
  ),
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-secondary)] prose-p:leading-relaxed prose-li:text-[var(--color-text-secondary)] prose-li:leading-relaxed prose-strong:text-[var(--color-text-primary)] prose-a:text-[var(--color-primary)] prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-secondary)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
