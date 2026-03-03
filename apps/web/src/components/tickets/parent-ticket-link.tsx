import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/* ============================================================
   Types
   ============================================================ */

type ParentTicketLinkProps = {
  parentId: string
  parentTitle: string
  parentSequenceId: string
}

/* ============================================================
   Component (Server Component — no 'use client')
   ============================================================ */

export const ParentTicketLink = ({
  parentId,
  parentTitle,
  parentSequenceId,
}: ParentTicketLinkProps) => (
  <div
    className="mb-2 flex items-center gap-1 text-xs"
    style={{ color: 'var(--color-text-tertiary)' }}
  >
    <Link
      href="/tickets"
      className="hover:underline"
      style={{ color: 'var(--color-text-tertiary)' }}
    >
      Tickets
    </Link>
    <ChevronRight size={12} />
    <Link
      href={`/tickets/${parentId}`}
      className="hover:underline"
      style={{ color: 'var(--color-primary)' }}
    >
      <span className="font-mono">{parentSequenceId}</span>
      <span className="ml-1">{parentTitle}</span>
    </Link>
    <ChevronRight size={12} />
  </div>
)
