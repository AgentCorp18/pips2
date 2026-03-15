import { KnowledgeHubLanding } from '@/components/knowledge/knowledge-hub-landing'
import {
  getRecentReadHistoryWithContent,
  getUserBookmarks,
  getAllReadingSessions,
  getContentByPillar,
  getRecentReadHistory,
} from './actions'

const KnowledgePage = async () => {
  let readHistory: Awaited<ReturnType<typeof getRecentReadHistoryWithContent>> = []
  let bookmarks: Awaited<ReturnType<typeof getUserBookmarks>> = []
  let readingSessions: Awaited<ReturnType<typeof getAllReadingSessions>> = []
  let bookChapters: Awaited<ReturnType<typeof getContentByPillar>> = []
  let allReadHistory: Awaited<ReturnType<typeof getRecentReadHistory>> = []

  try {
    ;[readHistory, bookmarks, readingSessions, bookChapters, allReadHistory] = await Promise.all([
      getRecentReadHistoryWithContent(5),
      getUserBookmarks(),
      getAllReadingSessions(),
      getContentByPillar('book'),
      getRecentReadHistory(200),
    ])
  } catch (err) {
    console.error('[KnowledgePage] Error fetching data:', err)
  }

  const readNodeIds = new Set(allReadHistory.map((r) => r.content_node_id))
  const bookChaptersRead = bookChapters.filter((ch) => readNodeIds.has(ch.id)).length

  return (
    <KnowledgeHubLanding
      recentReadHistory={readHistory}
      bookmarkCount={bookmarks.length}
      readingSessions={readingSessions}
      bookChapterCount={bookChapters.length}
      bookChaptersRead={bookChaptersRead}
    />
  )
}

export default KnowledgePage
