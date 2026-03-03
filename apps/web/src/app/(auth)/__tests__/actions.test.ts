import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockResetPasswordForEmail = vi.fn()
const mockUpdateUser = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Build a FormData instance from a plain object.
 */
const buildFormData = (fields: Record<string, string>): FormData => {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value)
  }
  return fd
}

const emptyState = {}

/* ============================================================
   Import after mocks
   ============================================================ */

import { login, signup, forgotPassword, resetPassword, logout } from '../actions'

/* ============================================================
   login
   ============================================================ */

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ---------- Validation errors ---------- */

  it('returns error when email is missing', async () => {
    const fd = buildFormData({ password: 'password123' })
    const result = await login(emptyState, fd)
    expect(result.error).toBeDefined()
    expect(result.success).toBeUndefined()
  })

  it('returns error when password is missing', async () => {
    const fd = buildFormData({ email: 'user@example.com' })
    const result = await login(emptyState, fd)
    expect(result.error).toBeDefined()
    expect(result.success).toBeUndefined()
  })

  it('returns error when email is invalid', async () => {
    const fd = buildFormData({ email: 'not-an-email', password: 'password123' })
    const result = await login(emptyState, fd)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('returns error when password is empty string', async () => {
    const fd = buildFormData({ email: 'user@example.com', password: '' })
    const result = await login(emptyState, fd)
    expect(result.error).toBe('Password is required')
  })

  it('returns error when both fields are missing', async () => {
    const fd = buildFormData({})
    const result = await login(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  /* ---------- Supabase error path ---------- */

  it('returns generic error when Supabase auth fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })

    const fd = buildFormData({ email: 'user@example.com', password: 'wrongpass' })
    const result = await login(emptyState, fd)

    expect(result.error).toBe('Invalid email or password')
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'wrongpass',
    })
  })

  it('returns email confirmation error when email is not confirmed', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Email not confirmed', code: 'email_not_confirmed' },
    })

    const fd = buildFormData({ email: 'user@example.com', password: 'password123' })
    const result = await login(emptyState, fd)

    expect(result.error).toBe(
      'Please confirm your email address before signing in. Check your inbox for a confirmation link.',
    )
  })

  /* ---------- Success path ---------- */

  it('redirects to /dashboard on successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    const fd = buildFormData({ email: 'user@example.com', password: 'correctpass' })

    await expect(login(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('calls signInWithPassword with validated credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })

    const fd = buildFormData({ email: 'test@domain.com', password: 'mypassword' })

    await expect(login(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@domain.com',
      password: 'mypassword',
    })
  })

  it('does not call Supabase when validation fails', async () => {
    const fd = buildFormData({ email: 'bad', password: '' })
    await login(emptyState, fd)
    expect(mockSignInWithPassword).not.toHaveBeenCalled()
  })
})

/* ============================================================
   signup
   ============================================================ */

