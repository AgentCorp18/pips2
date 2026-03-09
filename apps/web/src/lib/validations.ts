import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be less than 72 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

/* ============================================================
   Organization Schemas
   ============================================================ */

const slugPattern = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      slugPattern,
      'Slug must start and end with a letter or number, and can only contain lowercase letters, numbers, and hyphens',
    ),
})

export const updateOrgSettingsSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
  date_format: z.enum(['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd']),
  week_start: z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
  default_ticket_priority: z.enum(['critical', 'high', 'medium', 'low']),
  ticket_prefix: z
    .string()
    .min(2, 'Ticket prefix must be at least 2 characters')
    .max(10, 'Ticket prefix must be less than 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Ticket prefix must be uppercase letters and numbers only'),
})

/* ============================================================
   Project Schemas
   ============================================================ */

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Project name must be at least 3 characters')
    .max(200, 'Project name must be less than 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  target_completion_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true
        const date = new Date(val)
        if (isNaN(date.getTime())) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      },
      { message: 'Target date must be today or in the future' },
    ),
})

/* ============================================================
   Ticket Schemas
   ============================================================ */

const ticketStatuses = [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'blocked',
  'done',
  'cancelled',
] as const

const ticketPriorities = ['critical', 'high', 'medium', 'low', 'none'] as const

const ticketTypes = ['pips_project', 'task', 'bug', 'feature', 'general'] as const

export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  description: z
    .string()
    .max(10000, 'Description must be less than 10,000 characters')
    .optional()
    .or(z.literal('')),
  type: z.enum(ticketTypes).default('general'),
  status: z.enum(['backlog', 'todo', 'in_progress'] as const).default('backlog'),
  priority: z.enum(ticketPriorities).default('medium'),
  assignee_id: z.string().uuid().optional().or(z.literal('')),
  project_id: z.string().uuid().optional().or(z.literal('')),
  parent_id: z.string().uuid().optional().or(z.literal('')),
  due_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      { message: 'Invalid date format' },
    ),
  tags: z.string().optional().or(z.literal('')),
})

export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters')
    .optional(),
  description: z
    .string()
    .max(10000, 'Description must be less than 10,000 characters')
    .optional()
    .or(z.literal('')),
  type: z.enum(ticketTypes).optional(),
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  assignee_id: z.string().uuid().optional().or(z.literal('')).or(z.null()),
  project_id: z.string().uuid().optional().or(z.literal('')).or(z.null()),
  due_date: z.string().optional().or(z.literal('')).or(z.null()),
  tags: z.array(z.string()).optional(),
})

export const ticketFiltersSchema = z.object({
  status: z.array(z.enum(ticketStatuses)).optional(),
  priority: z.array(z.enum(ticketPriorities)).optional(),
  type: z.array(z.enum(ticketTypes)).optional(),
  assignee_id: z.string().uuid().optional(),
  reporter_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  unassigned: z.coerce.boolean().optional(),
  due_date_before: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(25),
  sort_by: z.enum(['created_at', 'updated_at', 'priority', 'due_date']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

/* ============================================================
   Comment Schemas
   ============================================================ */

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(10000, 'Comment must be less than 10,000 characters'),
})

export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(10000, 'Comment must be less than 10,000 characters'),
})

/* ============================================================
   Inferred Types
   ============================================================ */

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type CreateOrgInput = z.infer<typeof createOrgSchema>
export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TicketFiltersInput = z.infer<typeof ticketFiltersSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
