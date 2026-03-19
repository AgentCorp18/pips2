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

import { getTicketsForTimeline } from '../actions'
import { requirePermission } from '@/lib/permissions'

describe('getTicketsForTimeline', () => {
  beforeEach(() => {
    supabaseMock.reset()
    vi.clearAllMocks()
  })

  it('returns empty array when permission is denied', async () => {
    vi.mocked(requirePermission).mockRejectedValueOnce(new Error('denied'))
    const result = await getTicketsForTimeline('org-1')
    expect(result).toEqual([])
  })

  it('returns mapped tickets on success', async () => {
    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'Build timeline',
          status: 'in_progress',
          priority: 'high',
          type: 'feature',
          due_date: '2026-04-01',
          started_at: '2026-03-15T10:00:00Z',
          created_at: '2026-03-10T08:00:00Z',
          resolved_at: null,
          assignee_id: 'u-1',
          project_id: 'p-1',
          sequence_number: 101,
          parent_id: null,
          assignee: { display_name: 'Alice', full_name: 'Alice Smith' },
          project: { title: 'PIPS 2.0' },
        },
      ],
    })

    const result = await getTicketsForTimeline('org-1')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 't-1',
      title: 'Build timeline',
      status: 'in_progress',
      priority: 'high',
      type: 'feature',
      due_date: '2026-04-01',
      started_at: '2026-03-15T10:00:00Z',
      created_at: '2026-03-10T08:00:00Z',
      resolved_at: null,
      assignee_name: 'Alice',
      assignee_id: 'u-1',
      project_title: 'PIPS 2.0',
      project_id: 'p-1',
      sequence_number: 101,
      parent_id: null,
    })
  })

  it('falls back to full_name when display_name is null', async () => {
    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'Task',
          status: 'todo',
          priority: 'low',
          type: 'task',
          due_date: null,
          started_at: null,
          created_at: '2026-03-10T00:00:00Z',
          resolved_at: null,
          assignee_id: 'u-2',
          project_id: null,
          sequence_number: 1,
          parent_id: null,
          assignee: { display_name: null, full_name: 'Bob Jones' },
          project: null,
        },
      ],
    })

    const result = await getTicketsForTimeline('org-1')
    expect(result[0]!.assignee_name).toBe('Bob Jones')
    expect(result[0]!.project_title).toBeNull()
  })

  it('returns null for assignee/project when both are null', async () => {
    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'Orphan',
          status: 'backlog',
          priority: 'none',
          type: 'general',
          due_date: null,
          started_at: null,
          created_at: '2026-03-05T00:00:00Z',
          resolved_at: null,
          assignee_id: null,
          project_id: null,
          sequence_number: 2,
          parent_id: null,
          assignee: null,
          project: null,
        },
      ],
    })

    const result = await getTicketsForTimeline('org-1')
    expect(result[0]!.assignee_name).toBeNull()
    expect(result[0]!.project_title).toBeNull()
  })

  it('returns empty array on database error', async () => {
    supabaseMock.results.push({ data: null, error: { message: 'DB error' } })
    const result = await getTicketsForTimeline('org-1')
    expect(result).toEqual([])
  })

  it('passes filters through to query', async () => {
    supabaseMock.results.push({ data: [] })
    const result = await getTicketsForTimeline('org-1', {
      assignee_id: 'u-1',
      project_id: 'p-1',
      priority: ['high', 'critical'],
      status: ['in_progress', 'in_review'],
    })
    expect(result).toEqual([])
  })

  it('handles empty data array', async () => {
    supabaseMock.results.push({ data: [] })
    const result = await getTicketsForTimeline('org-1')
    expect(result).toEqual([])
  })

  it('handles null data', async () => {
    supabaseMock.results.push({ data: null })
    const result = await getTicketsForTimeline('org-1')
    expect(result).toEqual([])
  })

  it('includes resolved_at in returned data', async () => {
    supabaseMock.results.push({
      data: [
        {
          id: 't-done',
          title: 'Done task',
          status: 'done',
          priority: 'medium',
          type: 'task',
          due_date: '2026-03-20',
          started_at: '2026-03-10T00:00:00Z',
          created_at: '2026-03-08T00:00:00Z',
          resolved_at: '2026-03-18T15:30:00Z',
          assignee_id: 'u-1',
          project_id: 'p-1',
          sequence_number: 50,
          parent_id: 't-parent',
          assignee: { display_name: 'Charlie', full_name: 'Charlie Brown' },
          project: { title: 'Safety' },
        },
      ],
    })

    const result = await getTicketsForTimeline('org-1')
    expect(result[0]!.resolved_at).toBe('2026-03-18T15:30:00Z')
    expect(result[0]!.parent_id).toBe('t-parent')
  })
})
