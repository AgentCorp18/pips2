import { KnowledgeHubLanding } from '@/components/knowledge/knowledge-hub-landing'
import {
  getRecentReadHistoryWithContent,
  getUserBookmarks,
  getAllReadingSessions,
  getContentByPillar,
  getRecentReadHistory,
} from './actions'

const KnowledgePage = async () => {
  const [readHistory, bookmarks, readingSessions, bookChapters, allReadHistory] = await Promise.all(
    [
      getRecentReadHistoryWithContent(5),
      getUserBookmarks(),
      getAllReadingSessions(),
      getContentByPillar('book'),
      getRecentReadHistory(200),
    ],
  )

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
