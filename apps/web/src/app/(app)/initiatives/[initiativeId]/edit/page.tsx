import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInitiativeDetail } from '@/app/(app)/initiatives/actions'
import { EditInitiativeForm } from '@/components/initiatives/edit-initiative-form'
import { Target } from 'lucide-react'

type Props = {
  params: Promise<{ initiativeId: string }>
}

export const metadata: Metadata = {
  title: 'Edit Initiative',
}

const EditInitiativePage = async ({ params }: Props) => {
  const { initiativeId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { initiative, error } = await getInitiativeDetail(initiativeId)
  if (error || !initiative) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-10">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${initiative.color}20`, color: initiative.color }}
        >
          <Target size={20} />
        </div>
        <div>
          <h1
            className="font-display text-xl font-bold md:text-2xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Edit Initiative
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {initiative.title}
          </p>
        </div>
      </div>

      <EditInitiativeForm initiative={initiative} />
    </div>
  )
}

export default EditInitiativePage
