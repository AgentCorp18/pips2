'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics'

export type ContentNodeRow = {
  id: string
  pillar: string
  title: string
  slug: string
  parent_id: string | null
  summary: string
  body_md: string | null
  estimated_read_minutes: number
  sort_order: number
  access_level: string
  tags: Record<string, unknown>
  related_nodes: string[]
}

export type BookmarkRow = {
  id: string
  content_node_id: string
  note: string | null
  created_at: string
}

export type BookmarkWithContent = BookmarkRow & {
  title: string
  pillar: string
  slug: string
  access_level: string
}

export type ReadHistoryRow = {
  content_node_id: string
  last_read_at: string
  read_count: number
}

export type ReadHistoryWithContent = ReadHistoryRow & {
  title: string
  pillar: string
  slug: string
}

/** Fetch all top-level content nodes (chapters/sections without parents) by pillar */
export const getContentByPillar = cache(async (pillar: string): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('pillar', pillar)
    .is('parent_id', null)
    .order('sort_order')

  if (error) {
    console.error('getContentByPillar error:', error)
    return []
  }
  return data ?? []
})

/** Fetch a single content node by slug (within a pillar) */
export const getContentBySlug = cache(
  async (pillar: string, slug: string): Promise<ContentNodeRow | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('content_nodes')
      .select('*')
      .eq('pillar', pillar)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('getContentBySlug error:', error)
      return null
    }
    return data
  },
)

/** Fetch child sections of a chapter */
export const getContentChildren = cache(async (parentId: string): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('parent_id', parentId)
    .order('sort_order')

  if (error) {
    console.error('getContentChildren error:', error)
    return []
  }
  return data ?? []
})

/** Full-text search across content nodes */
export const searchContent = async (query: string, pillar?: string): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()

  let q = supabase
    .from('content_nodes')
    .select('*')
    .textSearch('search_vector', query.slice(0, 100), { type: 'websearch' })
    .order('sort_order')
    .limit(20)

  if (pillar) {
    q = q.eq('pillar', pillar)
  }

  const { data, error } = await q
  if (error) {
    console.error('searchContent error:', error)
    return []
  }

  const results = data ?? []
  trackServerEvent('knowledge.searched', {
    query_text: query.slice(0, 100),
    result_count: results.length,
    pillar: pillar ?? null,
  })

  return results
}

/** Fetch content nodes matching a ProductContext (step + tool tags) */
export const getContentForContext = async (
  steps: string[],
  tools: string[],
): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()

  // Fetch all top-level nodes and filter client-side by tag overlap.
  // No limit here — we need to search across all pillars to find matches.
  // (Postgres JSONB array overlap queries are complex in PostgREST)
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .is('parent_id', null)
    .order('sort_order')
  if (error) {
    console.error('getContentForContext error:', error)
    return []
  }

  return (data ?? []).filter((node) => {
    const nodeTags = node.tags as { steps?: string[]; tools?: string[] }
    const nodeSteps = nodeTags.steps ?? []
    const nodeTools = nodeTags.tools ?? []

    const stepMatch = steps.some((s) => nodeSteps.includes(s))
    const toolMatch = tools.some((t) => nodeTools.includes(t))

    return stepMatch || toolMatch
  })
}

/** Get user's bookmarks (basic — no content join) */
export const getUserBookmarks = async (): Promise<BookmarkRow[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('content_bookmarks')
    .select('id, content_node_id, note, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getUserBookmarks error:', error)
    return []
  }
  return data ?? []
}

/** Get user's bookmarks with content node details (title, pillar, slug) */
export const getUserBookmarksWithContent = async (): Promise<BookmarkWithContent[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: bookmarks, error } = await supabase
    .from('content_bookmarks')
    .select('id, content_node_id, note, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !bookmarks?.length) {
    if (error) console.error('getUserBookmarksWithContent error:', error)
    return []
  }

  const nodeIds = bookmarks.map((b) => b.content_node_id)
  const { data: nodes } = await supabase
    .from('content_nodes')
    .select('id, title, pillar, slug, access_level')
    .in('id', nodeIds)

  const nodeMap = new Map((nodes ?? []).map((n) => [n.id, n]))

  return bookmarks
    .map((bm) => {
      const node = nodeMap.get(bm.content_node_id)
      if (!node) return null
      return {
        ...bm,
        title: node.title,
        pillar: node.pillar,
        slug: node.slug,
        access_level: node.access_level,
      }
    })
    .filter((item): item is BookmarkWithContent => item !== null)
}

/** Toggle bookmark on a content node */
export const toggleBookmark = async (
  contentNodeId: string,
  note?: string,
): Promise<{ bookmarked: boolean }> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { bookmarked: false }

  // Check if bookmark exists
  const { data: existing } = await supabase
    .from('content_bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_node_id', contentNodeId)
    .single()

  if (existing) {
    await supabase.from('content_bookmarks').delete().eq('id', existing.id)
    return { bookmarked: false }
  }

  await supabase.from('content_bookmarks').insert({
    user_id: user.id,
    content_node_id: contentNodeId,
    note: note ?? null,
  })

  trackServerEvent('knowledge.bookmarked', { content_node_id: contentNodeId })

  return { bookmarked: true }
}

