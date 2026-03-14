import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateInitiativeForm } from '@/components/initiatives/create-initiative-form'
import { Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'New Initiative | PIPS',
}

const NewInitiativePage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-10">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-primary)' }}
        >
          <Target size={20} />
        </div>
        <div>
          <h1
            className="font-display text-xl font-bold md:text-2xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            New Initiative
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Create a strategic goal to group related projects
          </p>
        </div>
      </div>

      <CreateInitiativeForm />
    </div>
  )
}

export default NewInitiativePage
