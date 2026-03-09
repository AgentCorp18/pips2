/**
 * PIPS One-Pager PDF generation.
 *
 * Generates a 2-page A4 PDF summarizing all 6 PIPS steps with their
 * conclusions and key data points. Steps that are not yet completed
 * show "To be completed" placeholder text.
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
const MARGIN_TOP = 18
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const LINE_HEIGHT = 5
const FOOTER_Y = PAGE_HEIGHT - 12

const PRIMARY: [number, number, number] = [79, 70, 229]
const TEXT_PRIMARY: [number, number, number] = [30, 27, 46]
const TEXT_SECONDARY: [number, number, number] = [107, 114, 128]
const WHITE: [number, number, number] = [255, 255, 255]
const BG_LIGHT: [number, number, number] = [245, 243, 255]

/* ============================================================
   Helpers
   ============================================================ */

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [79, 70, 229]
  return [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
}

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
   Step Section Renderer
   ============================================================ */

const renderStepSection = (doc: jsPDF, step: OnePagerStepData, y: number, maxY: number): number => {
  const rgb = hexToRgb(step.color)
  const availableHeight = maxY - y

  // Minimum space needed: accent bar + title + at least one line
  if (availableHeight < 20) return y

  // Colored accent bar
  doc.setFillColor(...rgb)
  doc.rect(MARGIN_LEFT, y, 3, 14, 'F')

  // Step number badge
  doc.setFillColor(...rgb)
  doc.roundedRect(MARGIN_LEFT + 6, y, 18, 7, 1, 1, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(`Step ${step.number}`, MARGIN_LEFT + 15, y + 5, { align: 'center' })

  // Step name
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT_PRIMARY)
  doc.text(step.name, MARGIN_LEFT + 27, y + 5.5)

  // Status badge
  const statusText = formatStatus(step.status)
  const statusX = PAGE_WIDTH - MARGIN_RIGHT
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')

  if (step.status === 'completed') {
    doc.setTextColor(5, 150, 105)
  } else if (step.status === 'in_progress') {
    doc.setTextColor(37, 99, 235)
  } else {
    doc.setTextColor(...TEXT_SECONDARY)
  }
  doc.text(statusText, statusX, y + 5.5, { align: 'right' })

  y += 11

  // Summary content or placeholder
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_PRIMARY)

  if (step.status === 'not_started' && step.summary.length === 0) {
    doc.setTextColor(...TEXT_SECONDARY)
    doc.setFont('helvetica', 'italic')
    doc.text('To be completed', MARGIN_LEFT + 6, y + 3)
    y += 8
  } else {
    const contentX = MARGIN_LEFT + 6
    const contentWidth = CONTENT_WIDTH - 6

    for (const line of step.summary) {
      if (y + LINE_HEIGHT > maxY) break

      // Handle label: value pairs
      const colonIdx = line.indexOf(': ')
      if (colonIdx > 0 && colonIdx < 30) {
        const label = line.slice(0, colonIdx + 1)
        const value = line.slice(colonIdx + 2)

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...TEXT_PRIMARY)
        doc.text(label, contentX, y + 3)
        const labelWidth = doc.getTextWidth(label)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...TEXT_PRIMARY)
        const valueLines = doc.splitTextToSize(
          truncate(value, 200),
          contentWidth - labelWidth - 2,
        ) as string[]
        doc.text(valueLines[0] ?? '', contentX + labelWidth + 1, y + 3)
        y += LINE_HEIGHT

        // Wrap remaining value lines
        for (let i = 1; i < valueLines.length && y + LINE_HEIGHT <= maxY; i++) {
          doc.text(valueLines[i] ?? '', contentX + 4, y + 3)
          y += LINE_HEIGHT
        }
      } else {
        // Regular text — wrap as needed
        const wrapped = doc.splitTextToSize(truncate(line, 300), contentWidth) as string[]
        for (const wl of wrapped) {
          if (y + LINE_HEIGHT > maxY) break
          doc.text(wl, contentX, y + 3)
          y += LINE_HEIGHT
        }
      }
    }
  }

  // Spacing after section
  y += 4

  return y
}

/* ============================================================
   PDF Generation
   ============================================================ */

