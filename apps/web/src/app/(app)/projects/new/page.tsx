import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from './project-form'

export const metadata: Metadata = {
  title: 'New Project',
  description: 'Create a new PIPS improvement project',
}

const NewProjectPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-[var(--content-max-width)] py-8">
      <ProjectForm />
    </div>
  )
}

export default NewProjectPage
