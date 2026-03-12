import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { hasPermission } from '@pips/shared'
import type { OrgRole } from '@pips/shared'
import { getOrgWithSettings } from './actions'
import { OrgSettingsForm } from './org-settings-form'

export const metadata: Metadata = {
  title: 'Settings - PIPS',
  description: 'Manage your organization settings',
}

const SettingsPage = async () => {
  const data = await getOrgWithSettings()

  if (!data) {
    redirect('/onboarding')
  }

  const canEdit = hasPermission(data.role as OrgRole, 'org.members.manage')

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="settings-page-heading"
        >
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your organization preferences and configuration
        </p>
      </div>

      <OrgSettingsForm
        org={{
          name: data.org.name,
          slug: data.org.slug,
          logo_url: data.org.logo_url,
        }}
        settings={{
          timezone: data.settings.timezone,
          date_format: data.settings.date_format,
          week_start: data.settings.week_start,
          default_ticket_priority: data.settings.default_ticket_priority,
          ticket_prefix: data.settings.ticket_prefix,
        }}
        canEdit={canEdit}
      />
    </div>
  )
}

export default SettingsPage
