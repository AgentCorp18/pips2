'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { switchOrg } from '@/app/(app)/actions/switch-org'
import type { UserOrg } from '@/app/(app)/actions'

type OrgSwitcherProps = {
  orgs: UserOrg[]
  currentOrgId: string
}

const ROLE_VARIANT = {
  owner: 'default',
  admin: 'secondary',
  manager: 'secondary',
  member: 'outline',
  viewer: 'outline',
} as const satisfies Record<UserOrg['role'], 'default' | 'secondary' | 'outline'>

export const OrgSwitcher = ({ orgs, currentOrgId }: OrgSwitcherProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null)
  const currentOrg = orgs.find((o) => o.orgId === currentOrgId) ?? orgs[0]

  const handleSwitch = useCallback(
    (orgId: string) => {
      if (orgId === currentOrgId || isPending) return
      setSwitchingOrgId(orgId)
      startTransition(async () => {
        const result = await switchOrg(orgId)
        if (result.success) {
          router.refresh()
        }
        setSwitchingOrgId(null)
      })
    },
    [currentOrgId, isPending, router],
  )

  if (!currentOrg) return null

  const hasMultipleOrgs = orgs.length > 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!hasMultipleOrgs}>
        <button
          type="button"
          data-testid="org-switcher-trigger"
          aria-haspopup={hasMultipleOrgs ? 'menu' : undefined}
          className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors hover:bg-[var(--sidebar-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)] disabled:cursor-default disabled:hover:bg-transparent"
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)]"
            aria-hidden="true"
          >
            <Building2 size={14} className="text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-medium leading-tight"
              style={{ color: 'var(--sidebar-foreground)' }}
            >
              {currentOrg.orgName}
            </p>
            <p
              className="truncate text-xs capitalize leading-tight opacity-60"
              style={{ color: 'var(--sidebar-foreground)' }}
            >
              {currentOrg.role}
            </p>
          </div>

          {hasMultipleOrgs && (
            <ChevronDown
              size={14}
              className="shrink-0 opacity-50"
              style={{ color: 'var(--sidebar-foreground)' }}
              aria-hidden="true"
            />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="bottom"
        className="w-64"
        data-testid="org-switcher-content"
      >
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Switch organization
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {orgs.map((org) => {
          const isActive = org.orgId === currentOrgId
          const isSwitching = switchingOrgId === org.orgId
          return (
            <DropdownMenuItem
              key={org.orgId}
              className="flex cursor-pointer items-center gap-2 py-2"
              data-testid={`org-option-${org.orgId}`}
              disabled={isPending}
              onSelect={() => handleSwitch(org.orgId)}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--color-primary)]"
                aria-hidden="true"
              >
                <Building2 size={12} className="text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{org.orgName}</p>
              </div>

              <Badge
                variant={ROLE_VARIANT[org.role]}
                className="ml-auto shrink-0 text-xs capitalize"
              >
                {org.role}
              </Badge>

              {isSwitching ? (
                <Loader2
                  size={14}
                  className="shrink-0 animate-spin text-[var(--color-primary)]"
                  aria-label="Switching..."
                />
              ) : isActive ? (
                <Check
                  size={14}
                  className="shrink-0 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
