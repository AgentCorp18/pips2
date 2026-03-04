'use client'

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'pips-theme'

const getSystemTheme = (): 'light' | 'dark' =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const resolveTheme = (theme: Theme): 'light' | 'dark' =>
  theme === 'system' ? getSystemTheme() : theme

const applyTheme = (resolved: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

/* ---------------------------------------------------------------
   External store for persisted theme preference (localStorage).
   useSyncExternalStore lets React read from localStorage without
   needing setState inside an effect, satisfying the lint rule.
   --------------------------------------------------------------- */

let listeners: Array<() => void> = []

const themeStore = {
  subscribe: (cb: () => void) => {
    listeners = [...listeners, cb]
    return () => {
      listeners = listeners.filter((l) => l !== cb)
    }
  },
  getSnapshot: (): Theme => {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system'
  },
  getServerSnapshot: (): Theme => {
    // On the server, always return 'system' to match the initial client render.
    return 'system'
  },
  set: (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    // Notify all subscribers so useSyncExternalStore re-reads.
    listeners.forEach((l) => l())
  },
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  )

  const resolved = resolveTheme(theme)

  // Apply theme class to <html> when resolved theme changes.
  // The inline script in layout.tsx handles the initial paint,
  // so this effect just keeps it in sync on subsequent changes.
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Listen for OS preference changes when mode is "system"
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      applyTheme(resolveTheme('system'))
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    themeStore.set(next)
    applyTheme(resolveTheme(next))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
