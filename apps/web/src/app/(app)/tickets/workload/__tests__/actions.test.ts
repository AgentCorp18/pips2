import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeSupabaseMock } from '@/test-utils/supabase-mock'

/* ============================================================
   Mocks
   ============================================================ */

const supabaseMock = makeSupabaseMock()

vi.mock('@/lib/permissions', () => ({
  requirePermission: vi.fn().mockResolvedValue('admin'),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => supabaseMock.next(),
  }),
}))

import { getWorkloadData } from '../actions'
import { requirePermission } from '@/lib/permissions'

describe('getWorkloadData', () => {
  beforeEach(() => {
    supabaseMock.reset()
    vi.clearAllMocks()
  })

  it('returns empty when permission is denied', async () => {
    vi.mocked(requirePermission).mockRejectedValueOnce(new Error('denied'))
    const result = await getWorkloadData('org-1')
    expect(result).toEqual({ members: [], unassignedCount: 0 })
  })

  it('returns members with their tickets', async () => {
    // First call: org_members
    supabaseMock.results.push({
      data: [
        {
          user_id: 'u-1',
          profiles: { full_name: 'Alice Smith', display_name: 'Alice', avatar_url: null },
        },
        {
          user_id: 'u-2',
          profiles: {
            full_name: 'Bob Jones',
            display_name: null,
            avatar_url: 'https://example.com/bob.jpg',
          },
        },
      ],
    })

    // Second call: tickets
    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'Task 1',
          status: 'in_progress',
          priority: 'high',
          type: 'task',
          due_date: '2026-03-20',
          sequence_number: 10,
          assignee_id: 'u-1',
          project: { title: 'Project A' },
        },
        {
          id: 't-2',
          title: 'Task 2',
          status: 'todo',
          priority: 'medium',
          type: 'bug',
          due_date: null,
          sequence_number: 11,
          assignee_id: 'u-1',
          project: null,
        },
        {
          id: 't-3',
          title: 'Unassigned task',
          status: 'backlog',
          priority: 'low',
          type: 'task',
          due_date: null,
          sequence_number: 12,
          assignee_id: null,
          project: { title: 'Project B' },
        },
      ],
    })

    const result = await getWorkloadData('org-1')
    expect(result.members).toHaveLength(2)
    expect(result.unassignedCount).toBe(1)

    // Alice should be first (most tickets), sorted by count desc
    const alice = result.members.find((m) => m.user_id === 'u-1')
    expect(alice).toBeDefined()
    expect(alice!.display_name).toBe('Alice')
    expect(alice!.tickets).toHaveLength(2)

    const bob = result.members.find((m) => m.user_id === 'u-2')
    expect(bob).toBeDefined()
    expect(bob!.display_name).toBe('Bob Jones') // falls back to full_name
    expect(bob!.tickets).toHaveLength(0)
  })

  it('returns empty on database error for tickets', async () => {
    // First call: org_members
    supabaseMock.results.push({ data: [] })
    // Second call: tickets — error
    supabaseMock.results.push({ data: null, error: { message: 'DB error' } })

    const result = await getWorkloadData('org-1')
    expect(result).toEqual({ members: [], unassignedCount: 0 })
  })

  it('handles null members data', async () => {
    supabaseMock.results.push({ data: null })
    supabaseMock.results.push({ data: [] })

    const result = await getWorkloadData('org-1')
    expect(result.members).toEqual([])
    expect(result.unassignedCount).toBe(0)
  })

  it('passes project_id filter', async () => {
    supabaseMock.results.push({ data: [] })
    supabaseMock.results.push({ data: [] })

    const result = await getWorkloadData('org-1', { project_id: 'p-1' })
    expect(result.members).toEqual([])
  })

  it('sorts members by ticket count descending', async () => {
    supabaseMock.results.push({
      data: [
        { user_id: 'u-1', profiles: { full_name: 'Alice', display_name: null, avatar_url: null } },
        { user_id: 'u-2', profiles: { full_name: 'Bob', display_name: null, avatar_url: null } },
      ],
    })

    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'T1',
          status: 'todo',
          priority: 'high',
          type: 'task',
          due_date: null,
          sequence_number: 1,
          assignee_id: 'u-2',
          project: null,
        },
        {
          id: 't-2',
          title: 'T2',
          status: 'todo',
          priority: 'low',
          type: 'task',
          due_date: null,
          sequence_number: 2,
          assignee_id: 'u-2',
          project: null,
        },
        {
          id: 't-3',
          title: 'T3',
          status: 'todo',
          priority: 'medium',
          type: 'task',
          due_date: null,
          sequence_number: 3,
          assignee_id: 'u-1',
          project: null,
        },
      ],
    })

    const result = await getWorkloadData('org-1')
    expect(result.members[0]!.user_id).toBe('u-2') // 2 tickets
    expect(result.members[1]!.user_id).toBe('u-1') // 1 ticket
  })

  it('maps ticket project_title correctly', async () => {
    supabaseMock.results.push({
      data: [
        { user_id: 'u-1', profiles: { full_name: 'Alice', display_name: 'Ali', avatar_url: null } },
      ],
    })

    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'Deploy',
          status: 'in_progress',
          priority: 'critical',
          type: 'task',
          due_date: '2026-04-01',
          sequence_number: 5,
          assignee_id: 'u-1',
          project: { title: 'Infrastructure' },
        },
      ],
    })

    const result = await getWorkloadData('org-1')
    expect(result.members[0]!.tickets[0]!.project_title).toBe('Infrastructure')
  })
})
