'use server'

import { createClient } from '@/lib/supabase/server'

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

export type ReadHistoryRow = {
  content_node_id: string
  last_read_at: string
  read_count: number
}

/** Fetch all top-level content nodes (chapters/sections without parents) by pillar */
export const getContentByPillar = async (pillar: string): Promise<ContentNodeRow[]> => {
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
}

/** Fetch a single content node by slug (within a pillar) */
export const getContentBySlug = async (
  pillar: string,
  slug: string,
): Promise<ContentNodeRow | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .eq('pillar', pillar)
    .eq('slug', slug)
    .is('parent_id', null)
    .single()

  if (error) {
    console.error('getContentBySlug error:', error)
    return null
  }
  return data
}

/** Fetch child sections of a chapter */
export const getContentChildren = async (parentId: string): Promise<ContentNodeRow[]> => {
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
}

/** Full-text search across content nodes */
export const searchContent = async (query: string, pillar?: string): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()
  const tsQuery = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}:*`)
    .join(' & ')

  let q = supabase
    .from('content_nodes')
    .select('*')
    .textSearch('search_vector', tsQuery)
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
  return data ?? []
}

/** Fetch content nodes matching a ProductContext (step + tool tags) */
export const getContentForContext = async (
  steps: string[],
  tools: string[],
): Promise<ContentNodeRow[]> => {
  const supabase = await createClient()

  // Use Postgres JSONB containment to match tags
  // Match nodes where tags->'steps' overlaps with our steps OR tags->'tools' overlaps with our tools
  // For simplicity, fetch all and filter client-side
  // (Postgres JSONB array overlap queries are complex in PostgREST)
  const { data, error } = await supabase
    .from('content_nodes')
    .select('*')
    .is('parent_id', null)
    .order('sort_order')
    .limit(20)
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

/** Get user's bookmarks */
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
  return { bookmarked: true }
}

/** Record that user read a content node */
export const recordReadHistory = async (contentNodeId: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

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

/** Get user's recent read history */
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
