import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getNotificationPreferences } from './actions'
import { NotificationPreferencesForm } from './notification-preferences-form'

export const metadata: Metadata = {
  title: 'Notification Preferences',
  description: 'Manage which notifications you receive',
}

const NotificationPreferencesPage = async () => {
  const result = await getNotificationPreferences()

  if (result.error || !result.preferences) {
    redirect('/login')
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="notifications-page-heading"
        >
          Notification Preferences
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Choose which notifications you receive and how they are delivered
        </p>
      </div>

      <NotificationPreferencesForm preferences={result.preferences} />
    </div>
  )
}

export default NotificationPreferencesPage
