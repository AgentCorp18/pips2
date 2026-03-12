'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signup, type AuthActionState } from '../actions'

const initialState: AuthActionState = {}

export const SignupForm = () => {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  return (
    <Card>
      <CardHeader>
        <h1 className="sr-only">Sign Up</h1>
        <CardTitle className="text-center text-xl">Create an account</CardTitle>
        <CardDescription className="text-center">
          Get started with PIPS process improvement
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {redirectParam && <input type="hidden" name="redirect" value={redirectParam} />}
          {state.error && (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--color-error-subtle)',
                color: 'var(--color-error)',
              }}
            >
              {state.error}
            </div>
          )}

          {state.success && (
            <div
              className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--color-success-subtle)',
                color: 'var(--color-success)',
              }}
            >
              {state.success}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Full name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.displayName}
              aria-describedby={state.fieldErrors?.displayName ? 'name-error' : undefined}
            />
            {state.fieldErrors?.displayName && (
              <p id="name-error" className="text-xs" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.displayName}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.email}
              aria-describedby={state.fieldErrors?.email ? 'signup-email-error' : undefined}
            />
            {state.fieldErrors?.email && (
              <p
                id="signup-email-error"
                className="text-xs"
                style={{ color: 'var(--color-error)' }}
              >
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.password}
              aria-describedby={state.fieldErrors?.password ? 'signup-password-error' : undefined}
            />
            {state.fieldErrors?.password ? (
              <p
                id="signup-password-error"
                className="text-xs"
                style={{ color: 'var(--color-error)' }}
              >
                {state.fieldErrors.password}
              </p>
            ) : (
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Must be at least 8 characters
              </p>
            )}
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline hover:no-underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:no-underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: 'var(--color-text-link)' }}
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
