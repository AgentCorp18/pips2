'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ProfileActionState = {
  error?: string
  success?: string
}

export const getProfile = async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return profile
}

export const updateProfile = async (
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> => {
  const displayName = formData.get('display_name')

  if (typeof displayName !== 'string') {
    return { error: 'Display name is required' }
  }

  const trimmed = displayName.trim()
  if (trimmed.length === 0) {
    return { error: 'Display name cannot be empty or whitespace only' }
  }
  if (trimmed.length > 100) {
    return { error: 'Display name must be 100 characters or fewer' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to update your profile' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: trimmed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/profile')
  return { success: 'Profile updated successfully' }
}

export const updateAvatarUrl = async (avatarUrl: string): Promise<ProfileActionState> => {
  // Validate the URL is from our Supabase storage to prevent arbitrary URL injection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return { error: 'Server configuration error' }
  }

  try {
    const parsed = new URL(avatarUrl)
    const expected = new URL(supabaseUrl)
    if (parsed.hostname !== expected.hostname) {
      return { error: 'Avatar URL must be from the application storage' }
    }
  } catch {
    return { error: 'Invalid avatar URL' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to update your avatar' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to update avatar' }
  }

  revalidatePath('/profile')
  return { success: 'Avatar updated successfully' }
}

export const removeAvatar = async (): Promise<ProfileActionState> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to remove your avatar' }
  }

  // Get current avatar URL to delete the file from storage
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  if (profile?.avatar_url) {
    // Extract the storage path from the URL
    const url = new URL(profile.avatar_url)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/)
    if (pathMatch?.[1]) {
      await supabase.storage.from('avatars').remove([pathMatch[1]])
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to remove avatar' }
  }

  revalidatePath('/profile')
  return { success: 'Avatar removed successfully' }
}
