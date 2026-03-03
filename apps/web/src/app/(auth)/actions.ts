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
    if (error.code === 'email_not_confirmed') {
      return {
        error:
          'Please confirm your email address before signing in. Check your inbox for a confirmation link.',
      }
    }
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      data: {
        display_name: result.data.displayName,
      },
    },
  })

  if (error) {
    // Log the real error server-side but return a generic message to prevent
    // leaking internal details (e.g., "User already registered" enables enumeration)
    console.error('Signup error:', error.message)
    return { error: 'Unable to create account. Please try again or use a different email.' }
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
    // Log the real error server-side but return a generic message to prevent
    // email enumeration and leaking internal error details
    console.error('Password reset error:', error.message)
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
    console.error('Password reset error:', error.message)
    return { error: 'Failed to reset password. Please try again.' }
  }

  redirect('/dashboard')
}

export const logout = async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
