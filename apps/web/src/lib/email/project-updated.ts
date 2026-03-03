/**
 * "Project step advanced" email template.
 */

import { baseTemplate, ctaButton, escapeHtml } from './base-template'

const STEP_COLORS: Record<string, string> = {
  identify: '#3B82F6',
  analyze: '#F59E0B',
  generate: '#10B981',
  'select & plan': '#6366F1',
  implement: '#CA8A04',
  evaluate: '#0891B2',
}

const STEP_NUMBERS: Record<string, string> = {
  identify: '1',
  analyze: '2',
  generate: '3',
  'select & plan': '4',
  implement: '5',
  evaluate: '6',
}

export type ProjectUpdatedParams = {
  recipientName: string
  projectName: string
  newStep: string
  projectUrl: string
}

export const projectUpdatedTemplate = ({
  recipientName,
  projectName,
  newStep,
  projectUrl,
}: ProjectUpdatedParams): string => {
  const stepKey = newStep.toLowerCase()
  const stepColor = STEP_COLORS[stepKey] ?? '#4F46E5'
  const stepNumber = STEP_NUMBERS[stepKey] ?? ''
  const stepLabel = stepNumber ? `Step ${stepNumber}: ${newStep}` : newStep

  const safeName = escapeHtml(recipientName)
  const safeProject = escapeHtml(projectName)
  const safeStep = escapeHtml(stepLabel)

  const body = `
    <p style="margin:0 0 16px;">Hi ${safeName},</p>

    <p style="margin:0 0 20px;">
      Project <strong>${safeProject}</strong> has advanced to a new step:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;
                  margin-bottom:20px;">
      <tr>
        <td style="padding:20px;text-align:center;">
          <span style="display:inline-block;padding:8px 24px;border-radius:20px;
                       background-color:${stepColor};color:#FFFFFF;font-weight:700;
                       font-size:15px;letter-spacing:0.02em;">
            ${safeStep}
          </span>
        </td>
      </tr>
    </table>

    ${ctaButton('View Project in PIPS', projectUrl)}
  `

  return baseTemplate({
    preheader: `${safeProject} moved to ${safeStep}`,
    body,
  })
}
