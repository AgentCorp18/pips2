'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormattedDate } from '@/components/ui/formatted-date'
import { X, Mail, Clock } from 'lucide-react'
import { revokeInvitation } from './invitation-actions'

export type PendingInvitation = {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  created_at: string
  inviter_name: string | null
}

type PendingInvitationsProps = {
  orgId: string
  invitations: PendingInvitation[]
}

export const PendingInvitations = ({ orgId, invitations }: PendingInvitationsProps) => {
  const [isPending, startTransition] = useTransition()

  if (invitations.length === 0) return null

  const handleRevoke = (invitationId: string) => {
    startTransition(async () => {
      await revokeInvitation(orgId, invitationId)
    })
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Pending Invitations ({invitations.length})
      </h2>
      <div className="divide-y rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
        {invitations.map((inv) => {
          const isExpired = new Date(inv.expires_at) < new Date()

          return (
            <div
              key={inv.id}
              className="flex items-center justify-between px-4 py-3"
              data-testid={`invitation-${inv.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--color-surface-secondary)' }}
                >
                  <Mail size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {inv.email}
                  </p>
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <span>
                      Invited <FormattedDate date={inv.created_at} />
                    </span>
                    {inv.inviter_name && <span>by {inv.inviter_name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {inv.role}
                </Badge>
                {isExpired ? (
                  <Badge
                    variant="outline"
                    className="border-red-200 bg-red-50 text-xs text-red-600"
                  >
                    <Clock size={10} className="mr-1" />
                    Expired
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-xs text-amber-600"
                  >
                    Pending
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={isPending}
                  aria-label={`Revoke invitation for ${inv.email}`}
                  data-testid={`revoke-invitation-${inv.id}`}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