export const generateOnePagerPDF = (data: OnePagerData): Uint8Array => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  /* ============================================================
     PAGE 1 — Header + Steps 1-3
     ============================================================ */

  let y = MARGIN_TOP

  // Header background
  doc.setFillColor(...BG_LIGHT)
  doc.rect(0, 0, PAGE_WIDTH, 42, 'F')

  // PIPS branding
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text('PIPS', MARGIN_LEFT, y + 4)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)
  doc.text('One-Pager Summary', MARGIN_LEFT + 14, y + 4)

  // Status badge top-right
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text(formatStatus(data.status), PAGE_WIDTH - MARGIN_RIGHT, y + 4, { align: 'right' })

  y += 10

  // Project title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT_PRIMARY)
  const titleLines = doc.splitTextToSize(data.projectName, CONTENT_WIDTH) as string[]
  doc.text(titleLines[0] ?? data.projectName, MARGIN_LEFT, y + 6)
  y += 12

  // Meta info line
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)

  const metaParts: string[] = []
  if (data.ownerName) metaParts.push(`Owner: ${data.ownerName}`)
  metaParts.push(`Created: ${formatDate(data.createdAt)}`)
  if (data.targetDate) metaParts.push(`Target: ${formatDate(data.targetDate)}`)
  doc.text(metaParts.join('  |  '), MARGIN_LEFT, y + 3)
  y += 10

  // Divider
  doc.setDrawColor(...PRIMARY)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y)
  y += 6

  // Description (if present, brief)
  if (data.description) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...TEXT_SECONDARY)
    const descLines = doc.splitTextToSize(
      truncate(data.description, 250),
      CONTENT_WIDTH,
    ) as string[]
    doc.text(descLines, MARGIN_LEFT, y + 3)
    y += descLines.length * LINE_HEIGHT + 4
  }

  // Steps 1-3
  const page1MaxY = FOOTER_Y - 4
  for (let i = 0; i < 3; i++) {
    const step = data.steps[i]
    if (!step) continue
    y = renderStepSection(doc, step, y, page1MaxY)
  }

  // Page 1 footer
  addFooter(doc, 1, 2)

  /* ============================================================
     PAGE 2 — Steps 4-6 + Footer
     ============================================================ */

  doc.addPage()
  y = MARGIN_TOP

  // Page 2 header
  doc.setFillColor(...BG_LIGHT)
  doc.rect(0, 0, PAGE_WIDTH, 14, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PRIMARY)
  doc.text('PIPS', MARGIN_LEFT, y + 3)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)
  doc.text(`${data.projectName} — One-Pager Summary (continued)`, MARGIN_LEFT + 14, y + 3)
  y += 12

  // Steps 4-6
  const page2MaxY = FOOTER_Y - 20
  for (let i = 3; i < 6; i++) {
    const step = data.steps[i]
    if (!step) continue
    y = renderStepSection(doc, step, y, page2MaxY)
  }

  // Team members section
  if (data.members.length > 0 && y + 20 < FOOTER_Y) {
    y += 4
    doc.setDrawColor(220, 220, 230)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT_PRIMARY)
    doc.text('Team Members', MARGIN_LEFT, y + 3)
    y += 7

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_SECONDARY)

    const memberStrs = data.members.map((m) => `${m.displayName} (${formatStatus(m.role)})`)
    const memberLine = memberStrs.join('  |  ')
    const memberLines = doc.splitTextToSize(memberLine, CONTENT_WIDTH) as string[]
    for (const ml of memberLines) {
      if (y + LINE_HEIGHT > FOOTER_Y - 8) break
      doc.text(ml, MARGIN_LEFT, y + 3)
      y += LINE_HEIGHT
    }
  }

  // Page 2 footer
  addFooter(doc, 2, 2)

  return doc.output('arraybuffer') as unknown as Uint8Array
}

/* ============================================================
   Footer Helper
   ============================================================ */

const addFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setPage(pageNum)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)

  doc.setDrawColor(220, 220, 230)
  doc.setLineWidth(0.2)
  doc.line(MARGIN_LEFT, FOOTER_Y - 3, PAGE_WIDTH - MARGIN_RIGHT, FOOTER_Y - 3)

  doc.text(
    `Generated by PIPS on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    MARGIN_LEFT,
    FOOTER_Y,
  )
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_WIDTH - MARGIN_RIGHT, FOOTER_Y, {
    align: 'right',
  })
}
