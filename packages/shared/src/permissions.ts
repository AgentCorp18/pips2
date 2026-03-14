/**
 * RBAC Permission Constants and Helpers
 *
 * Defines the permission matrix for all org roles.
 * Shared across server and client.
 */

import type { OrgRole } from './types'

export const PERMISSIONS = {
  'org.delete': ['owner'],
  'org.billing': ['owner'],
  'org.members.manage': ['owner', 'admin'],
  'org.teams.manage': ['owner', 'admin', 'manager'],
  'org.integrations.manage': ['owner', 'admin'],
  'project.create': ['owner', 'admin', 'manager', 'member'],
  'project.update': ['owner', 'admin', 'manager'],
  'ticket.create': ['owner', 'admin', 'manager', 'member'],
  'ticket.update': ['owner', 'admin', 'manager', 'member'],
  'ticket.delete': ['owner', 'admin', 'manager'],
  'ticket.assign': ['owner', 'admin', 'manager', 'member'],
  'ticket.comment': ['owner', 'admin', 'manager', 'member'],
  'step.complete': ['owner', 'admin', 'manager'],
  'step.override': ['owner', 'admin', 'manager'],
  'workshop.manage': ['owner', 'admin', 'manager'],
  'chat.send': ['owner', 'admin', 'manager', 'member'],
  'chat.manage': ['owner', 'admin'],
  'data.view': ['owner', 'admin', 'manager', 'member', 'viewer'],
  'profile.edit': ['owner', 'admin', 'manager', 'member', 'viewer'],
} as const satisfies Record<string, readonly OrgRole[]>

export type Permission = keyof typeof PERMISSIONS

export const hasPermission = (role: OrgRole, permission: Permission): boolean =>
  (PERMISSIONS[permission] as readonly string[]).includes(role)

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  member: 2,
  viewer: 1,
}

/** Check if actor can manage (change/remove) a target role */
export const canManageRole = (actorRole: OrgRole, targetRole: OrgRole): boolean =>
  ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole]

/** All roles ordered by hierarchy (highest first) */
export const ROLES_ORDERED: OrgRole[] = ['owner', 'admin', 'manager', 'member', 'viewer']

/** Human-readable role labels */
export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer',
}
