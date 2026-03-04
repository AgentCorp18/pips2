import { notFound } from 'next/navigation'
import { ContentReader } from '@/components/knowledge/content-reader'
import { getContentBySlug, getContentChildren, getContentByPillar } from '../../actions'

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>
}

const ChapterPage = async ({ params }: ChapterPageProps) => {
  const { chapterSlug } = await params
  const chapter = await getContentBySlug('book', chapterSlug)

  if (!chapter) {
    notFound()
  }

  const [sections, allChapters] = await Promise.all([
    getContentChildren(chapter.id),
    getContentByPillar('book'),
  ])

  // Find previous/next chapters for navigation
  const currentIndex = allChapters.findIndex((c) => c.id === chapter.id)
  const prevChapter = currentIndex > 0 ? (allChapters[currentIndex - 1] ?? null) : null
  const nextChapter =
    currentIndex < allChapters.length - 1 ? (allChapters[currentIndex + 1] ?? null) : null

  return (
    <ContentReader
      node={chapter}
      sections={sections}
      prevNode={prevChapter}
      nextNode={nextChapter}
      breadcrumbs={[
        { label: 'Knowledge Hub', href: '/knowledge' },
        { label: 'Book', href: '/knowledge/book' },
        { label: chapter.title, href: `/knowledge/book/${chapter.slug}` },
      ]}
    />
  )
}

export default ChapterPage
