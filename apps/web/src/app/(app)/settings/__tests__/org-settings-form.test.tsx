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

const renderForm = (canEdit = true, minMethodologyDepth = 0) =>
  render(
    <OrgSettingsForm
      org={ORG}
      settings={SETTINGS}
      minMethodologyDepth={minMethodologyDepth}
      canEdit={canEdit}
    />,
  )

describe('OrgSettingsForm', () => {
  it('renders Organization heading', () => {
    renderForm()
    expect(screen.getByText('Organization')).toBeTruthy()
  })

  it('renders Preferences heading', () => {
    renderForm()
    expect(screen.getByText('Preferences')).toBeTruthy()
  })

  it('renders Organization name label', () => {
    renderForm()
    expect(screen.getByLabelText('Organization name')).toBeTruthy()
  })

  it('renders URL slug label', () => {
    renderForm()
    expect(screen.getByLabelText('URL slug')).toBeTruthy()
  })

  it('renders Timezone label', () => {
    renderForm()
    expect(screen.getByLabelText('Timezone')).toBeTruthy()
  })

  it('renders Date format label', () => {
    renderForm()
    expect(screen.getByLabelText('Date format')).toBeTruthy()
  })

  it('renders Week starts on label', () => {
    renderForm()
    expect(screen.getByLabelText('Week starts on')).toBeTruthy()
  })

  it('renders Ticket prefix label', () => {
    renderForm()
    expect(screen.getByLabelText('Ticket prefix')).toBeTruthy()
  })

  it('renders Save changes button when canEdit', () => {
    renderForm(true)
    expect(screen.getByText('Save changes')).toBeTruthy()
  })

  it('hides Save changes button when canEdit is false', () => {
    renderForm(false)
    expect(screen.queryByText('Save changes')).toBeNull()
  })

  it('renders slug as disabled', () => {
    renderForm()
    const slugInput = screen.getByLabelText('URL slug') as HTMLInputElement
    expect(slugInput.disabled).toBe(true)
  })

  it('renders logo upload placeholder', () => {
    renderForm()
    expect(screen.getByText('Logo upload coming soon')).toBeTruthy()
  })

  it('renders ticket prefix helper text', () => {
    renderForm()
    expect(screen.getByText(/Used for ticket IDs/)).toBeTruthy()
  })

  it('renders Methodology Compliance heading', () => {
    renderForm()
    expect(screen.getByText('Methodology Compliance')).toBeTruthy()
  })

  it('renders minimum methodology depth input', () => {
    renderForm(true, 60)
    const input = screen.getByTestId('min-methodology-depth-input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.value).toBe('60')
  })
})
