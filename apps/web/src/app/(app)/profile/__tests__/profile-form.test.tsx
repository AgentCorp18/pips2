import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileForm } from '../profile-form'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../actions', () => ({
  updateProfile: vi.fn().mockResolvedValue({}),
  updateAvatarUrl: vi.fn().mockResolvedValue({}),
  removeAvatar: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } }),
      }),
    },
  }),
}))

vi.mock('@/components/ui/avatar-upload', () => ({
  AvatarUpload: () => <div data-testid="avatar-upload">Avatar Upload</div>,
}))

const PROFILE = {
  id: 'u-1',
  email: 'marc@example.com',
  full_name: 'Marc Alba',
  display_name: 'Marc',
  avatar_url: null,
}

describe('ProfileForm', () => {
  it('renders Profile Photo heading', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByText('Profile Photo')).toBeTruthy()
  })

  it('renders Profile Details heading', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByText('Profile Details')).toBeTruthy()
  })

  it('renders Display name label', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByLabelText('Display name')).toBeTruthy()
  })

  it('renders Email label', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByLabelText('Email')).toBeTruthy()
  })

  it('renders Full name label', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByLabelText('Full name')).toBeTruthy()
  })

  it('renders Save changes button', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByText('Save changes')).toBeTruthy()
  })

  it('renders avatar upload component', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByTestId('avatar-upload')).toBeTruthy()
  })

  it('renders email as disabled', () => {
    render(<ProfileForm profile={PROFILE} />)
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    expect(emailInput.disabled).toBe(true)
  })

  it('shows display name default value', () => {
    render(<ProfileForm profile={PROFILE} />)
    const input = screen.getByLabelText('Display name') as HTMLInputElement
    expect(input.defaultValue).toBe('Marc')
  })

  it('renders description text for email', () => {
    render(<ProfileForm profile={PROFILE} />)
    expect(screen.getByText(/managed through your authentication provider/)).toBeTruthy()
  })
})