/** Record that user read a content node */
export const recordReadHistory = async (contentNodeId: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  trackServerEvent('knowledge.viewed', { content_node_id: contentNodeId })

  const { data: existing } = await supabase
    .from('content_read_history')
    .select('id, read_count')
    .eq('user_id', user.id)
    .eq('content_node_id', contentNodeId)
    .single()

  if (existing) {
    await supabase
      .from('content_read_history')
      .update({
        last_read_at: new Date().toISOString(),
        read_count: existing.read_count + 1,
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('content_read_history').insert({
      user_id: user.id,
      content_node_id: contentNodeId,
    })
  }
}

/** Update reading session (where user left off in a pillar) */
export const updateReadingSession = async (
  contentNodeId: string,
  pillar: string,
  scrollPosition: number,
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('reading_sessions').upsert(
    {
      user_id: user.id,
      content_node_id: contentNodeId,
      pillar,
      scroll_position: scrollPosition,
      last_accessed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,pillar' },
  )
}

/** Get reading session for a pillar */
export const getReadingSession = async (
  pillar: string,
): Promise<{ contentNodeId: string; scrollPosition: number } | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('reading_sessions')
    .select('content_node_id, scroll_position')
    .eq('user_id', user.id)
    .eq('pillar', pillar)
    .single()

  if (error || !data) return null
  return { contentNodeId: data.content_node_id, scrollPosition: data.scroll_position }
}

/** Reading session with content details for "Continue Reading" UI */
export type ReadingSessionWithContent = {
  pillar: string
  contentNodeId: string
  scrollPosition: number
  lastAccessedAt: string
  title: string
  slug: string
}

/** Get all reading sessions for the current user (one per pillar) */
export const getAllReadingSessions = async (): Promise<ReadingSessionWithContent[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: sessions, error } = await supabase
    .from('reading_sessions')
    .select('pillar, content_node_id, scroll_position, last_accessed_at')
    .eq('user_id', user.id)
    .order('last_accessed_at', { ascending: false })

  if (error || !sessions?.length) {
    if (error) console.error('getAllReadingSessions error:', error)
    return []
  }

  const nodeIds = sessions.map((s) => s.content_node_id)
  const { data: nodes } = await supabase
    .from('content_nodes')
    .select('id, title, slug')
    .in('id', nodeIds)

  const nodeMap = new Map((nodes ?? []).map((n) => [n.id, n]))

  return sessions
    .map((s) => {
      const node = nodeMap.get(s.content_node_id)
      if (!node) return null
      return {
        pillar: s.pillar,
        contentNodeId: s.content_node_id,
        scrollPosition: s.scroll_position,
        lastAccessedAt: s.last_accessed_at,
        title: node.title,
        slug: node.slug,
      }
    })
    .filter((item): item is ReadingSessionWithContent => item !== null)
}

/** Fetch content nodes tagged with a specific tool slug */
export const getContentByTool = cache(async (toolSlug: string): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .order('sort_order')
    .limit(50)

  if (error) {
    console.error('getContentByTool error:', error)
    return []
  }

  return (data ?? []).filter((node) => {
    const nodeTags = node.tags as { tools?: string[] }
    const nodeTools = nodeTags.tools ?? []
    return nodeTools.includes(toolSlug)
  })
})

/** Fetch guide/book content nodes for a given PIPS step number */
export const getGuideContentForStep = cache(
  async (stepNumber: number): Promise<ContentNodeRow[]> => {
    const stepTag = `step-${stepNumber}`
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('content_nodes')
      .select('*')
      .is('parent_id', null)
      .order('sort_order')
      .limit(50)

    if (error) {
      console.error('getGuideContentForStep error:', error)
      return []
    }

    return (data ?? []).filter((node) => {
      const nodeTags = node.tags as { steps?: string[] }
      const nodeSteps = nodeTags.steps ?? []
      return nodeSteps.includes(stepTag)
    })
  },
)

/** Get user's recent read history (basic — no content join) */
export const getRecentReadHistory = async (limit = 10): Promise<ReadHistoryRow[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('content_read_history')
    .select('content_node_id, last_read_at, read_count')
    .eq('user_id', user.id)
    .order('last_read_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentReadHistory error:', error)
    return []
  }
  return data ?? []
}

/** Get user's recent read history with content node details (title, pillar, slug) */
export const getRecentReadHistoryWithContent = async (
  limit = 10,
): Promise<ReadHistoryWithContent[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: history, error } = await supabase
    .from('content_read_history')
    .select('content_node_id, last_read_at, read_count')
    .eq('user_id', user.id)
    .order('last_read_at', { ascending: false })
    .limit(limit)

  if (error || !history?.length) {
    if (error) console.error('getRecentReadHistoryWithContent error:', error)
    return []
  }

  const nodeIds = history.map((h) => h.content_node_id)
  const { data: nodes } = await supabase
    .from('content_nodes')
    .select('id, title, pillar, slug')
    .in('id', nodeIds)

  const nodeMap = new Map((nodes ?? []).map((n) => [n.id, n]))

  return history
    .map((item) => {
      const node = nodeMap.get(item.content_node_id)
      if (!node) return null
      return {
        ...item,
        title: node.title,
        pillar: node.pillar,
        slug: node.slug,
      }
    })
    .filter((item): item is ReadHistoryWithContent => item !== null)
}
