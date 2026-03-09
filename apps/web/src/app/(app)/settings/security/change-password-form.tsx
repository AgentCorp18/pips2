'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { changePassword, type ChangePasswordActionState } from './actions'

const initialState: ChangePasswordActionState = {}

export const ChangePasswordForm = () => {
  const [state, formAction, isPending] = useActionState(changePassword, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
    }
    if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              data-testid="current-password-input"
              autoComplete="current-password"
              disabled={isPending}
              required
              className="max-w-md"
            />
            {state.fieldErrors?.currentPassword && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              data-testid="new-password-input"
              autoComplete="new-password"
              disabled={isPending}
              required
              className="max-w-md"
            />
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Must be at least 8 characters
            </p>
            {state.fieldErrors?.newPassword && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              data-testid="confirm-password-input"
              autoComplete="new-password"
              disabled={isPending}
              required
              className="max-w-md"
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} data-testid="change-password-button">
          {isPending ? 'Updating...' : 'Update password'}
        </Button>
      </div>
    </form>
  )
}
