import { KnowledgeHubLanding } from '@/components/knowledge/knowledge-hub-landing'
import { getRecentReadHistoryWithContent, getUserBookmarks } from './actions'

const KnowledgePage = async () => {
  const [readHistory, bookmarks] = await Promise.all([
    getRecentReadHistoryWithContent(5),
    getUserBookmarks(),
  ])

  return <KnowledgeHubLanding recentReadHistory={readHistory} bookmarkCount={bookmarks.length} />
}

export default KnowledgePage
