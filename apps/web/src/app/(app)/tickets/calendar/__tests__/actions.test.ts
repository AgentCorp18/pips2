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

import { getTicketsForCalendar } from '../actions'
import { requirePermission } from '@/lib/permissions'

describe('getTicketsForCalendar', () => {
  beforeEach(() => {
    supabaseMock.reset()
    vi.clearAllMocks()
  })

  it('returns empty array when permission is denied', async () => {
    vi.mocked(requirePermission).mockRejectedValueOnce(new Error('denied'))
    const result = await getTicketsForCalendar('org-1', 2026, 3)
    expect(result).toEqual([])
  })

  it('returns mapped tickets on success', async () => {
    supabaseMock.results.push({
      data: [
        {
          id: 't-1',
          title: 'Fix bug',
          status: 'todo',
          priority: 'high',
          due_date: '2026-03-15',
          sequence_number: 42,
          assignee: { display_name: 'Alice', full_name: 'Alice Smith' },
          project: { title: 'Safety Project' },
        },
      ],
    })

    const result = await getTicketsForCalendar('org-1', 2026, 3)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      id: 't-1',
      title: 'Fix bug',
      status: 'todo',
      priority: 'high',
      due_date: '2026-03-15',
      assignee_name: 'Alice',
      project_title: 'Safety Project',
      sequence_number: 42,
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
          due_date: '2026-03-10',
          sequence_number: 1,
          assignee: { display_name: null, full_name: 'Bob Jones' },
          project: null,
        },
      ],
    })

    const result = await getTicketsForCalendar('org-1', 2026, 3)
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
          due_date: '2026-03-05',
          sequence_number: 2,
          assignee: null,
          project: null,
        },
      ],
    })

    const result = await getTicketsForCalendar('org-1', 2026, 3)
    expect(result[0]!.assignee_name).toBeNull()
    expect(result[0]!.project_title).toBeNull()
  })

  it('returns empty array on database error', async () => {
    supabaseMock.results.push({ data: null, error: { message: 'DB error' } })

    const result = await getTicketsForCalendar('org-1', 2026, 3)
    expect(result).toEqual([])
  })

  it('passes filters through to query (does not crash)', async () => {
    supabaseMock.results.push({ data: [] })

    const result = await getTicketsForCalendar('org-1', 2026, 3, {
      assignee_id: 'u-1',
      project_id: 'p-1',
      priority: ['high', 'critical'],
    })
    expect(result).toEqual([])
  })

  it('handles empty data array', async () => {
    supabaseMock.results.push({ data: [] })
    const result = await getTicketsForCalendar('org-1', 2026, 3)
    expect(result).toEqual([])
  })

  it('handles null data', async () => {
    supabaseMock.results.push({ data: null })
    const result = await getTicketsForCalendar('org-1', 2026, 3)
    expect(result).toEqual([])
  })
})
