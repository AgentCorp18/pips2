import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession } from '../actions'
import { WorkshopSessionManager } from '@/components/workshop/workshop-session-manager'

type Props = {
  params: Promise<{ sessionId: string }>
}

const WorkshopSessionPage = async ({ params }: Props) => {
  const { sessionId } = await params
  const session = await getSession(sessionId)

  if (!session) notFound()

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <Link href="/knowledge/workshop" className="hover:text-[var(--color-primary)]">
          Workshop
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">{session.title}</span>
      </nav>

      <WorkshopSessionManager initialSession={session} />
    </div>
  )
}

export default WorkshopSessionPage
