'use server'

import { z } from 'zod'

const templateDownloadSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  templateId: z.string().min(1, 'Template ID is required'),
})

export type TemplateDownloadState = {
  success: boolean
  error: string | null
  templateId: string | null
}

/**
 * Server action to handle a template download request.
 *
 * Template file delivery is not yet implemented. The action validates inputs
 * but always returns a "coming soon" error until delivery is wired up:
 * 1. Store the email + template in a `template_downloads` table
 * 2. Add the email to a marketing list (Resend audience, etc.)
 * 3. Return a signed download URL
 */
export const requestTemplateDownload = async (
  _prevState: TemplateDownloadState,
  formData: FormData,
): Promise<TemplateDownloadState> => {
  const raw = {
    email: formData.get('email'),
    templateId: formData.get('templateId'),
  }

  const parsed = templateDownloadSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
      templateId: null,
    }
  }

  // Template file delivery is not yet implemented.
  // Return an honest "coming soon" error so the UI shows the correct message.
  return {
    success: false,
    error: 'Template downloads are coming soon. Please check back later.',
    templateId: null,
  }
}
