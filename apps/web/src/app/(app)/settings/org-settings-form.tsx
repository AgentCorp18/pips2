'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { updateOrgSettings, type SettingsActionState } from './actions'

type OrgSettingsFormProps = {
  org: {
    name: string
    slug: string
    logo_url: string | null
  }
  settings: {
    timezone: string
    date_format: string
    week_start: string
    default_ticket_priority: string
    ticket_prefix: string
  }
  minMethodologyDepth: number
  canEdit: boolean
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
]

const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
]

const WEEK_STARTS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const PRIORITIES = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const initialState: SettingsActionState = {}

export const OrgSettingsForm = ({
  org,
  settings,
  minMethodologyDepth,
  canEdit,
}: OrgSettingsFormProps) => {
  const [state, formAction, isPending] = useActionState(updateOrgSettings, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div
          className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-error-subtle)',
            color: 'var(--color-error)',
          }}
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          className="rounded-[var(--radius-md)] px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-success-subtle)',
            color: 'var(--color-success)',
          }}
        >
          {state.success}
        </div>
      )}

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Organization name</Label>
            <Input
              id="name"
              name="name"
              data-testid="org-name-input"
              defaultValue={org.name}
              disabled={isPending || !canEdit}
              required
            />
            {state.fieldErrors?.name && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" value={org.slug} disabled className="bg-muted" />
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              The slug cannot be changed after creation
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Logo</Label>
            <div
              className="flex h-24 items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Logo upload coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={settings.timezone}
                disabled={isPending || !canEdit}
                className="h-9 rounded-md border px-3 text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date_format">Date format</Label>
              <select
                id="date_format"
                name="date_format"
                defaultValue={settings.date_format}
                disabled={isPending || !canEdit}
                className="h-9 rounded-md border px-3 text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {DATE_FORMATS.map((df) => (
                  <option key={df.value} value={df.value}>
                    {df.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="week_start">Week starts on</Label>
              <select
                id="week_start"
                name="week_start"
                defaultValue={settings.week_start}
                disabled={isPending || !canEdit}
                className="h-9 rounded-md border px-3 text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {WEEK_STARTS.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="default_ticket_priority">Default ticket priority</Label>
              <select
                id="default_ticket_priority"
                name="default_ticket_priority"
                defaultValue={settings.default_ticket_priority}
                disabled={isPending || !canEdit}
                className="h-9 rounded-md border px-3 text-sm"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket_prefix">Ticket prefix</Label>
            <Input
              id="ticket_prefix"
              name="ticket_prefix"
              defaultValue={settings.ticket_prefix}
              placeholder="PIPS"
              disabled={isPending || !canEdit}
              className="max-w-[200px]"
            />
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Used for ticket IDs, e.g. {settings.ticket_prefix}-1, {settings.ticket_prefix}-2
            </p>
            {state.fieldErrors?.ticket_prefix && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.ticket_prefix}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Methodology Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Methodology Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="min_methodology_depth">Minimum Methodology Depth Threshold (%)</Label>
            <Input
              id="min_methodology_depth"
              name="min_methodology_depth"
              type="number"
              min={0}
              max={100}
              defaultValue={minMethodologyDepth}
              disabled={isPending || !canEdit}
              className="max-w-[200px]"
              data-testid="min-methodology-depth-input"
            />
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              Set to 0 to disable. When set (e.g. 60), active projects below this score will show a
              warning on the dashboard.
            </p>
            {state.fieldErrors?.min_methodology_depth && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                {state.fieldErrors.min_methodology_depth}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} data-testid="settings-save-button">
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      )}
    </form>
  )
}
