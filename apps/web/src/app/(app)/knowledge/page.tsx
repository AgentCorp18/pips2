import { KnowledgeHubLanding } from '@/components/knowledge/knowledge-hub-landing'
import { getRecentReadHistoryWithContent, getUserBookmarks, getAllReadingSessions } from './actions'

const KnowledgePage = async () => {
  const [readHistory, bookmarks, readingSessions] = await Promise.all([
    getRecentReadHistoryWithContent(5),
    getUserBookmarks(),
    getAllReadingSessions(),
  ])

  return (
    <KnowledgeHubLanding
      recentReadHistory={readHistory}
      bookmarkCount={bookmarks.length}
      readingSessions={readingSessions}
    />
  )
}

export default KnowledgePage
