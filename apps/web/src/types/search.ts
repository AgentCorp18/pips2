/**
 * Global search result types for the command palette (Cmd+K).
 */

export type SearchResultType = 'project' | 'ticket'

export type SearchResult = {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  url: string
}

export type SearchResultGroup = {
  type: SearchResultType
  label: string
  results: SearchResult[]
}

export type GlobalSearchResponse = {
  groups: SearchResultGroup[]
  total: number
}
