/**
 * Ticket & Comment type definitions
 *
 * Maps to the tickets / comments DB tables and their joins.
 */

/* ============================================================
   Enums (mirrors Postgres enums)
   ============================================================ */

export type TicketStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'done'
  | 'cancelled'

export type TicketPriority = 'critical' | 'high' | 'medium' | 'low' | 'none'

export type TicketType = 'pips_project' | 'task' | 'bug' | 'feature' | 'general'

export type PipsStepEnum =
  | 'identify'
  | 'analyze'
  | 'generate'
  | 'select_plan'
  | 'implement'
  | 'evaluate'

/* ============================================================
   Core Ticket
   ============================================================ */

export type Ticket = {
  id: string
  org_id: string
  sequence_number: number
  project_id: string | null
  parent_id: string | null
  title: string
  description: string | null
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  pips_step: PipsStepEnum | null
  assignee_id: string | null
  reporter_id: string
  team_id: string | null
  due_date: string | null
  started_at: string | null
  resolved_at: string | null
  tags: string[]
  custom_fields: Record<string, unknown>
  search_vector: string | null
  created_at: string
  updated_at: string
}

/* ============================================================
   Profile (lightweight join shape)
   ============================================================ */

export type ProfileSummary = {
  id: string
  display_name: string
  avatar_url: string | null
}

/* ============================================================
   Ticket with Relations
   ============================================================ */

export type TicketWithRelations = Ticket & {
  assignee: ProfileSummary | null
  reporter: ProfileSummary
  project: { id: string; title: string } | null
  comments_count: number
  org_prefix: string
}

/* ============================================================
   Comment
   ============================================================ */

export type Comment = {
  id: string
  org_id: string
  ticket_id: string | null
  project_id: string | null
  step_id: string | null
  author_id: string
  body: string
  body_html: string | null
  edited_at: string | null
  parent_id: string | null
  mentions: string[]
  created_at: string
  updated_at: string
}

export type CommentWithAuthor = Comment & {
  author: ProfileSummary
}

/* ============================================================
   Filters
   ============================================================ */

export type TicketFilters = {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  type?: TicketType[]
  assignee_id?: string
  reporter_id?: string
  project_id?: string
  unassigned?: boolean
  due_date_before?: string
  search?: string
  page?: number
  per_page?: number
  sort_by?: 'created_at' | 'updated_at' | 'priority' | 'due_date'
  sort_order?: 'asc' | 'desc'
}
