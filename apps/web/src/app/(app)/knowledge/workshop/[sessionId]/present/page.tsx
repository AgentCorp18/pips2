import { notFound } from 'next/navigation'
import { getSession } from '../../actions'
import { WorkshopSlideView } from '@/components/workshop/workshop-slide-view'

type Props = {
  params: Promise<{ sessionId: string }>
}

const PresentPage = async ({ params }: Props) => {
  const { sessionId } = await params
  const session = await getSession(sessionId)

  if (!session) notFound()

  return <WorkshopSlideView initialSession={session} />
}

export default PresentPage
