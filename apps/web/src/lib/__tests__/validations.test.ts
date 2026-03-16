import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createOrgSchema,
  createProjectSchema,
  createTicketSchema,
  updateTicketSchema,
  ticketFiltersSchema,
  createCommentSchema,
} from '../validations'

/* ============================================================
   Auth Schemas
   ============================================================ */

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    })
    expect(result.success).toBe(false)
  })

  it('fails with empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('fails with missing fields', () => {
    const result = loginSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  it('passes with valid data', () => {
    const result = signupSchema.safeParse({
      displayName: 'Marc Albers',
      email: 'marc@example.com',
      password: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('fails when displayName is too short', () => {
    const result = signupSchema.safeParse({
      displayName: 'M',
      email: 'marc@example.com',
      password: 'securepass123',
    })
    expect(result.success).toBe(false)
  })

  it('fails when password is less than 8 characters', () => {
    const result = signupSchema.safeParse({
      displayName: 'Marc',
      email: 'marc@example.com',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('fails when password exceeds 72 characters', () => {
    const result = signupSchema.safeParse({
      displayName: 'Marc',
      email: 'marc@example.com',
      password: 'a'.repeat(73),
    })
    expect(result.success).toBe(false)
  })

  it('fails with invalid email', () => {
    const result = signupSchema.safeParse({
      displayName: 'Marc',
      email: 'bademail',
      password: 'securepass123',
    })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('passes with valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'nope' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('passes when passwords match and meet requirements', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword1',
      confirmPassword: 'newpassword1',
    })
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpassword1',
      confirmPassword: 'differentpassword',
    })
    expect(result.success).toBe(false)
  })

  it('fails when password is too short', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})

/* ============================================================
   Organization Schemas
   ============================================================ */

describe('createOrgSchema', () => {
  it('passes with valid name and slug', () => {
    const result = createOrgSchema.safeParse({
      name: 'My Organization',
      slug: 'my-org',
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is too short', () => {
    const result = createOrgSchema.safeParse({
      name: 'A',
      slug: 'my-org',
    })
    expect(result.success).toBe(false)
  })

  it('fails when slug has uppercase letters', () => {
    const result = createOrgSchema.safeParse({
      name: 'My Org',
      slug: 'My-Org',
    })
    expect(result.success).toBe(false)
  })

  it('fails when slug starts with a hyphen', () => {
    const result = createOrgSchema.safeParse({
      name: 'My Org',
      slug: '-my-org',
    })
    expect(result.success).toBe(false)
  })
})

/* ============================================================
   Project Schemas
   ============================================================ */

describe('createProjectSchema', () => {
  it('passes with valid name', () => {
    const result = createProjectSchema.safeParse({
      name: 'New Project',
    })
    expect(result.success).toBe(true)
  })

  it('passes with name, description, and future date', () => {
    const futureDate = new Date()
    futureDate.setFullYear(futureDate.getFullYear() + 1)
    const result = createProjectSchema.safeParse({
      name: 'New Project',
      description: 'A test project',
      target_completion_date: futureDate.toISOString().split('T')[0],
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is missing', () => {
    const result = createProjectSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails when name is too short', () => {
    const result = createProjectSchema.safeParse({ name: 'AB' })
    expect(result.success).toBe(false)
  })

  it('fails when name is only whitespace', () => {
    const result = createProjectSchema.safeParse({ name: '   ' })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from name before validation', () => {
    const result = createProjectSchema.safeParse({ name: '  Valid Name  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Valid Name')
    }
  })

  it('allows empty description and date', () => {
    const result = createProjectSchema.safeParse({
      name: 'New Project',
      description: '',
      target_completion_date: '',
    })
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   Ticket Schemas
   ============================================================ */

describe('createTicketSchema', () => {
  it('passes with valid title', () => {
    const result = createTicketSchema.safeParse({
      title: 'Fix login bug',
    })
    expect(result.success).toBe(true)
  })

  it('applies default values for type, status, and priority', () => {
    const result = createTicketSchema.safeParse({
      title: 'Fix login bug',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('general')
      expect(result.data.status).toBe('backlog')
      expect(result.data.priority).toBe('medium')
    }
  })

  it('fails when title is missing', () => {
    const result = createTicketSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('fails when title is empty', () => {
    const result = createTicketSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('fails with invalid priority value', () => {
    const result = createTicketSchema.safeParse({
      title: 'A ticket',
      priority: 'urgent',
    })
    expect(result.success).toBe(false)
  })

  it('fails with invalid type value', () => {
    const result = createTicketSchema.safeParse({
      title: 'A ticket',
      type: 'epic',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid optional fields', () => {
    const result = createTicketSchema.safeParse({
      title: 'Implement PIPS Step 2',
      description: 'Root cause analysis for defect tracking',
      type: 'pips_project',
      status: 'todo',
      priority: 'high',
      due_date: '2026-12-31',
    })
    expect(result.success).toBe(true)
  })
})

describe('updateTicketSchema', () => {
  it('passes with partial update data', () => {
    const result = updateTicketSchema.safeParse({
      status: 'done',
    })
    expect(result.success).toBe(true)
  })

  it('accepts null for assignee_id', () => {
    const result = updateTicketSchema.safeParse({
      assignee_id: null,
    })
    expect(result.success).toBe(true)
  })
})

describe('ticketFiltersSchema', () => {
  it('applies default values when no input is given', () => {
    const result = ticketFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.per_page).toBe(25)
      expect(result.data.sort_by).toBe('created_at')
      expect(result.data.sort_order).toBe('desc')
    }
  })

  it('fails with invalid sort_by value', () => {
    const result = ticketFiltersSchema.safeParse({
      sort_by: 'nonexistent_column',
    })
    expect(result.success).toBe(false)
  })

  it('coerces string page numbers', () => {
    const result = ticketFiltersSchema.safeParse({
      page: '3',
      per_page: '50',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.per_page).toBe(50)
    }
  })

  it('fails when per_page exceeds 100', () => {
    const result = ticketFiltersSchema.safeParse({
      per_page: 101,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid filter arrays', () => {
    const result = ticketFiltersSchema.safeParse({
      status: ['todo', 'in_progress'],
      priority: ['high', 'critical'],
    })
    expect(result.success).toBe(true)
  })
})

/* ============================================================
   Comment Schemas
   ============================================================ */

describe('createCommentSchema', () => {
  it('passes with valid body', () => {
    const result = createCommentSchema.safeParse({ body: 'Great work!' })
    expect(result.success).toBe(true)
  })

  it('fails with empty body', () => {
    const result = createCommentSchema.safeParse({ body: '' })
    expect(result.success).toBe(false)
  })

  it('fails when body exceeds 10000 characters', () => {
    const result = createCommentSchema.safeParse({ body: 'x'.repeat(10001) })
    expect(result.success).toBe(false)
  })
})
