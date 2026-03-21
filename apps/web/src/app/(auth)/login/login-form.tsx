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
import { login, type AuthActionState } from '../actions'

const initialState: AuthActionState = {}

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const searchParams = useSearchParams()
  // `next` is set by middleware when redirecting unauthenticated users.
  // `redirect` is set by invite links and other in-app redirects.
  const nextParam = searchParams.get('next')
  const redirectParam = searchParams.get('redirect')
  const errorParam = searchParams.get('error')
  const isProtectedRedirect = !!nextParam

  return (
    <Card>
      <CardHeader>
        <h1 className="sr-only">Sign In</h1>
        <CardTitle className="text-center text-xl">Welcome back</CardTitle>
        <CardDescription className="text-center">
          {isProtectedRedirect
            ? 'Sign in to access that page'
            : 'Sign in to your account to continue'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {nextParam && <input type="hidden" name="redirect" value={nextParam} />}
          {!nextParam && redirectParam && (
            <input type="hidden" name="redirect" value={redirectParam} />
          )}
          {errorParam && !state.error && (
            <div
              role="alert"
              className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
              style={{
                backgroundColor: 'var(--color-error-subtle)',
                color: 'var(--color-error)',
              }}
            >
              Authentication failed. Please try signing in again.
            </div>
          )}
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
              defaultValue={state.email ?? ''}
              aria-invalid={!!state.fieldErrors?.email}
              aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
              className="h-11 sm:h-9"
            />
            {state.fieldErrors?.email && (
              <p id="email-error" className="text-xs" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--color-text-link)' }}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.password}
              aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
              className="h-11 sm:h-9"
            />
            {state.fieldErrors?.password && (
              <p id="password-error" className="text-xs" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="mt-2 h-11 w-full sm:h-9" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium hover:underline"
            style={{ color: 'var(--color-text-link)' }}
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
