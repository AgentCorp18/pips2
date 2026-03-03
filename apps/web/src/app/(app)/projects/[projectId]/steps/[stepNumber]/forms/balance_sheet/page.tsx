import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadFormData } from '../actions'
import { BalanceSheetForm } from './balance-sheet-form'
import type { BalanceSheetData } from '@/lib/form-schemas'

const BalanceSheetPage = async ({
  params,
}: {
  params: Promise<{ projectId: string; stepNumber: string }>
}) => {
  const { projectId, stepNumber } = await params

  if (stepNumber !== '6') notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const saved = await loadFormData(projectId, 6, 'balance_sheet')
  const initialData = (saved?.data ?? null) as BalanceSheetData | null

  return <BalanceSheetForm projectId={projectId} initialData={initialData} />
}

export default BalanceSheetPage
