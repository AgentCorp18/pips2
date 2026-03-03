'use client'

import { useActionState } from 'react'
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
import { forgotPassword, type AuthActionState } from '../actions'

const initialState: AuthActionState = {}

export const ForgotPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl">Reset password</CardTitle>
        <CardDescription className="text-center">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state.error && (
            <div
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? 'Sending link...' : 'Send reset link'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-text-link)' }}
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
