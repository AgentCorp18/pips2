/**
 * PIPS One-Pager PDF generation.
 *
 * Generates a professional 2-page A4 PDF summarizing all 6 PIPS steps with
 * their conclusions and key data points. Steps that are not yet completed
 * show "To be completed" placeholder text.
 *
 * Design: consulting-grade deliverable with branded header, step-colored
 * accent bars, summary overview card, team member listing, and page numbers.
 */

import { jsPDF } from 'jspdf'

/* ============================================================
   Types
   ============================================================ */

export type OnePagerStepData = {
  number: number
  name: string
  color: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  summary: string[]
}

export type OnePagerData = {
  projectName: string
  orgName: string
  description: string | null
  ownerName: string
  createdAt: string
  targetDate: string | null
  status: string
  steps: OnePagerStepData[]
  members: Array<{ displayName: string; role: string }>
}

/* ============================================================
   Constants
   ============================================================ */

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN_LEFT = 18
const MARGIN_RIGHT = 18
const MARGIN_TOP = 16
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const LINE_HEIGHT = 5
const FOOTER_Y = PAGE_HEIGHT - 14

// Brand colors
const PRIMARY: [number, number, number] = [79, 70, 229]
const DEEP: [number, number, number] = [27, 19, 64]
const TEXT_PRIMARY: [number, number, number] = [30, 27, 46]
const TEXT_SECONDARY: [number, number, number] = [107, 114, 128]
const WHITE: [number, number, number] = [255, 255, 255]
const BG_LIGHT: [number, number, number] = [240, 237, 250]
const BORDER_LIGHT: [number, number, number] = [220, 216, 236]

/** The 6 PIPS step brand colors for the header dot strip */
const STEP_DOT_COLORS: [number, number, number][] = [
  [59, 130, 246], // Step 1 — #3B82F6
  [245, 158, 11], // Step 2 — #F59E0B
  [16, 185, 129], // Step 3 — #10B981
  [99, 102, 241], // Step 4 — #6366F1
  [202, 138, 4], // Step 5 — #CA8A04
  [8, 145, 178], // Step 6 — #0891B2
]

/* ============================================================
   Helpers
   ============================================================ */

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [79, 70, 229]
  return [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
}

/** Lighten an RGB color by mixing with white */
const lighten = (rgb: [number, number, number], amount: number): [number, number, number] => [
  Math.round(rgb[0] + (255 - rgb[0]) * amount),
  Math.round(rgb[1] + (255 - rgb[1]) * amount),
  Math.round(rgb[2] + (255 - rgb[2]) * amount),
]

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const formatStatus = (status: string): string =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const truncate = (text: string, maxLen: number): string =>
  text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text

/* ============================================================
   Header Dot Strip
   ============================================================ */

/**
 * Renders the PIPS branded dot strip: 6 colored circles representing
 * the 6 methodology steps.
 */
const renderDotStrip = (doc: jsPDF, x: number, y: number, radius: number, gap: number) => {
  for (let i = 0; i < STEP_DOT_COLORS.length; i++) {
    const dotX = x + i * (radius * 2 + gap) + radius
    doc.setFillColor(...STEP_DOT_COLORS[i]!)
    doc.circle(dotX, y, radius, 'F')
  }
}

/* ============================================================
   Overview Summary Card
   ============================================================ */

/**
 * Renders a bordered summary card with project overview information.
 * Returns the new Y position after the card.
 */
const renderOverviewCard = (doc: jsPDF, data: OnePagerData, y: number): number => {
  const cardX = MARGIN_LEFT
  const cardWidth = CONTENT_WIDTH
  const cardPadding = 6
  const innerX = cardX + cardPadding
  const innerWidth = cardWidth - cardPadding * 2
  const colWidth = innerWidth / 2

  // Calculate card height
  let contentHeight = 8 // top padding
  if (data.description) {
    const descLines = doc.splitTextToSize(truncate(data.description, 280), innerWidth) as string[]
    contentHeight += descLines.length * 4.5 + 6
  }
  contentHeight += 22 // meta grid rows + bottom padding

  // Card background
  doc.setFillColor(...BG_LIGHT)
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.3)
  doc.roundedRect(cardX, y, cardWidth, contentHeight, 2, 2, 'FD')

  let cy = y + cardPadding

  // Section label
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text('PROJECT OVERVIEW', innerX, cy + 2)
  cy += 6

  // Description
  if (data.description) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_PRIMARY)
    const descLines = doc.splitTextToSize(truncate(data.description, 280), innerWidth) as string[]
    doc.text(descLines, innerX, cy + 3)
    cy += descLines.length * 4.5 + 4
  }

  // Divider inside card
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.2)
  doc.line(innerX, cy, innerX + innerWidth, cy)
  cy += 4

  // Meta grid — 2 columns
  const metaItems: Array<{ label: string; value: string }> = [
    { label: 'Owner', value: data.ownerName },
    { label: 'Organization', value: data.orgName || 'N/A' },
    { label: 'Created', value: formatDate(data.createdAt) },
    { label: 'Target Date', value: data.targetDate ? formatDate(data.targetDate) : 'Not set' },
  ]

  for (let i = 0; i < metaItems.length; i += 2) {
    const left = metaItems[i]!
    const right = metaItems[i + 1]

    // Left column
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT_SECONDARY)
    doc.text(left.label.toUpperCase(), innerX, cy + 2.5)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_PRIMARY)
    doc.text(truncate(left.value, 40), innerX, cy + 7)

    // Right column
    if (right) {
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT_SECONDARY)
      doc.text(right.label.toUpperCase(), innerX + colWidth, cy + 2.5)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...TEXT_PRIMARY)
      doc.text(truncate(right.value, 40), innerX + colWidth, cy + 7)
    }

    cy += 10
  }

  return y + contentHeight + 6
}

