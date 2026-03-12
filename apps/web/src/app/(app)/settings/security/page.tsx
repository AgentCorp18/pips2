import type { Metadata } from 'next'
import { ChangePasswordForm } from './change-password-form'

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
    </div>
  )
}

export default SecuritySettingsPage
