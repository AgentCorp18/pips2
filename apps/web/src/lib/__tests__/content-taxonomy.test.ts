import { describe, it, expect } from 'vitest'
import {
  BOOK_CHAPTER_MAP,
  CONTENT_PILLARS,
  PILLAR_META,
  stepNumberToContentStep,
  formTypeToContentTool,
  buildProductContext,
  matchContentNodes,
  groupByPillar,
} from '@pips/shared'
import type { ContentNode, ContentPillar, ContentTags } from '@pips/shared'

/* ============================================================
   BOOK_CHAPTER_MAP
   ============================================================ */

describe('BOOK_CHAPTER_MAP', () => {
  it('has entries for all book chapters including appendices', () => {
    expect(BOOK_CHAPTER_MAP.length).toBeGreaterThanOrEqual(18)
  })

  it('each entry has required fields', () => {
    for (const ch of BOOK_CHAPTER_MAP) {
      expect(ch).toHaveProperty('chapter')
      expect(ch).toHaveProperty('title')
      expect(ch).toHaveProperty('steps')
      expect(ch).toHaveProperty('tools')
      expect(ch).toHaveProperty('principles')
      expect(typeof ch.chapter).toBe('string')
      expect(typeof ch.title).toBe('string')
      expect(Array.isArray(ch.steps)).toBe(true)
      expect(Array.isArray(ch.tools)).toBe(true)
      expect(Array.isArray(ch.principles)).toBe(true)
    }
  })

  it('maps step chapters to correct step tags', () => {
    const ch04 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch04')
    expect(ch04?.steps).toContain('step-1')

    const ch05 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch05')
    expect(ch05?.steps).toContain('step-2')
    expect(ch05?.tools).toContain('fishbone')

    const ch09 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch09')
    expect(ch09?.steps).toContain('step-6')
    expect(ch09?.tools).toContain('before-after')
  })

  it('philosophy chapters have philosophy step tag', () => {
    const ch01 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch01')
    expect(ch01?.steps).toContain('philosophy')

    const ch03 = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'ch03')
    expect(ch03?.steps).toContain('philosophy')
    expect(ch03?.principles).toContain('data-over-opinions')
    expect(ch03?.principles).toContain('expand-then-contract')
    expect(ch03?.principles).toContain('close-the-loop')
  })

  it('appendix chapters have all tools listed', () => {
    const appendixA = BOOK_CHAPTER_MAP.find((c) => c.chapter === 'appendix-a')
    expect(appendixA?.tools.length).toBeGreaterThan(10)
    expect(appendixA?.tools).toContain('fishbone')
    expect(appendixA?.tools).toContain('raci')
    expect(appendixA?.tools).toContain('criteria-matrix')
  })

  it('has unique chapter IDs', () => {
    const ids = BOOK_CHAPTER_MAP.map((c) => c.chapter)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

/* ============================================================
   CONTENT_PILLARS & PILLAR_META
   ============================================================ */

describe('CONTENT_PILLARS', () => {
  it('has 4 pillars', () => {
    expect(CONTENT_PILLARS).toEqual(['book', 'guide', 'workbook', 'workshop'])
  })
})

describe('PILLAR_META', () => {
  it('has metadata for each pillar', () => {
    for (const pillar of CONTENT_PILLARS) {
      const meta = PILLAR_META[pillar]
      expect(meta).toHaveProperty('label')
      expect(meta).toHaveProperty('description')
      expect(meta).toHaveProperty('icon')
      expect(typeof meta.label).toBe('string')
      expect(meta.label.length).toBeGreaterThan(0)
    }
  })

  it('book pillar has correct label', () => {
    expect(PILLAR_META.book.label).toBe('Book')
  })

  it('workshop pillar has correct label', () => {
    expect(PILLAR_META.workshop.label).toBe('Workshop')
  })
})

/* ============================================================
   stepNumberToContentStep
   ============================================================ */

describe('stepNumberToContentStep', () => {
  it('converts step numbers 1-6 to step-N tags', () => {
    expect(stepNumberToContentStep(1)).toBe('step-1')
    expect(stepNumberToContentStep(2)).toBe('step-2')
    expect(stepNumberToContentStep(3)).toBe('step-3')
    expect(stepNumberToContentStep(4)).toBe('step-4')
    expect(stepNumberToContentStep(5)).toBe('step-5')
    expect(stepNumberToContentStep(6)).toBe('step-6')
  })

  it('returns overview for invalid step numbers', () => {
    expect(stepNumberToContentStep(0)).toBe('overview')
    expect(stepNumberToContentStep(7)).toBe('overview')
    expect(stepNumberToContentStep(-1)).toBe('overview')
  })
})

/* ============================================================
   formTypeToContentTool
   ============================================================ */

describe('formTypeToContentTool', () => {
  it('converts snake_case form types to kebab-case tool tags', () => {
    expect(formTypeToContentTool('problem_statement')).toBe('problem-statement')
    expect(formTypeToContentTool('fishbone')).toBe('fishbone')
    expect(formTypeToContentTool('five_why')).toBe('five-why')
    expect(formTypeToContentTool('force_field')).toBe('force-field')
    expect(formTypeToContentTool('criteria_matrix')).toBe('criteria-matrix')
    expect(formTypeToContentTool('paired_comparisons')).toBe('paired-comparisons')
    expect(formTypeToContentTool('raci')).toBe('raci')
    expect(formTypeToContentTool('implementation_plan')).toBe('implementation-plan')
    expect(formTypeToContentTool('milestone_tracker')).toBe('milestone-tracker')
    expect(formTypeToContentTool('before_after')).toBe('before-after')
    expect(formTypeToContentTool('evaluation')).toBe('evaluation')
    expect(formTypeToContentTool('lessons_learned')).toBe('lessons-learned')
    expect(formTypeToContentTool('balance_sheet')).toBe('balance-sheet')
  })

  it('returns null for unknown form types', () => {
    expect(formTypeToContentTool('unknown_type')).toBeNull()
    expect(formTypeToContentTool('')).toBeNull()
  })
})

/* ============================================================
   buildProductContext
   ============================================================ */

describe('buildProductContext', () => {
  it('builds context from step number only', () => {
    const ctx = buildProductContext(1)
    expect(ctx.steps).toEqual(['step-1'])
    expect(ctx.tools).toEqual([])
    expect(ctx.roles).toEqual([])
    expect(ctx.principles).toEqual([])
  })

  it('builds context from step number and form type', () => {
    const ctx = buildProductContext(2, 'fishbone')
    expect(ctx.steps).toEqual(['step-2'])
    expect(ctx.tools).toEqual(['fishbone'])
  })

  it('builds empty context with no args', () => {
    const ctx = buildProductContext()
    expect(ctx.steps).toEqual([])
    expect(ctx.tools).toEqual([])
  })

  it('handles unknown form type gracefully', () => {
    const ctx = buildProductContext(3, 'nonexistent')
    expect(ctx.steps).toEqual(['step-3'])
    expect(ctx.tools).toEqual([])
  })
})

/* ============================================================
   matchContentNodes
   ============================================================ */

const makeNode = (
  id: string,
  pillar: ContentPillar,
  steps: string[],
  tools: string[],
  sortOrder: number = 0,
): ContentNode => ({
  id,
  pillar,
  title: id,
  slug: id,
  parentId: null,
  tags: {
    steps,
    pillar,
    tools,
    roles: [],
    principles: [],
    difficulty: 'beginner',
    contentType: 'conceptual',
  } as ContentTags,
  summary: '',
  bodyMd: null,
  estimatedReadMinutes: 5,
  sourceFile: '',
  sortOrder,
  accessLevel: 'paid',
  relatedNodes: [],
})

describe('matchContentNodes', () => {
  const nodes = [
    makeNode('book/ch04', 'book', ['step-1'], ['problem-statement'], 0),
    makeNode('book/ch05', 'book', ['step-2'], ['fishbone'], 1),
    makeNode('guide/step-1', 'guide', ['step-1'], ['problem-statement'], 2),
    makeNode('workbook/step-1', 'workbook', ['step-1'], [], 3),
    makeNode('workshop/module-2', 'workshop', ['step-1'], [], 4),
    makeNode('book/ch10', 'book', ['culture'], [], 5),
  ]

  it('matches nodes by step tag', () => {
    const ctx = buildProductContext(1)
    const matches = matchContentNodes(nodes, ctx)
    // Matches: ch04 (step-1), guide/step-1, workbook/step-1, workshop/module-2
    // Also ch05 and ch10 because toolMatch is true when context.tools is empty (OR logic)
    const ids = matches.map((n) => n.id)
    expect(ids).toContain('book/ch04')
    expect(ids).toContain('guide/step-1')
    expect(ids).toContain('workbook/step-1')
    expect(ids).toContain('workshop/module-2')
  })

  it('matches nodes by tool tag', () => {
    const ctx = buildProductContext(undefined, 'fishbone')
    const matches = matchContentNodes(nodes, ctx)
    // When steps is empty, stepMatch is true for all nodes (OR logic)
    // All nodes match because empty steps dimension means "any step"
    const ids = matches.map((n) => n.id)
    expect(ids).toContain('book/ch05')
  })

  it('returns all nodes when context is empty', () => {
    const ctx = buildProductContext()
    const matches = matchContentNodes(nodes, ctx)
    expect(matches.length).toBe(nodes.length)
  })
})

/* ============================================================
   groupByPillar
   ============================================================ */

describe('groupByPillar', () => {
  it('groups nodes by pillar, taking lowest sortOrder', () => {
    const nodes = [
      makeNode('book/ch04', 'book', ['step-1'], [], 10),
      makeNode('book/ch05', 'book', ['step-2'], [], 5),
      makeNode('guide/step-1', 'guide', ['step-1'], [], 3),
      makeNode('workbook/ex1', 'workbook', ['step-1'], [], 7),
    ]

    const grouped = groupByPillar(nodes)
    expect(grouped.book?.id).toBe('book/ch05') // lower sortOrder
    expect(grouped.guide?.id).toBe('guide/step-1')
    expect(grouped.workbook?.id).toBe('workbook/ex1')
    expect(grouped.workshop).toBeNull()
  })

  it('returns null for missing pillars', () => {
    const grouped = groupByPillar([])
    expect(grouped.book).toBeNull()
    expect(grouped.guide).toBeNull()
    expect(grouped.workbook).toBeNull()
    expect(grouped.workshop).toBeNull()
  })
})