/* ============================================================
   Step Progress Bar (mini)
   ============================================================ */

/**
 * Renders a compact step progress bar showing completion status of all 6 steps.
 */
const renderProgressBar = (doc: jsPDF, steps: OnePagerStepData[], y: number): number => {
  const barX = MARGIN_LEFT
  const barWidth = CONTENT_WIDTH
  const segmentWidth = (barWidth - 5 * 2) / 6 // 6 segments with 2mm gaps
  const barHeight = 4

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!
    const rgb = hexToRgb(step.color)
    const sx = barX + i * (segmentWidth + 2)

    if (step.status === 'completed') {
      doc.setFillColor(...rgb)
    } else if (step.status === 'in_progress') {
      doc.setFillColor(...lighten(rgb, 0.5))
    } else {
      doc.setFillColor(230, 228, 240)
    }

    doc.roundedRect(sx, y, segmentWidth, barHeight, 1, 1, 'F')

    // Step number label
    doc.setFontSize(5.5)
    doc.setFont('helvetica', 'bold')
    if (step.status === 'completed') {
      doc.setTextColor(...WHITE)
    } else if (step.status === 'in_progress') {
      doc.setTextColor(...rgb)
    } else {
      doc.setTextColor(...TEXT_SECONDARY)
    }
    doc.text(`${step.number}`, sx + segmentWidth / 2, y + barHeight - 0.8, { align: 'center' })
  }

  return y + barHeight + 5
}

/* ============================================================
   Step Section Renderer
   ============================================================ */

