import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrgSettingsForm } from '../org-settings-form'

vi.mock('../actions', () => ({
  updateOrgSettings: vi.fn(),
}))

const ORG = {
  name: 'Acme Corp',
  slug: 'acme-corp',
  logo_url: null,
}

const SETTINGS = {
  timezone: 'America/New_York',
  date_format: 'MM/dd/yyyy',
  week_start: 'monday',
  default_ticket_priority: 'medium',
  ticket_prefix: 'PIPS',
}

describe('OrgSettingsForm', () => {
  it('renders Organization heading', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByText('Organization')).toBeTruthy()
  })

  it('renders Preferences heading', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByText('Preferences')).toBeTruthy()
  })

  it('renders Organization name label', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByLabelText('Organization name')).toBeTruthy()
  })

  it('renders URL slug label', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByLabelText('URL slug')).toBeTruthy()
  })

  it('renders Timezone label', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByLabelText('Timezone')).toBeTruthy()
  })

  it('renders Date format label', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByLabelText('Date format')).toBeTruthy()
  })

  it('renders Week starts on label', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByLabelText('Week starts on')).toBeTruthy()
  })

  it('renders Ticket prefix label', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByLabelText('Ticket prefix')).toBeTruthy()
  })

  it('renders Save changes button when canEdit', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByText('Save changes')).toBeTruthy()
  })

  it('hides Save changes button when canEdit is false', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={false} />)
    expect(screen.queryByText('Save changes')).toBeNull()
  })

  it('renders slug as disabled', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    const slugInput = screen.getByLabelText('URL slug') as HTMLInputElement
    expect(slugInput.disabled).toBe(true)
  })

  it('renders logo upload placeholder', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByText('Logo upload coming soon')).toBeTruthy()
  })

  it('renders ticket prefix helper text', () => {
    render(<OrgSettingsForm org={ORG} settings={SETTINGS} canEdit={true} />)
    expect(screen.getByText(/Used for ticket IDs/)).toBeTruthy()
  })
})
