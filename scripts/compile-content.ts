#!/usr/bin/env npx tsx
/**
 * Content Compiler — Parses Book markdown into ContentNode JSON
 *
 * Usage: npx tsx scripts/compile-content.ts
 *
 * Reads: ../PIPS/Book/*.md (the PIPS book source files)
 * Writes: scripts/output/content-nodes.json
 *
 * Each markdown file is split on ## headings into sections.
 * Sections are tagged with steps, tools, and principles based on
 * the BOOK_CHAPTER_MAP from the shared content taxonomy.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// Inline the types and mapping to avoid monorepo build dep issues in scripts
type ContentPillar = 'book' | 'guide' | 'workbook' | 'workshop'
type ContentAccessLevel = 'public' | 'free-registered' | 'paid'

type ContentNode = {
  id: string
  pillar: ContentPillar
  title: string
  slug: string
  parentId: string | null
  tags: Record<string, unknown>
  summary: string
  bodyMd: string | null
  estimatedReadMinutes: number
  sourceFile: string
  sortOrder: number
  accessLevel: ContentAccessLevel
  relatedNodes: string[]
}

type ChapterMapping = {
  chapter: string
  title: string
  filePattern: string
  steps: string[]
  tools: string[]
  principles: string[]
  accessLevel: ContentAccessLevel
}

// Book file → chapter mapping with tags
const CHAPTERS: ChapterMapping[] = [
  {
    chapter: 'foreword',
    filePattern: '00-Foreword',
    title: 'Foreword',
    steps: ['overview'],
    tools: [],
    principles: [],
    accessLevel: 'public',
  },
  {
    chapter: 'introduction',
    filePattern: '01-Introduction',
    title: 'Introduction',
    steps: ['overview'],
    tools: [],
    principles: [],
    accessLevel: 'public',
  },
  {
    chapter: 'ch01',
    filePattern: '02-Chapter01',
    title: 'The Problem With Problems',
    steps: ['philosophy'],
    tools: [],
    principles: [],
    accessLevel: 'free-registered',
  },
  {
    chapter: 'ch02',
    filePattern: '03-Chapter02',
    title: 'What PIPS Is',
    steps: ['overview'],
    tools: [],
    principles: ['close-the-loop'],
    accessLevel: 'free-registered',
  },
  {
    chapter: 'ch03',
    filePattern: '04-Chapter03',
    title: 'Three Principles',
    steps: ['philosophy'],
    tools: [],
    principles: ['data-over-opinions', 'expand-then-contract', 'close-the-loop'],
    accessLevel: 'free-registered',
  },
  {
    chapter: 'ch04',
    filePattern: '05-Chapter04',
    title: 'Step 1: Identify',
    steps: ['step-1'],
    tools: ['problem-statement', 'list-reduction', 'weighted-voting'],
    principles: ['data-over-opinions'],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch05',
    filePattern: '06-Chapter05',
    title: 'Step 2: Analyze',
    steps: ['step-2'],
    tools: ['fishbone', 'five-why', 'force-field', 'checksheet'],
    principles: ['data-over-opinions'],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch06',
    filePattern: '07-Chapter06',
    title: 'Step 3: Generate',
    steps: ['step-3'],
    tools: ['brainstorming', 'brainwriting'],
    principles: ['expand-then-contract'],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch07',
    filePattern: '08-Chapter07',
    title: 'Step 4: Select & Plan',
    steps: ['step-4'],
    tools: ['criteria-matrix', 'paired-comparisons', 'balance-sheet', 'cost-benefit', 'raci'],
    principles: ['expand-then-contract'],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch08',
    filePattern: '09-Chapter08',
    title: 'Step 5: Implement',
    steps: ['step-5'],
    tools: ['milestone-tracker', 'implementation-checklist'],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch09',
    filePattern: '10-Chapter09',
    title: 'Step 6: Evaluate',
    steps: ['step-6'],
    tools: ['before-after', 'evaluation', 'lessons-learned'],
    principles: ['close-the-loop'],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch10',
    filePattern: '11-Chapter10',
    title: 'Every Department',
    steps: ['culture'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch11',
    filePattern: '12-Chapter11',
    title: 'Scaling PIPS',
    steps: ['culture'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch12',
    filePattern: '13-Chapter12',
    title: 'Building Culture',
    steps: ['culture'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch13',
    filePattern: '14-Chapter13',
    title: "Facilitator's Playbook",
    steps: ['facilitation'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch14',
    filePattern: '15-Chapter14',
    title: 'When PIPS Fails',
    steps: ['philosophy'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'ch15',
    filePattern: '16-Chapter15',
    title: 'Living System',
    steps: ['culture'],
    tools: [],
    principles: ['close-the-loop'],
    accessLevel: 'paid',
  },
  {
    chapter: 'conclusion',
    filePattern: '17-Conclusion',
    title: 'Conclusion',
    steps: ['overview'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'appendix-a',
    filePattern: '18-Appendix-A',
    title: 'Toolkit Reference',
    steps: ['overview'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
  {
    chapter: 'appendix-b',
    filePattern: '19-Appendix-B',
    title: 'Quick Reference Card',
    steps: ['overview'],
    tools: [],
    principles: ['data-over-opinions', 'expand-then-contract', 'close-the-loop'],
    accessLevel: 'paid',
  },
  {
    chapter: 'appendix-c',
    filePattern: '20-Appendix-C',
    title: 'Bibliography',
    steps: ['overview'],
    tools: [],
    principles: [],
    accessLevel: 'paid',
  },
]

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const estimateReadMinutes = (text: string): number => {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

const extractSummary = (md: string): string => {
  // Take first non-heading, non-empty paragraph
  const lines = md.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && trimmed.length > 20) {
      return trimmed.slice(0, 200) + (trimmed.length > 200 ? '...' : '')
    }
  }
  return ''
}

const stripRxLogicBranding = (md: string): string => {
  // Remove any RxLogic-specific branding
  return md
    .replace(/RxLogic/gi, 'PIPS')
    .replace(/Rx Logic/gi, 'PIPS')
    .replace(/rxlogic/gi, 'pips')
}

const compileBookContent = (): ContentNode[] => {
  const bookDir = path.resolve(__dirname, '../../PIPS/Book')
  const nodes: ContentNode[] = []

  if (!fs.existsSync(bookDir)) {
    console.error(`Book directory not found: ${bookDir}`)
    console.error('Expected PIPS Book at: ../PIPS/Book/ (relative to PIPS2.0)')
    process.exit(1)
  }

  const mdFiles = fs
    .readdirSync(bookDir)
    .filter(
      (f) =>
        f.endsWith('.md') &&
        !f.startsWith('REVIEW') &&
        !f.startsWith('WORK') &&
        f !== '00-BOOK-OUTLINE.md',
    )
    .sort()

  console.log(`Found ${mdFiles.length} markdown files in ${bookDir}`)

  let globalSortOrder = 0

  for (const mapping of CHAPTERS) {
    const matchedFile = mdFiles.find((f) => f.startsWith(mapping.filePattern))
    if (!matchedFile) {
      console.warn(`  SKIP: No file matching pattern "${mapping.filePattern}"`)
      continue
    }

    const filePath = path.join(bookDir, matchedFile)
    const rawMd = fs.readFileSync(filePath, 'utf-8')
    const cleanMd = stripRxLogicBranding(rawMd)

    // Split full content into preamble (before first ##) and sections (## headings onward).
    // The chapter node stores only the preamble so it is not duplicated when section
    // child nodes are rendered separately by ContentReader.
    const firstSectionMatch = cleanMd.search(/^## /m)
    const chapterPreamble =
      firstSectionMatch === -1 ? cleanMd : cleanMd.slice(0, firstSectionMatch).trim()

    // Create chapter-level node
    const chapterId = `book/${mapping.chapter}`
    const chapterSlug = slugify(mapping.title)

    const chapterNode: ContentNode = {
      id: chapterId,
      pillar: 'book',
      title: mapping.title,
      slug: chapterSlug,
      parentId: null,
      tags: {
        steps: mapping.steps,
        pillar: 'book',
        tools: mapping.tools,
        roles: [],
        principles: mapping.principles,
        difficulty: 'beginner',
        contentType: 'conceptual',
      },
      summary: extractSummary(cleanMd),
      // Store only the preamble (content before the first ## section heading).
      // Sections are stored as child nodes and rendered separately — storing the
      // full content here would cause each chapter to render its content twice.
      bodyMd: chapterPreamble || null,
      // Use the full content length for read-time so the header estimate is accurate.
      estimatedReadMinutes: estimateReadMinutes(cleanMd),
      sourceFile: matchedFile,
      sortOrder: globalSortOrder++,
      accessLevel: mapping.accessLevel,
      relatedNodes: [],
    }

    nodes.push(chapterNode)

    // Split on ## headings to create section-level nodes
    const sections = cleanMd.split(/^## /m).slice(1) // skip content before first ##
    let sectionOrder = 0

    for (const section of sections) {
      const firstNewline = section.indexOf('\n')
      if (firstNewline === -1) continue

      const sectionTitle = section.slice(0, firstNewline).trim()
      const sectionBody = section.slice(firstNewline + 1).trim()

      if (sectionBody.length < 50) continue // Skip tiny sections

      const sectionSlug = slugify(sectionTitle)
      const sectionId = `book/${mapping.chapter}/${sectionSlug}`

      const sectionNode: ContentNode = {
        id: sectionId,
        pillar: 'book',
        title: sectionTitle,
        slug: sectionSlug,
        parentId: chapterId,
        tags: {
          steps: mapping.steps,
          pillar: 'book',
          tools: mapping.tools,
          roles: [],
          principles: mapping.principles,
          difficulty: 'beginner',
          contentType: 'conceptual',
        },
        summary: extractSummary(sectionBody),
        bodyMd: sectionBody,
        estimatedReadMinutes: estimateReadMinutes(sectionBody),
        sourceFile: matchedFile,
        sortOrder: globalSortOrder++,
        accessLevel: mapping.accessLevel,
        relatedNodes: [],
      }

      nodes.push(sectionNode)
      sectionOrder++
    }

    console.log(`  ${matchedFile}: 1 chapter + ${sectionOrder} sections`)
  }

  return nodes
}

const populateCrossLinks = (nodes: ContentNode[]): void => {
  // Cross-link nodes that share the same step or tool tags
  for (const node of nodes) {
    const tags = node.tags as { steps?: string[]; tools?: string[] }
    const relatedIds: string[] = []

    for (const other of nodes) {
      if (other.id === node.id) continue
      if (other.parentId === node.id || node.parentId === other.id) continue

      const otherTags = other.tags as { steps?: string[]; tools?: string[] }

      // Match on shared tools (strongest signal)
      const sharedTools = (tags.tools ?? []).filter((t: string) =>
        (otherTags.tools ?? []).includes(t),
      )

      if (sharedTools.length > 0) {
        relatedIds.push(other.id)
        continue
      }

      // Match on shared steps (if both are section-level, not chapter-level)
      if (node.parentId && other.parentId) {
        const sharedSteps = (tags.steps ?? []).filter((s: string) =>
          (otherTags.steps ?? []).includes(s),
        )
        if (sharedSteps.length > 0 && node.pillar !== other.pillar) {
          relatedIds.push(other.id)
        }
      }
    }

    // Limit to top 5 related
    node.relatedNodes = relatedIds.slice(0, 5)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const main = () => {
  console.log('=== PIPS Content Compiler ===\n')

  const bookNodes = compileBookContent()
  console.log(`\nCompiled ${bookNodes.length} book nodes`)

  // TODO: Add guide, workbook, workshop compilation when those sources are ready
  const allNodes = [...bookNodes]

  console.log('\nPopulating cross-links...')
  populateCrossLinks(allNodes)

  const outputDir = path.resolve(__dirname, 'output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, 'content-nodes.json')
  fs.writeFileSync(outputPath, JSON.stringify(allNodes, null, 2))
  console.log(`\nWrote ${allNodes.length} nodes to ${outputPath}`)

  // Summary stats
  const chapters = allNodes.filter((n) => !n.parentId).length
  const sections = allNodes.filter((n) => n.parentId).length
  const publicNodes = allNodes.filter((n) => n.accessLevel === 'public').length
  const freeNodes = allNodes.filter((n) => n.accessLevel === 'free-registered').length
  const paidNodes = allNodes.filter((n) => n.accessLevel === 'paid').length

  console.log(`\n--- Summary ---`)
  console.log(`  Chapters: ${chapters}`)
  console.log(`  Sections: ${sections}`)
  console.log(`  Public: ${publicNodes}, Free-registered: ${freeNodes}, Paid: ${paidNodes}`)
  console.log(`  Total: ${allNodes.length} content nodes`)
}

main()
