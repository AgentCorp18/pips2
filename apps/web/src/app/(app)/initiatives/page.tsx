import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { Button } from '@/components/ui/button'
import { InitiativeCard } from '@/components/initiatives/initiative-card'
import { Plus, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Initiatives | PIPS',
}

const InitiativesPage = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const currentOrg = await getCurrentOrg(supabase, user.id)
  if (!currentOrg) redirect('/onboarding')

  const { data: initiatives } = await supabase
    .from('initiatives')
    .select(
      `
      *,
      owner:profiles!initiatives_owner_id_fkey ( id, display_name, avatar_url ),
      initiative_projects ( id )
    `,
    )
    .eq('org_id', currentOrg.orgId)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  const items = (initiatives ?? []).map((i) => ({
    ...i,
    project_count: i.initiative_projects?.length ?? 0,
    owner: i.owner ?? { id: i.owner_id, display_name: 'Unknown', avatar_url: null },
  }))

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6 lg:p-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="font-display text-2xl font-bold md:text-3xl"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Initiatives
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Strategic goals that group multiple PIPS projects together
          </p>
        </div>
        <Link href="/initiatives/new">
          <Button data-testid="create-initiative-button">
            <Plus size={16} className="mr-1.5" />
            New Initiative
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed p-12"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <Target size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            No initiatives yet
          </h3>
          <p
            className="mb-4 max-w-sm text-center text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Create an initiative to group related projects under a strategic goal and track
            aggregated progress.
          </p>
          <Link href="/initiatives/new">
            <Button>
              <Plus size={16} className="mr-1.5" />
              Create your first initiative
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((initiative) => (
            <InitiativeCard key={initiative.id} initiative={initiative} />
          ))}
        </div>
      )}
    </div>
  )
}

export default InitiativesPage
