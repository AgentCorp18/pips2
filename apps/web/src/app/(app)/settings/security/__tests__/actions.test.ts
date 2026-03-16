import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ============================================================
   Mocks — must be before imports
   ============================================================ */

const mockGetUser = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockUpdateUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: () => mockGetUser(),
      signInWithPassword: (args: { email: string; password: string }) =>
        mockSignInWithPassword(args),
      updateUser: (args: { password: string }) => mockUpdateUser(args),
    },
  })),
}))

/* ============================================================
   Import after mocks
   ============================================================ */

import { changePassword } from '../actions'

/* ============================================================
   Helpers
   ============================================================ */

const makeFormData = (fields: Record<string, string>): FormData => {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const emptyState = {}

const validPasswordFields = {
  currentPassword: 'OldPass1!',
  newPassword: 'NewSecure99!',
  confirmPassword: 'NewSecure99!',
}

/* ============================================================
   changePassword
   ============================================================ */

describe('changePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ---------- Validation errors ---------- */

  it('returns fieldErrors when currentPassword is empty', async () => {
    const fd = makeFormData({ ...validPasswordFields, currentPassword: '' })
    const result = await changePassword(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.currentPassword).toBeDefined()
  })

  it('returns fieldErrors when newPassword is too short', async () => {
    const fd = makeFormData({
      ...validPasswordFields,
      newPassword: 'short',
      confirmPassword: 'short',
    })
    const result = await changePassword(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.newPassword).toBeDefined()
  })

  it('returns fieldErrors when newPassword is too long', async () => {
    const longPass = 'a'.repeat(73)
    const fd = makeFormData({
      ...validPasswordFields,
      newPassword: longPass,
      confirmPassword: longPass,
    })
    const result = await changePassword(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.newPassword).toBeDefined()
  })

  it('returns fieldErrors when confirmPassword does not match newPassword', async () => {
    const fd = makeFormData({ ...validPasswordFields, confirmPassword: 'DifferentPass1!' })
    const result = await changePassword(emptyState, fd)
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors?.confirmPassword).toBeDefined()
  })

  /* ---------- Auth errors ---------- */

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const fd = makeFormData(validPasswordFields)
    const result = await changePassword(emptyState, fd)
    expect(result).toEqual({ error: 'You must be signed in to change your password' })
  })

  it('returns error when authenticated user has no email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: undefined } } })

    const fd = makeFormData(validPasswordFields)
    const result = await changePassword(emptyState, fd)
    expect(result).toEqual({ error: 'You must be signed in to change your password' })
  })

  /* ---------- Incorrect current password ---------- */

  it('returns fieldError when current password is incorrect', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } })

    const fd = makeFormData(validPasswordFields)
    const result = await changePassword(emptyState, fd)
    expect(result).toEqual({ fieldErrors: { currentPassword: 'Current password is incorrect' } })
  })

  /* ---------- Update failure ---------- */

  it('returns error when password update fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: { message: 'Update failed' } })

    const fd = makeFormData(validPasswordFields)
    const result = await changePassword(emptyState, fd)
    expect(result).toEqual({ error: 'Failed to update password. Please try again.' })
  })

  /* ---------- Success path ---------- */

  it('returns success when password is updated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } })
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })

    const fd = makeFormData(validPasswordFields)
    const result = await changePassword(emptyState, fd)
    expect(result).toEqual({ success: 'Password updated successfully' })
  })

  it('calls signInWithPassword with correct email and current password', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'alice@test.com' } } })
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })

    const fd = makeFormData(validPasswordFields)
    await changePassword(emptyState, fd)

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'alice@test.com',
      password: validPasswordFields.currentPassword,
    })
  })

  it('calls updateUser with the new password', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'alice@test.com' } } })
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })

    const fd = makeFormData(validPasswordFields)
    await changePassword(emptyState, fd)

    expect(mockUpdateUser).toHaveBeenCalledWith({ password: validPasswordFields.newPassword })
  })

  it('does not call signInWithPassword or updateUser on validation failure', async () => {
    const fd = makeFormData({ ...validPasswordFields, currentPassword: '' })
    await changePassword(emptyState, fd)

    expect(mockSignInWithPassword).not.toHaveBeenCalled()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })
})
