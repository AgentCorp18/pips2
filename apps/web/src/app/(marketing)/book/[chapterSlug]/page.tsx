import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Lock, Mail } from 'lucide-react'
import { BOOK_CHAPTER_MAP } from '@pips/shared'
import { CHAPTER_PREVIEWS } from './_chapter-previews'

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>
}

const findChapter = (slug: string) => {
  const index = BOOK_CHAPTER_MAP.findIndex((ch) => ch.chapter === slug)
  if (index === -1) return null
  return { chapter: BOOK_CHAPTER_MAP[index]!, index }
}

const getAccessLevel = (index: number): 'free' | 'email-gated' | 'signup' => {
  if (index < 3) return 'free' // Foreword, Introduction, Ch.1
  if (index < 6) return 'email-gated' // Ch.2-3 (indices 3-5)
  return 'signup'
}

export const generateMetadata = async ({ params }: ChapterPageProps): Promise<Metadata> => {
  const { chapterSlug } = await params
  const result = findChapter(chapterSlug)

  if (!result) {
    return { title: 'Chapter Not Found' }
  }

  const { chapter } = result
  const title = `${chapter.title} — The Never-Ending Quest`
  const description =
    CHAPTER_PREVIEWS[chapterSlug]?.summary ??
    `Read "${chapter.title}" from The Never-Ending Quest, the complete guide to the PIPS methodology.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export const generateStaticParams = () => {
  return BOOK_CHAPTER_MAP.map((ch) => ({ chapterSlug: ch.chapter }))
}

const ChapterPage = async ({ params }: ChapterPageProps) => {
  const { chapterSlug } = await params
  const result = findChapter(chapterSlug)

  if (!result) {
    notFound()
  }

  const { chapter, index } = result
  const accessLevel = getAccessLevel(index)
  const preview = CHAPTER_PREVIEWS[chapterSlug]
  const prevChapter = index > 0 ? BOOK_CHAPTER_MAP[index - 1] : null
  const nextChapter = index < BOOK_CHAPTER_MAP.length - 1 ? BOOK_CHAPTER_MAP[index + 1] : null

  const stepTools = [
    ...chapter.steps.map((s) =>
      s
        .replace('step-', 'Step ')
        .replace('philosophy', 'Philosophy')
        .replace('culture', 'Culture')
        .replace('facilitation', 'Facilitation')
        .replace('overview', 'Overview'),
    ),
    ...chapter.tools.map((t) => t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
  ]

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/book" className="hover:text-[var(--color-primary)]">
          The Never-Ending Quest
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{chapter.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
          <BookOpen size={24} className="text-[var(--color-primary)]" />
        </div>
        <div>
          {index >= 2 && (
            <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
              Chapter {index - 1}
            </p>
          )}
          <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)] md:text-4xl">
            {chapter.title}
          </h1>
        </div>
      </div>

      {/* Tags */}
      {stepTools.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {stepTools.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-tertiary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {preview?.summary && (
        <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
          {preview.summary}
        </p>
      )}

      {/* Content Preview */}
      {preview?.previewParagraphs && (
        <section className="mt-8">
          <div className="space-y-4">
            {preview.previewParagraphs.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Access Gate */}
      {accessLevel === 'free' && preview?.fullContent && (
        <section className="mt-8">
          <div className="space-y-4">
            {preview.fullContent.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {accessLevel === 'email-gated' && (
        <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/30">
          <Mail size={32} className="mx-auto text-blue-500" />
          <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
            Continue reading with a free account
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Sign up for free to access this chapter and explore the PIPS methodology.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Sign Up Free to Read
          </Link>
        </section>
      )}

      {accessLevel === 'signup' && (
        <section className="mt-8 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-8 text-center">
          <Lock size={32} className="mx-auto text-[var(--color-primary)]" />
          <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
            Full chapter available with PIPS
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Sign up to read the complete chapter and put the PIPS methodology into practice with
            built-in tools, templates, and team collaboration.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Get Started Free
          </Link>
        </section>
      )}

      {/* Key Takeaways */}
      {preview?.keyTakeaways && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Key Takeaways</h2>
          <ul className="mt-4 space-y-2">
            {preview.keyTakeaways.map((takeaway) => (
              <li
                key={takeaway}
                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
              >
                <span className="mt-1 text-[var(--color-primary)]">&#x2022;</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-[var(--color-border)] pt-6">
        {prevChapter ? (
          <Link
            href={`/book/${prevChapter.chapter}`}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft size={14} />
            {prevChapter.title}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/book/${nextChapter.chapter}`}
            className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
          >
            {nextChapter.title}
            <ArrowRight size={14} />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Back to Book */}
      <div className="mt-6">
        <Link
          href="/book"
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          <ArrowLeft size={14} />
          Back to Table of Contents
        </Link>
      </div>
    </div>
  )
}

export default ChapterPage
