'use client'

import { useActionState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, updateAvatarUrl, removeAvatar, type ProfileActionState } from './actions'

type ProfileFormProps = {
  profile: {
    id: string
    email: string
    full_name: string
    display_name: string | null
    avatar_url: string | null
  }
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const initialState: ProfileActionState = {}

export const ProfileForm = ({ profile }: ProfileFormProps) => {
  const [state, formAction, isPending] = useActionState(
    async (prev: ProfileActionState, formData: FormData) => {
      const result = await updateProfile(prev, formData)
      if (result.success) {
        toast.success(result.success)
      } else if (result.error) {
        toast.error(result.error)
      }
      return result
    },
    initialState,
  )

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      const supabase = createClient()

      const fileExt = file.name.split('.').pop() ?? 'jpg'
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const result = await updateAvatarUrl(publicUrl)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Avatar updated successfully')
    },
    [profile.id],
  )

  const handleAvatarRemove = useCallback(async () => {
    const result = await removeAvatar()

    if (result.error) {
      throw new Error(result.error)
    }

    toast.success('Avatar removed')
  }, [])

  const initials = getInitials(profile.display_name || profile.full_name || profile.email)

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            initials={initials}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
          />
        </CardContent>
      </Card>

      {/* Profile details form */}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name ?? ''}
                placeholder={profile.full_name || 'Enter a display name'}
                disabled={isPending}
                maxLength={100}
              />
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                This is how your name appears across the app
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-muted" />
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Email is managed through your authentication provider
              </p>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={profile.full_name} disabled className="bg-muted" />
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Set during account creation
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
