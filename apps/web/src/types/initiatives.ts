/**
 * Initiative type definitions
 *
 * Maps to the initiatives / initiative_projects DB tables.
 */

import type { ProfileSummary } from './tickets'

/* ============================================================
   Enums (mirrors Postgres enum)
   ============================================================ */

export type InitiativeStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived'

/* ============================================================
   Core Initiative
   ============================================================ */

export type Initiative = {
  id: string
  org_id: string
  title: string
  description: string | null
  status: InitiativeStatus
  owner_id: string
  objective: string | null
  target_metric: string | null
  baseline_value: string | null
  target_value: string | null
  current_value: string | null
  target_start: string | null
  target_end: string | null
  actual_start: string | null
  actual_end: string | null
  tags: string[]
  color: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  archived_at: string | null
}

/* ============================================================
   Initiative with Relations
   ============================================================ */

export type InitiativeProject = {
  id: string
  initiative_id: string
  project_id: string
  added_by: string
  added_at: string
  notes: string | null
  project: {
    id: string
    title: string
    status: string
    current_step: string | null
    owner_id: string
    priority: string
  }
}

export type InitiativeWithRelations = Initiative & {
  owner: ProfileSummary
  projects: InitiativeProject[]
  project_count: number
}

/* ============================================================
   Initiative Progress (aggregated from child projects)
   ============================================================ */

export type InitiativeProgress = {
  total_projects: number
  completed_projects: number
  in_progress_projects: number
  total_tickets: number
  completed_tickets: number
  weighted_progress: number // 0-100, weighted by project priority
}
