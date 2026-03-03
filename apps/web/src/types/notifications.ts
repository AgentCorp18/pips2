/**
 * Notification type definitions
 *
 * Maps to the notifications DB table and its joins.
 */

/* ============================================================
   Enums (mirrors Postgres notification_type enum)
   ============================================================ */

export type NotificationType =
  | 'ticket_assigned'
  | 'ticket_updated'
  | 'ticket_commented'
  | 'project_updated'
  | 'mention'
  | 'invitation'
  | 'system'

/* ============================================================
   Core Notification
   ============================================================ */

export type Notification = {
  id: string
  org_id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  read_at: string | null
  email_sent: boolean
  created_at: string
}

/* ============================================================
   Actor Profile (lightweight join shape for display)
   ============================================================ */

export type NotificationActor = {
  id: string
  display_name: string
  avatar_url: string | null
}

/* ============================================================
   Notification with Actor
   For display in the bell dropdown — includes actor info
   derived from context (e.g., who assigned the ticket).
   Since the notifications table doesn't have actor_id,
   we resolve the actor from the entity context when possible.
   ============================================================ */

export type NotificationWithActor = Notification & {
  actor: NotificationActor | null
}

/* ============================================================
   Pagination Options
   ============================================================ */

export type NotificationQueryOptions = {
  limit?: number
  offset?: number
  unread_only?: boolean
}

/* ============================================================
   API Response Types
   ============================================================ */

export type NotificationListResult = {
  notifications: Notification[]
  total: number
}

export type NotificationActionResult = {
  error?: string
}
