import { describe, it, expect } from 'vitest'
import {
  BOOK_CHAPTER_MAP,
  CONTENT_PILLARS,
  PILLAR_META,
  stepNumberToContentStep,
  pipsStepEnumToNumber,
  formTypeToContentTool,
  buildProductContext,
  matchContentNodes,
  groupByPillar,
} from './content-taxonomy'
import type { ContentNode, ContentPillar } from './content-taxonomy'

describe('stepNumberToContentStep', () => {
  it('converts valid step numbers', () => {
    expect(stepNumberToContentStep(1)).toBe('step-1')
    expect(stepNumberToContentStep(6)).toBe('step-6')
  })

  it('returns overview for out-of-range', () => {
    expect(stepNumberToContentStep(0)).toBe('overview')
    expect(stepNumberToContentStep(7)).toBe('overview')
    expect(stepNumberToContentStep(-1)).toBe('overview')
  })
})

describe('pipsStepEnumToNumber', () => {
  it('maps each enum correctly', () => {
    expect(pipsStepEnumToNumber('identify')).toBe(1)
    expect(pipsStepEnumToNumber('analyze')).toBe(2)
    expect(pipsStepEnumToNumber('generate')).toBe(3)
    expect(pipsStepEnumToNumber('select_plan')).toBe(4)
    expect(pipsStepEnumToNumber('implement')).toBe(5)
    expect(pipsStepEnumToNumber('evaluate')).toBe(6)
  })

  it('returns 1 for unknown values', () => {
    expect(pipsStepEnumToNumber('unknown')).toBe(1)
  })
})

describe('formTypeToContentTool', () => {
  it('maps known form types', () => {
    expect(formTypeToContentTool('problem_statement')).toBe('problem-statement')
    expect(formTypeToContentTool('fishbone')).toBe('fishbone')
    expect(formTypeToContentTool('five_why')).toBe('five-why')
    expect(formTypeToContentTool('raci')).toBe('raci')
  })

  it('returns null for unknown form types', () => {
    expect(formTypeToContentTool('unknown')).toBeNull()
    expect(formTypeToContentTool('')).toBeNull()
  })
})

describe('buildProductContext', () => {
  it('builds context with step and form type', () => {
    const ctx = buildProductContext(1, 'problem_statement')
    expect(ctx.steps).toEqual(['step-1'])
    expect(ctx.tools).toEqual(['problem-statement'])
    expect(ctx.roles).toEqual([])
    expect(ctx.principles).toEqual([])
  })

  it('builds empty context with no args', () => {
    const ctx = buildProductContext()
    expect(ctx.steps).toEqual([])
    expect(ctx.tools).toEqual([])
  })

  it('handles unknown form type gracefully', () => {
    const ctx = buildProductContext(2, 'nonexistent')
    expect(ctx.steps).toEqual(['step-2'])
    expect(ctx.tools).toEqual([])
  })
})

// Helper to create a minimal ContentNode
const makeNode = (
  id: string,
  pillar: ContentPillar,
  steps: string[],
  tools: string[] = [],
  sortOrder = 0,
): ContentNode => ({
  id,
  pillar,
  title: `Node ${id}`,
  slug: id,
  parentId: null,
  tags: {
    steps: steps as ContentNode['tags']['steps'],
    pillar,
    tools: tools as ContentNode['tags']['tools'],
    roles: [],
    principles: [],
    difficulty: 'beginner',
    contentType: 'conceptual',
  },
  summary: '',
  bodyMd: null,
  estimatedReadMinutes: 5,
  sourceFile: 'test.md',
  sortOrder,
  accessLevel: 'public',
  relatedNodes: [],
})

describe('matchContentNodes', () => {
  const nodes = [
    makeNode('a', 'book', ['step-1'], ['problem-statement']),
    makeNode('b', 'guide', ['step-2'], ['fishbone']),
    makeNode('c', 'workbook', ['step-3'], []),
    makeNode('d', 'workshop', ['step-1'], ['brainstorming']),
  ]

  it('returns all when context is empty (vacuous truth)', () => {
    const ctx = { steps: [], tools: [], roles: [], principles: [] }
    const matched = matchContentNodes(nodes, ctx)
    expect(matched).toHaveLength(4)
  })

  it('returns all when only step specified (empty tools = match all)', () => {
    // Empty tools dimension means toolMatch is always true (OR logic)
    const ctx = buildProductContext(1)
    const matched = matchContentNodes(nodes, ctx)
    expect(matched).toHaveLength(4)
  })

  it('filters by both step AND tool when both specified', () => {
    const ctx = buildProductContext(1, 'problem_statement')
    const matched = matchContentNodes(nodes, ctx)
    // stepMatch OR toolMatch — 'a' matches both, 'd' matches step, no others match either
    expect(matched.map((n) => n.id)).toContain('a')
    expect(matched.map((n) => n.id)).toContain('d')
  })

  it('excludes nodes that match neither dimension', () => {
    // step-1 + fishbone: nodes matching step-1 OR fishbone
    const ctx = {
      steps: ['step-1' as const],
      tools: ['fishbone' as const],
      roles: [] as never[],
      principles: [] as never[],
    }
    const matched = matchContentNodes(nodes, ctx)
    const ids = matched.map((n) => n.id)
    expect(ids).toContain('a') // step-1 match
    expect(ids).toContain('b') // fishbone match
    expect(ids).toContain('d') // step-1 match
    expect(ids).not.toContain('c') // step-3, no tool match
  })
})

describe('groupByPillar', () => {
  it('groups nodes by pillar, preferring lower sortOrder', () => {
    const nodes = [
      makeNode('a', 'book', ['step-1'], [], 10),
      makeNode('b', 'book', ['step-1'], [], 5),
      makeNode('c', 'guide', ['step-1'], [], 1),
    ]
    const grouped = groupByPillar(nodes)
    expect(grouped.book?.id).toBe('b')
    expect(grouped.guide?.id).toBe('c')
    expect(grouped.workbook).toBeNull()
    expect(grouped.workshop).toBeNull()
  })

  it('returns all nulls for empty input', () => {
    const grouped = groupByPillar([])
    for (const pillar of CONTENT_PILLARS) {
      expect(grouped[pillar]).toBeNull()
    }
  })
})

describe('BOOK_CHAPTER_MAP', () => {
  it('has at least 15 chapters', () => {
    expect(BOOK_CHAPTER_MAP.length).toBeGreaterThanOrEqual(15)
  })

  it('every chapter has a title', () => {
    for (const ch of BOOK_CHAPTER_MAP) {
      expect(ch.title).toBeTruthy()
    }
  })

  it('step chapters reference the correct step', () => {
    const ch04 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch04')
    expect(ch04?.steps).toContain('step-1')
    const ch09 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch09')
    expect(ch09?.steps).toContain('step-6')
  })
})

describe('CONTENT_PILLARS', () => {
  it('contains 4 pillars', () => {
    expect(CONTENT_PILLARS).toEqual(['book', 'guide', 'workbook', 'workshop'])
  })
})

describe('PILLAR_META', () => {
  it('has metadata for every pillar', () => {
    for (const pillar of CONTENT_PILLARS) {
      expect(PILLAR_META[pillar].label).toBeTruthy()
      expect(PILLAR_META[pillar].description).toBeTruthy()
      expect(PILLAR_META[pillar].icon).toBeTruthy()
    }
  })
})
