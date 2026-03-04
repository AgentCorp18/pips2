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
 * Server action to capture an email before template download.
 *
 * Currently logs the download request. In production, this would:
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

  const { email, templateId } = parsed.data

  // Log the download event (replace with database insert when Supabase table is ready)
  console.info('[template-download]', {
    email,
    templateId,
    timestamp: new Date().toISOString(),
  })

  return {
    success: true,
    error: null,
    templateId,
  }
}
