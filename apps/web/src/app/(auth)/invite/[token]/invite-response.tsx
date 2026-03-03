'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS, type OrgRole } from '@pips/shared'
import { acceptInvitation, declineInvitation, type InvitationData } from './actions'

interface InviteResponseProps {
  invitation: InvitationData
  isLoggedIn: boolean
  userEmail: string | null
  token: string
}

export const InviteResponse = ({
  invitation,
  isLoggedIn,
  userEmail,
  token,
}: InviteResponseProps) => {
  const [loading, setLoading] = useState(false)
  const [declined, setDeclined] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roleLabel = ROLE_LABELS[invitation.role as OrgRole] ?? invitation.role
  const redirectParam = encodeURIComponent(`/invite/${token}`)

  const handleAccept = async () => {
    setLoading(true)
    setError(null)
    const result = await acceptInvitation(token)
    // If redirect happens, this code won't run
    if (!result.success) {
      setError(result.error ?? 'Failed to accept invitation')
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    setError(null)
    const result = await declineInvitation(token)
    setLoading(false)
    if (result.success) {
      setDeclined(true)
    } else {
      setError(result.error ?? 'Failed to decline invitation')
    }
  }

  if (declined) {
    return (
      <div className="text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          You have declined the invitation.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium hover:underline"
          style={{ color: 'var(--color-text-link)' }}
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Invitation details */}
      <div
        className="rounded-[var(--radius-md)] p-4 text-center"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {invitation.inviter_name}
          </span>{' '}
          invited you to join
        </p>
        <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--color-primary-deep)' }}>
          {invitation.org_name}
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          as {roleLabel}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-error-subtle)',
            color: 'var(--color-error)',
          }}
        >
          {error}
        </div>
      )}

      {/* Email mismatch warning */}
      {isLoggedIn && userEmail && userEmail !== invitation.email && (
        <div
          className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-accent-subtle)',
            color: 'var(--color-accent)',
          }}
        >
          This invitation was sent to <strong>{invitation.email}</strong>. You are currently signed
          in as <strong>{userEmail}</strong>. Please sign in with the invited email to accept.
        </div>
      )}

      {/* Action buttons */}
      {isLoggedIn ? (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDecline} disabled={loading}>
            {loading ? 'Processing...' : 'Decline'}
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={loading}>
            {loading ? 'Accepting...' : 'Accept Invitation'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href={`/signup?redirect=${redirectParam}`}>Sign up to join</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/login?redirect=${redirectParam}`}>Log in to join</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
