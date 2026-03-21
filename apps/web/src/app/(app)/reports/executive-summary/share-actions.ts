'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentOrg } from '@/lib/get-current-org'
import { requirePermission } from '@/lib/permissions'
import { generateShareToken, validateShareToken } from '@/lib/share-token'
import { parsePeriod } from '@/lib/report-period'
import type { Period } from '@/lib/report-period'
import { getBaseUrl } from '@/lib/base-url'

const REPORT_TYPE = 'executive-summary'

export type GenerateShareLinkResult =
  | { url: string; error?: never }
  | { url?: never; error: string }

/**
 * Generate a 7-day shareable link for the executive summary.
 * Requires the caller to be authenticated and have data.view permission.
 */
export const generateExecutiveSummaryShareLink = async (
  period: string,
): Promise<GenerateShareLinkResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const currentOrg = await getCurrentOrg(supabase, user.id)
  if (!currentOrg) {
    return { error: 'No active organization' }
  }

  try {
    await requirePermission(currentOrg.orgId, 'data.view')
  } catch {
    return { error: 'Permission denied' }
  }

  const validPeriod: Period = parsePeriod(period)
  const token = generateShareToken(currentOrg.orgId, REPORT_TYPE, validPeriod)

  const baseUrl = getBaseUrl()
  return { url: `${baseUrl}/share/report/${token}` }
}

export type ResolvedShareToken =
  | { orgId: string; period: Period; error?: never }
  | { orgId?: never; period?: never; error: string }

/**
 * Validate a share token and resolve it to orgId + period.
 * This is used by the public share page — no auth required on the caller side.
 */
export const resolveShareToken = async (token: string): Promise<ResolvedShareToken> => {
  const payload = validateShareToken(token)
  if (!payload) {
    return { error: 'Invalid or expired share link' }
  }
  if (payload.reportType !== REPORT_TYPE) {
    return { error: 'This link is for a different report type' }
  }
  const period: Period = parsePeriod(payload.period)
  return { orgId: payload.orgId, period }
}