describe('signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ---------- Validation errors ---------- */

  it('returns error when displayName is missing', async () => {
    const fd = buildFormData({ email: 'user@example.com', password: 'securepass1' })
    const result = await signup(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  it('returns error when displayName is too short', async () => {
    const fd = buildFormData({
      displayName: 'A',
      email: 'user@example.com',
      password: 'securepass1',
    })
    const result = await signup(emptyState, fd)
    expect(result.error).toBe('Name must be at least 2 characters')
  })

  it('returns error when email is invalid', async () => {
    const fd = buildFormData({
      displayName: 'Marc',
      email: 'not-valid',
      password: 'securepass1',
    })
    const result = await signup(emptyState, fd)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('returns error when password is too short', async () => {
    const fd = buildFormData({
      displayName: 'Marc',
      email: 'marc@example.com',
      password: 'short',
    })
    const result = await signup(emptyState, fd)
    expect(result.error).toBe('Password must be at least 8 characters')
  })

  it('returns error when password exceeds 72 characters', async () => {
    const fd = buildFormData({
      displayName: 'Marc',
      email: 'marc@example.com',
      password: 'a'.repeat(73),
    })
    const result = await signup(emptyState, fd)
    expect(result.error).toBe('Password must be less than 72 characters')
  })

  it('returns error when all fields are missing', async () => {
    const fd = buildFormData({})
    const result = await signup(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  /* ---------- Supabase error path ---------- */

  it('returns generic error message on auth failure (no internal details leaked)', async () => {
    mockSignUp.mockResolvedValue({
      error: { message: 'User already registered' },
    })

    const fd = buildFormData({
      displayName: 'Marc',
      email: 'marc@example.com',
      password: 'securepass1',
    })
    const result = await signup(emptyState, fd)

    // Should NOT expose the raw Supabase error (prevents email enumeration)
    expect(result.error).toBe(
      'Unable to create account. Please try again or use a different email.',
    )
  })

  /* ---------- Success path ---------- */

  it('returns success message when signup succeeds', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    const fd = buildFormData({
      displayName: 'Marc Albers',
      email: 'marc@example.com',
      password: 'securepass1',
    })
    const result = await signup(emptyState, fd)

    expect(result.success).toBe(
      'Check your email for a confirmation link to complete your registration.',
    )
    expect(result.error).toBeUndefined()
  })

  it('passes display_name in options.data to signUp', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.pips.com'
    mockSignUp.mockResolvedValue({ error: null })

    const fd = buildFormData({
      displayName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    })
    await signup(emptyState, fd)

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'password123',
      options: {
        emailRedirectTo: 'https://app.pips.com/login',
        data: {
          display_name: 'Jane Doe',
        },
      },
    })
  })

  it('does not call Supabase when validation fails', async () => {
    const fd = buildFormData({ displayName: 'M', email: 'bad', password: 'x' })
    await signup(emptyState, fd)
    expect(mockSignUp).not.toHaveBeenCalled()
  })
})

/* ============================================================
   forgotPassword
   ============================================================ */

describe('forgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ---------- Validation errors ---------- */

  it('returns error when email is missing', async () => {
    const fd = buildFormData({})
    const result = await forgotPassword(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  it('returns error when email is invalid', async () => {
    const fd = buildFormData({ email: 'not-an-email' })
    const result = await forgotPassword(emptyState, fd)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('returns error for empty email string', async () => {
    const fd = buildFormData({ email: '' })
    const result = await forgotPassword(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  /* ---------- Supabase error path ---------- */

  it('returns success even on error to prevent email enumeration', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'Rate limit exceeded' },
    })

    const fd = buildFormData({ email: 'user@example.com' })
    const result = await forgotPassword(emptyState, fd)

    // Should always return success to prevent email enumeration
    expect(result.success).toBe(
      'If an account exists with that email, you will receive a password reset link.',
    )
    expect(result.error).toBeUndefined()
  })

  /* ---------- Success path ---------- */

  it('returns success message on valid request', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    const fd = buildFormData({ email: 'user@example.com' })
    const result = await forgotPassword(emptyState, fd)

    expect(result.success).toBe(
      'If an account exists with that email, you will receive a password reset link.',
    )
    expect(result.error).toBeUndefined()
  })

  it('passes redirectTo with NEXT_PUBLIC_APP_URL to resetPasswordForEmail', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.pips.com'
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    const fd = buildFormData({ email: 'user@example.com' })
    await forgotPassword(emptyState, fd)

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
      redirectTo: 'https://app.pips.com/reset-password',
    })
  })

  it('does not call Supabase when validation fails', async () => {
    const fd = buildFormData({ email: 'bad' })
    await forgotPassword(emptyState, fd)
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled()
  })
})

/* ============================================================
   resetPassword
   ============================================================ */

describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ---------- Validation errors ---------- */

  it('returns error when password is missing', async () => {
    const fd = buildFormData({ confirmPassword: 'newpassword1' })
    const result = await resetPassword(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  it('returns error when confirmPassword is missing', async () => {
    const fd = buildFormData({ password: 'newpassword1' })
    const result = await resetPassword(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  it('returns error when password is too short', async () => {
    const fd = buildFormData({ password: 'short', confirmPassword: 'short' })
    const result = await resetPassword(emptyState, fd)
    expect(result.error).toBe('Password must be at least 8 characters')
  })

  it('returns error when password exceeds 72 characters', async () => {
    const long = 'a'.repeat(73)
    const fd = buildFormData({ password: long, confirmPassword: long })
    const result = await resetPassword(emptyState, fd)
    expect(result.error).toBe('Password must be less than 72 characters')
  })

  it('returns error when passwords do not match', async () => {
    const fd = buildFormData({
      password: 'newpassword1',
      confirmPassword: 'differentpass',
    })
    const result = await resetPassword(emptyState, fd)
    expect(result.error).toBe('Passwords do not match')
  })

  it('returns error when both fields are empty', async () => {
    const fd = buildFormData({ password: '', confirmPassword: '' })
    const result = await resetPassword(emptyState, fd)
    expect(result.error).toBeDefined()
  })

  /* ---------- Supabase error path ---------- */

  it('returns generic error message on failure (no internal details leaked)', async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: 'Auth session expired' },
    })

    const fd = buildFormData({
      password: 'newpassword1',
      confirmPassword: 'newpassword1',
    })
    const result = await resetPassword(emptyState, fd)

    // Should NOT expose the raw Supabase error
    expect(result.error).toBe('Failed to reset password. Please try again.')
  })

  /* ---------- Success path ---------- */

  it('redirects to /dashboard on successful reset', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })

    const fd = buildFormData({
      password: 'newpassword1',
      confirmPassword: 'newpassword1',
    })

    await expect(resetPassword(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('calls updateUser with the new password', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })

    const fd = buildFormData({
      password: 'secureNewPass1',
      confirmPassword: 'secureNewPass1',
    })

    await expect(resetPassword(emptyState, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: 'secureNewPass1',
    })
  })

  it('does not call Supabase when validation fails', async () => {
    const fd = buildFormData({ password: 'abc', confirmPassword: 'def' })
    await resetPassword(emptyState, fd)
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })
})

/* ============================================================
   logout
   ============================================================ */

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signOut and redirects to /login', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('calls signOut before redirect', async () => {
    const callOrder: string[] = []

    mockSignOut.mockImplementation(async () => {
      callOrder.push('signOut')
      return { error: null }
    })
    mockRedirect.mockImplementation(() => {
      callOrder.push('redirect')
      throw new Error('NEXT_REDIRECT')
    })

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT')
    expect(callOrder).toEqual(['signOut', 'redirect'])
  })
})
