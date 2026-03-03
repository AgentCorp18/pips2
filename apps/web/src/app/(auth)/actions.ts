'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations'

export type AuthActionState = {
  error?: string
  success?: string
}

export const login = async (
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  redirect('/dashboard')
}

export const signup = async (
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const raw = {
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const result = signupSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        display_name: result.data.displayName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: 'Check your email for a confirmation link to complete your registration.',
  }
}

export const forgotPassword = async (
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const raw = { email: formData.get('email') }

  const result = forgotPasswordSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  // Always show success to prevent email enumeration
  return {
    success: 'If an account exists with that email, you will receive a password reset link.',
  }
}

export const resetPassword = async (
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> => {
  const raw = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const result = resetPasswordSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export const logout = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
