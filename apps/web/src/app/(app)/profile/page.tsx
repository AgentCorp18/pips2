import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getProfile } from './actions'
import { ProfileForm } from './profile-form'

export const metadata: Metadata = {
  title: 'Profile - PIPS',
  description: 'Manage your user profile and avatar',
}

const ProfilePage = async () => {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
          data-testid="profile-page-heading"
        >
          Profile
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
          data-testid="profile-description"
        >
          Manage your personal information and profile photo
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  )
}

export default ProfilePage
