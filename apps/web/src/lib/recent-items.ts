/**
 * Recent items utility for the command palette.
 * Stores last N visited projects/tickets in localStorage so the
 * command palette can show them when opened with no search query.
 */

const STORAGE_KEY = 'pips-recent-items'
const MAX_ITEMS = 8

export type RecentItemType = 'project' | 'ticket' | 'initiative'

export type RecentItem = {
  id: string
  title: string
  type: RecentItemType
  path: string
  /** ISO timestamp of last visit */
  visitedAt: string
}

/**
 * Read recent items from localStorage.
 * Returns an empty array if localStorage is unavailable or the data is invalid.
 */
export const getRecentItems = (): RecentItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecentItem)
  } catch {
    return []
  }
}

/**
 * Add or update a recent item.
 * Deduplicates by id, moves existing items to the front, and caps the list at MAX_ITEMS.
 */
export const addRecentItem = (item: Omit<RecentItem, 'visitedAt'>): void => {
  if (typeof window === 'undefined') return
  try {
    const existing = getRecentItems().filter((r) => r.id !== item.id)
    const updated: RecentItem[] = [
      { ...item, visitedAt: new Date().toISOString() },
      ...existing,
    ].slice(0, MAX_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Storage quota exceeded or access denied — silently ignore
  }
}

/**
 * Clear all recent items (e.g. on logout).
 */
export const clearRecentItems = (): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ---- type guard ----

const isRecentItem = (v: unknown): v is RecentItem => {
  if (typeof v !== 'object' || v === null) return false
  const obj = v as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    (obj.type === 'project' || obj.type === 'ticket' || obj.type === 'initiative') &&
    typeof obj.path === 'string' &&
    typeof obj.visitedAt === 'string'
  )
}
