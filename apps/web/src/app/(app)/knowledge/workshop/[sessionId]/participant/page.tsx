import { notFound } from 'next/navigation'
import { getSession } from '../../actions'
import { WorkshopParticipantView } from '@/components/workshop/workshop-participant-view'

type Props = {
  params: Promise<{ sessionId: string }>
}

const ParticipantPage = async ({ params }: Props) => {
  const { sessionId } = await params
  const session = await getSession(sessionId)

  if (!session) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <WorkshopParticipantView initialSession={session} />
    </div>
  )
}

export default ParticipantPage
