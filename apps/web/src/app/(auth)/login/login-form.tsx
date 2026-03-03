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
import { login, type AuthActionState } from '../actions'

const initialState: AuthActionState = {}

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
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
            />
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
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
