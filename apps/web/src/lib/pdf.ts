/**
 * PDF generation and download utilities.
 *
 * Uses jspdf for lightweight client-side PDF creation.
 */

import { jsPDF } from 'jspdf'

/* ============================================================
   Types
   ============================================================ */

export type StepPDFData = {
  number: number
  name: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
}

export type TicketSummaryPDFData = {
  total: number
  open: number
  inProgress: number
  review: number
  done: number
  blocked: number
}

export type MemberPDFData = {
  displayName: string
  role: string
}

export type ProjectPDFData = {
  name: string
  description: string | null
  status: string
  currentStep: number
  currentStepName: string
  createdAt: string
  targetDate: string | null
  ownerName: string
  problemStatement: string | null
  steps: StepPDFData[]
  tickets: TicketSummaryPDFData
  members: MemberPDFData[]
}

/* ============================================================
   Constants
   ============================================================ */

const PAGE_WIDTH = 210
const MARGIN_LEFT = 20
const MARGIN_RIGHT = 20
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const LINE_HEIGHT = 6
const SECTION_GAP = 10
const HEADER_COLOR: [number, number, number] = [79, 70, 229] // PIPS primary #4F46E5
const TEXT_PRIMARY: [number, number, number] = [30, 27, 46] // #1E1B2E
const TEXT_SECONDARY: [number, number, number] = [107, 114, 128] // gray-500

/* ============================================================
   Helpers
   ============================================================ */

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

const addPageIfNeeded = (doc: jsPDF, y: number, requiredSpace: number): number => {
  if (y + requiredSpace > 280) {
    doc.addPage()
    return 20
  }
  return y
}

/* ============================================================
   PDF Generation
   ============================================================ */

/**
 * Generate a PDF summary for a PIPS project.
 *
 * @returns Uint8Array of the PDF file content
 */
export const generateProjectPDF = (project: ProjectPDFData): Uint8Array => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 20

  /* ---- Header ---- */
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...HEADER_COLOR)
  doc.text('PIPS Project Summary', MARGIN_LEFT, y)
  y += 10

  // Divider line
  doc.setDrawColor(...HEADER_COLOR)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y)
  y += SECTION_GAP

  /* ---- Project Info ---- */
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT_PRIMARY)
  doc.text(project.name, MARGIN_LEFT, y)
  y += LINE_HEIGHT + 2

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_SECONDARY)

  const infoLines = [
    `Status: ${formatStatus(project.status)}`,
    `Current Step: Step ${project.currentStep} - ${project.currentStepName}`,
    `Created: ${formatDate(project.createdAt)}`,
    `Target Date: ${project.targetDate ? formatDate(project.targetDate) : 'Not set'}`,
    `Owner: ${project.ownerName}`,
  ]

  for (const line of infoLines) {
    doc.text(line, MARGIN_LEFT, y)
    y += LINE_HEIGHT
  }

  if (project.description) {
    y += 2
    doc.setTextColor(...TEXT_PRIMARY)
    doc.setFont('helvetica', 'italic')
    const descLines = doc.splitTextToSize(project.description, CONTENT_WIDTH)
    doc.text(descLines as string[], MARGIN_LEFT, y)
    y += (descLines as string[]).length * LINE_HEIGHT
  }

  y += SECTION_GAP

  /* ---- Problem Statement (from Step 1) ---- */
  if (project.problemStatement) {
    y = addPageIfNeeded(doc, y, 30)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...HEADER_COLOR)
    doc.text('Problem Statement', MARGIN_LEFT, y)
    y += LINE_HEIGHT + 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_PRIMARY)
    const psLines = doc.splitTextToSize(project.problemStatement, CONTENT_WIDTH)
    doc.text(psLines as string[], MARGIN_LEFT, y)
    y += (psLines as string[]).length * LINE_HEIGHT + SECTION_GAP
  }

  /* ---- Step Progress ---- */
  y = addPageIfNeeded(doc, y, 20 + project.steps.length * LINE_HEIGHT)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...HEADER_COLOR)
  doc.text('Step Progress', MARGIN_LEFT, y)
  y += LINE_HEIGHT + 2

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_PRIMARY)

  for (const step of project.steps) {
    const statusIcon =
      step.status === 'completed'
        ? '[x]'
        : step.status === 'in_progress'
          ? '[-]'
          : step.status === 'skipped'
            ? '[~]'
            : '[ ]'
    doc.text(
      `${statusIcon} Step ${step.number}: ${step.name} - ${formatStatus(step.status)}`,
      MARGIN_LEFT,
      y,
    )
    y += LINE_HEIGHT
  }

  y += SECTION_GAP

  /* ---- Ticket Summary ---- */
  y = addPageIfNeeded(doc, y, 40)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...HEADER_COLOR)
  doc.text('Ticket Summary', MARGIN_LEFT, y)
  y += LINE_HEIGHT + 2

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_PRIMARY)

  const ticketLines = [
    `Total Tickets: ${project.tickets.total}`,
    `Open: ${project.tickets.open}`,
    `In Progress: ${project.tickets.inProgress}`,
    `In Review: ${project.tickets.review}`,
    `Done: ${project.tickets.done}`,
    `Blocked: ${project.tickets.blocked}`,
  ]

  for (const line of ticketLines) {
    doc.text(line, MARGIN_LEFT + 4, y)
    y += LINE_HEIGHT
  }

  y += SECTION_GAP

  /* ---- Team Members ---- */
  if (project.members.length > 0) {
    y = addPageIfNeeded(doc, y, 20 + project.members.length * LINE_HEIGHT)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...HEADER_COLOR)
    doc.text('Team Members', MARGIN_LEFT, y)
    y += LINE_HEIGHT + 2

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_PRIMARY)

    for (const member of project.members) {
      doc.text(`${member.displayName} - ${formatStatus(member.role)}`, MARGIN_LEFT + 4, y)
      y += LINE_HEIGHT
    }

    y += SECTION_GAP
  }

  /* ---- Footer ---- */
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_SECONDARY)
    doc.text(
      `Generated by PIPS on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      MARGIN_LEFT,
      290,
    )
  }

  // Return as Uint8Array
  return doc.output('arraybuffer') as unknown as Uint8Array
}

/* ============================================================
   Download Helper
   ============================================================ */

/**
 * Trigger a client-side file download of PDF content.
 *
 * Creates a temporary Blob + anchor element and programmatically clicks it.
 *
 * @param filename - Suggested file name (e.g. `project-summary-2026-03-03.pdf`)
 * @param data     - The PDF content as Uint8Array
 */
export const downloadPDF = (filename: string, data: Uint8Array): void => {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
