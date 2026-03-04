import { KnowledgeHubLanding } from '@/components/knowledge/knowledge-hub-landing'
import { getRecentReadHistory, getUserBookmarks } from './actions'

const KnowledgePage = async () => {
  const [readHistory, bookmarks] = await Promise.all([getRecentReadHistory(5), getUserBookmarks()])

  return <KnowledgeHubLanding recentReadHistory={readHistory} bookmarkCount={bookmarks.length} />
}

export default KnowledgePage
