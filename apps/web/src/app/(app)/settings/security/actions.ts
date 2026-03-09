'use server'

import { createClient } from '@/lib/supabase/server'
import { changePasswordSchema } from '@/lib/validations'

export type ChangePasswordActionState = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string>
}

export const changePassword = async (
  _prev: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> => {
  const raw = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const result = changePasswordSchema.safeParse(raw)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string') {
        fieldErrors[field] = issue.message
      }
    }
    return { fieldErrors }
  }

  const supabase = await createClient()

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: 'You must be signed in to change your password' }
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: result.data.currentPassword,
  })

  if (signInError) {
    return { fieldErrors: { currentPassword: 'Current password is incorrect' } }
  }

  // Update to the new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: result.data.newPassword,
  })

  if (updateError) {
    console.error('Password change error:', updateError.message)
    return { error: 'Failed to update password. Please try again.' }
  }

  return { success: 'Password updated successfully' }
}
