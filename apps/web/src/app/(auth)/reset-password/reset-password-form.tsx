'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPassword, type AuthActionState } from '../actions'

const initialState: AuthActionState = {}

export const ResetPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl">Set new password</CardTitle>
        <CardDescription className="text-center">Enter your new password below</CardDescription>
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
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isPending}
            />
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Must be at least 8 characters
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? 'Updating password...' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
