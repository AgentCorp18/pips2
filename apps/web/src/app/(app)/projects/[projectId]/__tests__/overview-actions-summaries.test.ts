import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

let fromCallIndex = 0
let fromResults: Array<{ data?: unknown; error?: unknown }> = []

const createChainForIndex = (idx: number) => {
  const terminal = () => {
    const result = fromResults[idx] ?? { data: null, error: null }
    return Promise.resolve(result)
  }

  const chain: Record<string, unknown> = {}
  const proxy = new Proxy(chain, {
    get(_target, prop) {
      if (prop === 'then') {
        const p = terminal()
        return p.then.bind(p)
      }
      return (..._args: unknown[]) => proxy
    },
  })

  return proxy
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => {
      const idx = fromCallIndex++
      return createChainForIndex(idx)
    },
  })),
}))

vi.mock('@/lib/permissions', () => ({
  getUserOrg: vi.fn().mockResolvedValue({ org_id: 'org-1' }),
  requirePermission: vi.fn(),
}))

vi.mock('@pips/shared', async () => {
  const actual = await vi.importActual<typeof import('@pips/shared')>('@pips/shared')
  return {
    ...actual,
  }
})

/* ============================================================
   Import after mocks
   ============================================================ */

import { getStepSummaries } from '../overview-actions'

/* ============================================================
   Tests
   ============================================================ */

describe('getStepSummaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fromCallIndex = 0
    fromResults = []
  })

  it('returns empty object when no forms exist', async () => {
    // Call 0: project lookup — project exists; Call 1: forms query — empty
    fromResults = [{ data: { id: 'proj-1' } }, { data: [] }]
    const result = await getStepSummaries('proj-1')
    expect(result).toEqual({})
  })

  it('returns empty object when query returns null', async () => {
    // Call 0: project lookup — project not found → early return {}
    fromResults = [{ data: null }]
    const result = await getStepSummaries('proj-1')
    expect(result).toEqual({})
  })

  it('extracts problem statement from step 1', async () => {
    // Call 0: project lookup, Call 1: forms query
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'identify',
            form_type: 'problem_statement',
            data: {
              problemStatement: 'Defect rate is 8%, target is 2%',
              problemArea: 'quality',
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[1]).toBeDefined()
    expect(result[1]?.highlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Problem Statement',
          value: expect.stringContaining('Defect rate'),
        }),
        expect.objectContaining({ label: 'Problem Area', value: 'quality' }),
      ]),
    )
  })

  it('extracts fishbone causes from step 2', async () => {
    // Call 0: project lookup, Call 1: forms query
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'analyze',
            form_type: 'fishbone',
            data: {
              problemStatement: 'test',
              categories: [
                { name: 'People', causes: [{ text: 'Lack of training', subCauses: [] }] },
                {
                  name: 'Process',
                  causes: [
                    { text: 'No SOP', subCauses: [] },
                    { text: 'Manual steps', subCauses: [] },
                  ],
                },
                { name: 'Equipment', causes: [] },
              ],
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[2]).toBeDefined()
    expect(result[2]?.highlights[0]).toEqual(
      expect.objectContaining({
        label: 'Root Causes Identified',
        value: '3 causes across 3 categories',
      }),
    )
  })

  it('extracts five-why root cause from step 2', async () => {
    // Call 0: project lookup, Call 1: forms query
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'analyze',
            form_type: 'five_why',
            data: {
              problemStatement: 'test',
              whys: [{ question: 'why?', answer: 'because' }],
              rootCause: 'Inadequate training programs',
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[2]?.highlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Root Cause', value: 'Inadequate training programs' }),
      ]),
    )
  })

  it('extracts brainstorming ideas from step 3', async () => {
    // Call 0: project lookup, Call 1: forms query
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'generate',
            form_type: 'brainstorming',
            data: {
              ideas: [
                { id: '1', text: 'Automate process', author: '', votes: 3, category: '' },
                { id: '2', text: 'Add training', author: '', votes: 1, category: '' },
                { id: '3', text: 'New tool', author: '', votes: 0, category: '' },
              ],
              selectedIdeas: ['1'],
              eliminatedIdeas: [],
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[3]).toBeDefined()
    expect(result[3]?.highlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Ideas Generated', value: '3 ideas' }),
        expect.objectContaining({
          label: 'Top Ideas',
          value: expect.stringContaining('Automate process'),
        }),
      ]),
    )
  })

  it('extracts criteria matrix winner from step 4', async () => {
    // Call 0: project lookup, Call 1: forms query
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'select_plan',
            form_type: 'criteria_matrix',
            data: {
              criteria: [{ name: 'Cost', weight: 5, description: '' }],
              solutions: [
                { name: 'Solution A', scores: { Cost: 3 } },
                { name: 'Solution B', scores: { Cost: 5 } },
              ],
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[4]).toBeDefined()
    expect(result[4]?.highlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Top-Ranked Solution', value: 'Solution B' }),
      ]),
    )
  })

  it('extracts milestone progress from step 5', async () => {
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'implement',
            form_type: 'milestone_tracker',
            data: {
              milestones: [
                {
                  id: '1',
                  title: 'M1',
                  status: 'completed',
                  targetDate: '',
                  completedDate: null,
                  description: '',
                  deliverables: [],
                },
                {
                  id: '2',
                  title: 'M2',
                  status: 'in_progress',
                  targetDate: '',
                  completedDate: null,
                  description: '',
                  deliverables: [],
                },
              ],
              overallProgress: 50,
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[5]).toBeDefined()
    expect(result[5]?.highlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Milestones', value: '1 of 2 completed' }),
        expect.objectContaining({ label: 'Progress', value: '50%' }),
      ]),
    )
  })

  it('extracts evaluation data from step 6', async () => {
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'evaluate',
            form_type: 'before_after',
            data: {
              metrics: [
                { name: 'Defect Rate', before: '8', after: '3', unit: '%', improvement: '-62.5%' },
              ],
              summary: 'Significant improvement achieved',
            },
          },
          {
            step: 'evaluate',
            form_type: 'evaluation',
            data: {
              goalsAchieved: true,
              goalDetails: '',
              effectivenessRating: 4,
              sustainabilityRating: 3,
              teamSatisfactionRating: 5,
              unexpectedOutcomes: '',
              recommendations: '',
              nextSteps: '',
            },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[6]).toBeDefined()
    expect(result[6]?.highlights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Metrics Tracked', value: '1 metrics' }),
        expect.objectContaining({
          label: 'Results Summary',
          value: 'Significant improvement achieved',
        }),
        expect.objectContaining({ label: 'Goals Achieved', value: 'Yes' }),
        expect.objectContaining({ label: 'Effectiveness', value: '4/5' }),
      ]),
    )
  })

  it('handles multiple steps in one query', async () => {
    fromResults = [
      { data: { id: 'proj-1' } },
      {
        data: [
          {
            step: 'identify',
            form_type: 'problem_statement',
            data: { problemStatement: 'Issue X', problemArea: 'cost' },
          },
          {
            step: 'analyze',
            form_type: 'five_why',
            data: { problemStatement: '', whys: [], rootCause: 'Root Y' },
          },
        ],
      },
    ]
    const result = await getStepSummaries('proj-1')
    expect(result[1]).toBeDefined()
    expect(result[2]).toBeDefined()
    expect(Object.keys(result)).toHaveLength(2)
  })
})
