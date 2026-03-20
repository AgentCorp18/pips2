import { create } from 'zustand'

export type OrgRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer'
export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise'

export type OrgSettings = {
  timezone: string
  date_format: string
  week_start: string
  default_ticket_priority: string
  ticket_prefix: string
  min_methodology_depth: number
  notification_settings: {
    email_digest: string
    in_app: boolean
  }
  branding: Record<string, unknown>
}

export type OrgData = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  plan: PlanType
  role: OrgRole
  settings: OrgSettings
}

type OrgState = {
  org: OrgData | null
  isLoaded: boolean
  hydrate: (data: OrgData) => void
  clear: () => void
  updateOrg: (updates: Partial<OrgData>) => void
  updateSettings: (settings: Partial<OrgSettings>) => void
}

export const useOrgStore = create<OrgState>((set) => ({
  org: null,
  isLoaded: false,

  hydrate: (data) => set({ org: data, isLoaded: true }),

  clear: () => set({ org: null, isLoaded: false }),

  updateOrg: (updates) =>
    set((state) => ({
      org: state.org ? { ...state.org, ...updates } : null,
    })),

  updateSettings: (settings) =>
    set((state) => ({
      org: state.org
        ? {
            ...state.org,
            settings: { ...state.org.settings, ...settings },
          }
        : null,
    })),
}))
