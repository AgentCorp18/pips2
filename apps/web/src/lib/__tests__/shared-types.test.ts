import { describe, it, expect } from 'vitest'
import type {
  Organization,
  UserProfile,
  OrgRole,
  PipsStep,
  ProjectStatus,
  TicketPriority,
  TicketStatus,
  PipsStepNumber,
  Permission,
  StepFormDef,
  StepContent,
  StepMethodology,
} from '@pips/shared'

/**
 * Type-only compilation tests.
 *
 * These tests verify that the shared type exports compile correctly
 * and can be used as expected. The assertions are minimal since
 * the real value is TypeScript catching type errors at compile time.
 */

describe('shared type exports compile correctly', () => {
  it('Organization type has expected shape', () => {
    const org: Organization = {
      id: 'org-1',
      name: 'Test Org',
      slug: 'test-org',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(org.id).toBe('org-1')
  })

  it('UserProfile type has expected shape', () => {
    const user: UserProfile = {
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
      avatarUrl: null,
      orgId: 'org-1',
      role: 'member',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    expect(user.role).toBe('member')
  })

  it('OrgRole accepts valid roles', () => {
    const roles: OrgRole[] = ['owner', 'admin', 'manager', 'member', 'viewer']
    expect(roles).toHaveLength(5)
  })

  it('PipsStep accepts 1-6', () => {
    const steps: PipsStep[] = [1, 2, 3, 4, 5, 6]
    expect(steps).toHaveLength(6)
  })

  it('PipsStepNumber accepts 1-6', () => {
    const steps: PipsStepNumber[] = [1, 2, 3, 4, 5, 6]
    expect(steps).toHaveLength(6)
  })

  it('ProjectStatus accepts valid statuses', () => {
    const statuses: ProjectStatus[] = ['active', 'completed', 'archived']
    expect(statuses).toHaveLength(3)
  })

  it('TicketPriority accepts valid priorities', () => {
    const priorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']
    expect(priorities).toHaveLength(4)
  })

  it('TicketStatus accepts valid statuses', () => {
    const statuses: TicketStatus[] = ['open', 'in_progress', 'review', 'done', 'blocked']
    expect(statuses).toHaveLength(5)
  })

  it('Permission type can reference known permissions', () => {
    const perm: Permission = 'ticket.create'
    expect(perm).toBe('ticket.create')
  })

  it('StepFormDef type has expected shape', () => {
    const form: StepFormDef = {
      type: 'fishbone',
      name: 'Fishbone Diagram',
      description: 'Root cause analysis',
      required: true,
    }
    expect(form.type).toBe('fishbone')
  })

  it('StepMethodology type has expected shape', () => {
    const methodology: StepMethodology = {
      tips: ['tip 1'],
      bestPractices: ['practice 1'],
      facilitationGuide: 'Guide text',
    }
    expect(methodology.tips).toHaveLength(1)
  })

  it('StepContent type has expected shape', () => {
    const content: StepContent = {
      title: 'Identify',
      objective: 'Define the problem',
      prompts: ['What is the problem?'],
      forms: [{ type: 'problem_statement', name: 'PS', description: 'desc', required: true }],
      completionCriteria: ['Problem defined'],
      methodology: {
        tips: ['tip'],
        bestPractices: ['practice'],
        facilitationGuide: 'guide',
      },
    }
    expect(content.title).toBe('Identify')
  })
})
