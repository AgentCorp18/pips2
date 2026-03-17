import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { TemplateBrowser } from './template-browser'

export const metadata: Metadata = {
  title: 'Template Library',
  description: 'Start your PIPS project from a proven template. Choose a scenario and customize it for your needs.',
}

const TemplatesPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-full px-4">
      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4 gap-1.5 text-xs">
          <Link href="/projects">
            <ArrowLeft size={14} />
            Back to Projects
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
              data-testid="templates-page-heading"
            >
              Template Library
            </h1>
            <p
              className="mt-1 max-w-2xl text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
              data-testid="templates-page-description"
            >
              Start your project from a proven template. Choose a scenario and customize it for your
              needs.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/projects/new" data-testid="start-from-scratch-link">
              Start from scratch
            </Link>
          </Button>
        </div>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Browser */}
      <TemplateBrowser />
    </div>
  )
}

export default TemplatesPage
