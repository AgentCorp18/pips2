import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { ArrowLeft } from 'lucide-react'
import { getTimeSavings } from './actions'
import { TimeSavingsClient } from './time-savings-client'

export const metadata: Metadata = {
  title: 'Time Savings Calculator',
  description:
    'Calculate total annualised hours and labor value saved from your improvement projects.',
}

const TimeSavingsPage = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)

  if (!currentOrg) {
    redirect('/onboarding')
  }

  const data = await getTimeSavings(currentOrg.orgId)

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/reports"
          className="mb-3 inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Reports
        </Link>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="time-savings-heading"
        >
          Time Savings Calculator
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Converts all time-based measurables to annualised hours and labour value across your
          portfolio.
        </p>
      </div>

      {/* Step stripe */}
      <div className="step-gradient-stripe mb-8 rounded-full" />

      {/* Client component handles real-time rate recalculation */}
      <TimeSavingsClient initialData={data} />
    </div>
  )
}

export default TimeSavingsPage
