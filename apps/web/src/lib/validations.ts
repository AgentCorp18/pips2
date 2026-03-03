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

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateOrgInput = z.infer<typeof createOrgSchema>
export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>
