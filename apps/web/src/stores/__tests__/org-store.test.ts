import { describe, it, expect, beforeEach } from 'vitest'
import { useOrgStore, type OrgData, type OrgSettings } from '../org-store'

/* ============================================================
   Helpers
   ============================================================ */

const defaultSettings: OrgSettings = {
  timezone: 'America/New_York',
  date_format: 'MM/DD/YYYY',
  week_start: 'monday',
  default_ticket_priority: 'medium',
  ticket_prefix: 'PIPS',
  notification_settings: {
    email_digest: 'daily',
    in_app: true,
  },
  branding: {},
}

const sampleOrg: OrgData = {
  id: 'org-1',
  name: 'Acme Corp',
  slug: 'acme-corp',
  logo_url: 'https://example.com/logo.png',
  plan: 'professional',
  role: 'admin',
  settings: defaultSettings,
}

/* ============================================================
   Tests
   ============================================================ */

describe('useOrgStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useOrgStore.setState({ org: null, isLoaded: false })
  })

  it('initializes with null org and isLoaded false', () => {
    const state = useOrgStore.getState()
    expect(state.org).toBeNull()
    expect(state.isLoaded).toBe(false)
  })

  it('hydrate sets org data and marks as loaded', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    const state = useOrgStore.getState()
    expect(state.org).toEqual(sampleOrg)
    expect(state.isLoaded).toBe(true)
  })

  it('clear resets org to null and isLoaded to false', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    useOrgStore.getState().clear()
    const state = useOrgStore.getState()
    expect(state.org).toBeNull()
    expect(state.isLoaded).toBe(false)
  })

  it('updateOrg merges partial updates into existing org', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    useOrgStore.getState().updateOrg({ name: 'Acme Inc', plan: 'enterprise' })
    const state = useOrgStore.getState()
    expect(state.org?.name).toBe('Acme Inc')
    expect(state.org?.plan).toBe('enterprise')
    expect(state.org?.slug).toBe('acme-corp') // unchanged
  })

  it('updateOrg does nothing when org is null', () => {
    useOrgStore.getState().updateOrg({ name: 'New Name' })
    const state = useOrgStore.getState()
    expect(state.org).toBeNull()
  })

  it('updateSettings merges partial settings', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    useOrgStore.getState().updateSettings({
      timezone: 'Europe/London',
      ticket_prefix: 'ACM',
    })
    const state = useOrgStore.getState()
    expect(state.org?.settings.timezone).toBe('Europe/London')
    expect(state.org?.settings.ticket_prefix).toBe('ACM')
    expect(state.org?.settings.date_format).toBe('MM/DD/YYYY') // unchanged
  })

  it('updateSettings does nothing when org is null', () => {
    useOrgStore.getState().updateSettings({ timezone: 'UTC' })
    const state = useOrgStore.getState()
    expect(state.org).toBeNull()
  })

  it('updateOrg preserves settings', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    useOrgStore.getState().updateOrg({ logo_url: null })
    const state = useOrgStore.getState()
    expect(state.org?.logo_url).toBeNull()
    expect(state.org?.settings).toEqual(defaultSettings)
  })

  it('updateSettings preserves notification_settings when updating other fields', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    useOrgStore.getState().updateSettings({ week_start: 'sunday' })
    const state = useOrgStore.getState()
    expect(state.org?.settings.week_start).toBe('sunday')
    expect(state.org?.settings.notification_settings.email_digest).toBe('daily')
    expect(state.org?.settings.notification_settings.in_app).toBe(true)
  })

  it('hydrate can be called multiple times to replace org data', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    const newOrg: OrgData = {
      ...sampleOrg,
      id: 'org-2',
      name: 'Beta Corp',
      role: 'owner',
    }
    useOrgStore.getState().hydrate(newOrg)
    const state = useOrgStore.getState()
    expect(state.org?.id).toBe('org-2')
    expect(state.org?.name).toBe('Beta Corp')
    expect(state.org?.role).toBe('owner')
  })

  it('updateOrg can change role', () => {
    useOrgStore.getState().hydrate(sampleOrg)
    useOrgStore.getState().updateOrg({ role: 'viewer' })
    const state = useOrgStore.getState()
    expect(state.org?.role).toBe('viewer')
  })
})
