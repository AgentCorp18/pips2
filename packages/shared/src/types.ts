/**
 * Shared type definitions for PIPS 2.0
 *
 * This file contains types used across both the web app and shared package.
 * Database-generated types will be added to types/database.ts via `pnpm db:types`.
 */

/** Organization (tenant) */
export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

/** User profile */
export interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  orgId: string
  role: OrgRole
  createdAt: string
  updatedAt: string
}

/** Organization roles */
export type OrgRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'

/** PIPS step number (1-6) */
export type PipsStep = 1 | 2 | 3 | 4 | 5 | 6

/** Project status */
export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived'

/** Ticket priority */
export type TicketPriority = 'none' | 'low' | 'medium' | 'high' | 'critical'

/** Ticket status */
export type TicketStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'done'
  | 'cancelled'
