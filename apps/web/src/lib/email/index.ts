/**
 * Email module barrel export.
 */

export { sendEmail } from './send'
export type { SendEmailParams, SendEmailResult } from './send'

export { baseTemplate, ctaButton, escapeHtml } from './base-template'
export type { BaseTemplateParams } from './base-template'

export { ticketAssignedTemplate } from './ticket-assigned'
export type { TicketAssignedParams } from './ticket-assigned'

export { mentionTemplate } from './mention'
export type { MentionParams } from './mention'

export { projectUpdatedTemplate } from './project-updated'
export type { ProjectUpdatedParams } from './project-updated'

export { invitationTemplate } from './invitation'
export type { InvitationParams } from './invitation'

export { welcomeTemplate } from './welcome'
export type { WelcomeParams } from './welcome'

export { overdueDigestTemplate } from './overdue-digest'
export type { OverdueDigestParams, OverdueProject, OverdueTicket } from './overdue-digest'
