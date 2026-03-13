import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { SettingsNav } from './settings-nav'

const SettingsLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const currentOrg = await getCurrentOrg(supabase, user.id)
  if (!currentOrg) redirect('/onboarding')

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <SettingsNav role={currentOrg.role} />
      {children}
    </div>
  )
}

export default SettingsLayout
