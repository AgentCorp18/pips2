'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

type UserProfile = {
  displayName: string
  email: string
  avatarUrl?: string
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (!first) return '?'
  if (parts.length === 1) return first.charAt(0).toUpperCase()
  const last = parts[parts.length - 1]
  return (first.charAt(0) + (last?.charAt(0) ?? '')).toUpperCase()
}

export const UserMenu = () => {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('email, full_name, display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          displayName: data.display_name || data.full_name || data.email || 'User',
          email: data.email ?? user.email ?? '',
          avatarUrl: data.avatar_url ?? undefined,
        })
      }
    }

    void fetchProfile()
  }, [])

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  const displayName = profile?.displayName ?? 'User'
  const email = profile?.email ?? ''
  const avatarUrl = profile?.avatarUrl
  const initials = getInitials(displayName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--color-surface-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="User menu"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
              {initials}
            </div>
          )}
          <ChevronDown size={16} className="hidden text-[var(--color-text-tertiary)] sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User info header */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation items */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/profile')}>
            <User size={16} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/settings')}>
            <Settings size={16} />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          disabled={isSigningOut}
          onSelect={() => void handleSignOut()}
        >
          <LogOut size={16} />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