const renderStepSection = (doc: jsPDF, step: OnePagerStepData, y: number, maxY: number): number => {
  const rgb = hexToRgb(step.color)
  const availableHeight = maxY - y

  // Minimum space needed: header + at least one line of content
  if (availableHeight < 22) return y

  // Step header background bar
  const headerHeight = 9
  doc.setFillColor(...lighten(rgb, 0.88))
  doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, headerHeight, 1.5, 1.5, 'F')

  // Left accent bar (thick colored strip)
  doc.setFillColor(...rgb)
  doc.roundedRect(MARGIN_LEFT, y, 3, headerHeight, 1.5, 0, 'F')
  doc.rect(MARGIN_LEFT + 1.5, y, 1.5, headerHeight, 'F') // fill the right side of the rounded rect

  // Step number badge
  doc.setFillColor(...rgb)
  doc.circle(MARGIN_LEFT + 10, y + headerHeight / 2, 3.2, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(`${step.number}`, MARGIN_LEFT + 10, y + headerHeight / 2 + 1.2, { align: 'center' })

  // Step name
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT_PRIMARY)
  doc.text(step.name, MARGIN_LEFT + 16, y + headerHeight / 2 + 1.5)

  // Status badge on the right
  const statusText = formatStatus(step.status)
  const statusBadgeWidth = doc.getTextWidth(statusText) * 1.5 + 6
  const statusBadgeX = PAGE_WIDTH - MARGIN_RIGHT - statusBadgeWidth - 2
  const statusBadgeY = y + 1.5

  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')

  if (step.status === 'completed') {
    doc.setFillColor(220, 252, 231)
    doc.setTextColor(22, 101, 52)
  } else if (step.status === 'in_progress') {
    doc.setFillColor(219, 234, 254)
    doc.setTextColor(29, 78, 216)
  } else if (step.status === 'skipped') {
    doc.setFillColor(243, 244, 246)
    doc.setTextColor(107, 114, 128)
  } else {
    doc.setFillColor(243, 244, 246)
    doc.setTextColor(107, 114, 128)
  }

  doc.roundedRect(statusBadgeX, statusBadgeY, statusBadgeWidth, 6, 1, 1, 'F')
  doc.text(statusText, statusBadgeX + statusBadgeWidth / 2, statusBadgeY + 4.2, { align: 'center' })

  y += headerHeight + 4

  // Summary content or placeholder
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_PRIMARY)

  if (step.status === 'not_started' && step.summary.length === 0) {
    doc.setTextColor(...TEXT_SECONDARY)
    doc.setFont('helvetica', 'italic')
    doc.text('To be completed', MARGIN_LEFT + 6, y + 3)
    y += 8
  } else {
    const contentX = MARGIN_LEFT + 6
    const contentWidth = CONTENT_WIDTH - 12

    for (const line of step.summary) {
      if (y + LINE_HEIGHT > maxY) break

      // Handle label: value pairs
      const colonIdx = line.indexOf(': ')
      if (colonIdx > 0 && colonIdx < 35) {
        const label = line.slice(0, colonIdx + 1)
        const value = line.slice(colonIdx + 2)

        // Bullet
        doc.setFillColor(...rgb)
        doc.circle(contentX + 1, y + 2.5, 0.8, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...TEXT_PRIMARY)
        doc.setFontSize(8)
        doc.text(label, contentX + 4, y + 3)
        const labelWidth = doc.getTextWidth(label)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(75, 85, 99)
        const valueLines = doc.splitTextToSize(
          truncate(value, 200),
          contentWidth - labelWidth - 6,
        ) as string[]
        doc.text(valueLines[0] ?? '', contentX + 4 + labelWidth + 1, y + 3)
        y += LINE_HEIGHT

        // Wrap remaining value lines
        for (let i = 1; i < valueLines.length && y + LINE_HEIGHT <= maxY; i++) {
          doc.text(valueLines[i] ?? '', contentX + 8, y + 3)
          y += LINE_HEIGHT
        }
      } else {
        // Regular text — wrap as needed with bullet
        doc.setFillColor(...rgb)
        doc.circle(contentX + 1, y + 2.5, 0.8, 'F')

        const wrapped = doc.splitTextToSize(truncate(line, 300), contentWidth - 4) as string[]
        for (let j = 0; j < wrapped.length; j++) {
          if (y + LINE_HEIGHT > maxY) break
          doc.setTextColor(...TEXT_PRIMARY)
          doc.text(wrapped[j]!, j === 0 ? contentX + 4 : contentX + 4, y + 3)
          y += LINE_HEIGHT
        }
      }
    }
  }

  // Spacing after section
  y += 5

  return y
}

/* ============================================================
   Team Members Section
   ============================================================ */

const renderTeamMembers = (
  doc: jsPDF,
  members: OnePagerData['members'],
  y: number,
  maxY: number,
): number => {
  if (members.length === 0 || y + 24 > maxY) return y

  // Section header
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text('TEAM MEMBERS', MARGIN_LEFT, y + 3)
  y += 7

  // Divider
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.3)
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y)
  y += 5

  // Render members in a grid (3 columns)
  const colWidth = CONTENT_WIDTH / 3
  const itemsPerRow = 3

  for (let i = 0; i < members.length; i += itemsPerRow) {
    if (y + 10 > maxY) break

    for (let j = 0; j < itemsPerRow; j++) {
      const member = members[i + j]
      if (!member) break

      const mx = MARGIN_LEFT + j * colWidth

      // Member name
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT_PRIMARY)
      doc.text(truncate(member.displayName, 22), mx, y + 3)

      // Role badge
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...TEXT_SECONDARY)
      doc.text(formatStatus(member.role), mx, y + 8)
    }

    y += 12
  }

  return y
}

