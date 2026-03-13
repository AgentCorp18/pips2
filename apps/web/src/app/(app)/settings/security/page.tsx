import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChangePasswordForm } from './change-password-form'
import { ExportDataButton } from './export-data-button'

export const metadata: Metadata = {
  title: 'Security',
  description: 'Manage your account security settings',
}

const SecuritySettingsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="security-settings-heading"
        >
          Security
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Manage your password and account security
        </p>
      </div>

      <ChangePasswordForm />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Export</CardTitle>
            <CardDescription>
              Download a copy of all your personal data stored in PIPS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExportDataButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SecuritySettingsPage