/* ============================================================
   Footer Helper
   ============================================================ */

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setPage(pageNum)

  // Footer divider
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.3)
  doc.line(MARGIN_LEFT, FOOTER_Y - 4, PAGE_WIDTH - MARGIN_RIGHT, FOOTER_Y - 4)

  // Left: PIPS branding + generated date
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text('PIPS', MARGIN_LEFT, FOOTER_Y)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)
  const generatedText = `  Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  doc.text(generatedText, MARGIN_LEFT + doc.getTextWidth('PIPS'), FOOTER_Y)

  // Right: page number
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT, FOOTER_Y, {
    align: 'right',
  })

  // Colored dot strip in footer (very small)
  const dotStartX = PAGE_WIDTH / 2 - (6 * 3 + 5 * 1.5) / 2
  for (let i = 0; i < STEP_DOT_COLORS.length; i++) {
    doc.setFillColor(...STEP_DOT_COLORS[i]!)
    doc.circle(dotStartX + i * 4.5, FOOTER_Y - 0.3, 1.2, 'F')
  }
}

/* ============================================================
   Page Header (for page 2+)
   ============================================================ */

const renderContinuationHeader = (doc: jsPDF, projectName: string): number => {
  let y = MARGIN_TOP

  // Thin colored bar at very top of page
  const barHeight = 1.5
  const segmentWidth = PAGE_WIDTH / 6
  for (let i = 0; i < STEP_DOT_COLORS.length; i++) {
    doc.setFillColor(...STEP_DOT_COLORS[i]!)
    doc.rect(i * segmentWidth, 0, segmentWidth, barHeight, 'F')
  }

  y += 2

  // Continuation header
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text('PIPS', MARGIN_LEFT, y + 3)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)
  doc.text(`${truncate(projectName, 60)} — One-Pager Summary (continued)`, MARGIN_LEFT + 14, y + 3)

  // Thin divider
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.2)
  y += 5
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y)
  y += 5

  return y
}

/* ============================================================
   PDF Generation
   ============================================================ */

export const generateOnePagerPDF = (data: OnePagerData): Uint8Array => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  /* ============================================================
     PAGE 1 — Header + Overview + Steps 1-3
     ============================================================ */

  let y = MARGIN_TOP

  // --- Top color bar (6 step colors across the top) ---
  const barHeight = 2
  const segmentWidth = PAGE_WIDTH / 6
  for (let i = 0; i < STEP_DOT_COLORS.length; i++) {
    doc.setFillColor(...STEP_DOT_COLORS[i]!)
    doc.rect(i * segmentWidth, 0, segmentWidth, barHeight, 'F')
  }

  // --- Header background ---
  doc.setFillColor(...BG_LIGHT)
  doc.rect(0, barHeight, PAGE_WIDTH, 44, 'F')

  // --- PIPS branding with dot strip ---
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DEEP)
  doc.text('PIPS', MARGIN_LEFT, y + 6)

  // Dot strip next to the logo
  renderDotStrip(doc, MARGIN_LEFT + doc.getTextWidth('PIPS') + 4, y + 3.5, 1.8, 2)

  // Subtitle
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)
  doc.text('Process Improvement Project Summary', MARGIN_LEFT, y + 11)

  // Status badge top-right
  const statusText = formatStatus(data.status)
  const statusWidth = doc.getTextWidth(statusText) + 8
  doc.setFillColor(...PRIMARY)
  doc.roundedRect(PAGE_WIDTH - MARGIN_RIGHT - statusWidth, y, statusWidth, 7, 1.5, 1.5, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(statusText, PAGE_WIDTH - MARGIN_RIGHT - statusWidth / 2, y + 5, { align: 'center' })

  y += 17

  // --- Project title ---
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT_PRIMARY)
  const titleLines = doc.splitTextToSize(data.projectName, CONTENT_WIDTH - 10) as string[]
  doc.text(titleLines[0] ?? data.projectName, MARGIN_LEFT, y + 6)
  if (titleLines.length > 1) {
    doc.setFontSize(16)
    doc.text(titleLines[1] ?? '', MARGIN_LEFT, y + 13)
    y += 7
  }
  y += 12

  // Organization name
  if (data.orgName) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_SECONDARY)
    doc.text(data.orgName, MARGIN_LEFT, y + 3)
    y += 6
  }

  y += 6

  // --- Step progress bar ---
  y = renderProgressBar(doc, data.steps, y)

  // --- Overview card ---
  y = renderOverviewCard(doc, data, y)

  // --- Steps 1-3 ---
  const page1MaxY = FOOTER_Y - 6
  for (let i = 0; i < 3; i++) {
    const step = data.steps[i]
    if (!step) continue

    // Check if there's enough room for at least the header
    if (y + 22 > page1MaxY) break
    y = renderStepSection(doc, step, y, page1MaxY)
  }

  // Page 1 footer
  addFooter(doc, 1, 2)

  /* ============================================================
     PAGE 2 — Steps 4-6 + Team Members
     ============================================================ */

  doc.addPage()

  // Continuation header
  y = renderContinuationHeader(doc, data.projectName)

  // Steps 4-6
  const page2MaxY = FOOTER_Y - 8
  for (let i = 3; i < 6; i++) {
    const step = data.steps[i]
    if (!step) continue
    if (y + 22 > page2MaxY) break
    y = renderStepSection(doc, step, y, page2MaxY)
  }

  // Team members section
  y = renderTeamMembers(doc, data.members, y, page2MaxY)

  // Confidentiality notice
  if (y + 12 < FOOTER_Y) {
    y = Math.max(y, FOOTER_Y - 20)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...TEXT_SECONDARY)
    doc.text(
      'This document is confidential and intended for internal use only.',
      PAGE_WIDTH / 2,
      y + 3,
      { align: 'center' },
    )
  }

  // Page 2 footer
  addFooter(doc, 2, 2)

  return doc.output('arraybuffer') as unknown as Uint8Array
}
