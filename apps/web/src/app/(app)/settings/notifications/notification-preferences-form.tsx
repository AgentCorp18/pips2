'use client'

import { useCallback, useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { Ticket, AtSign, FolderKanban, RefreshCw, MessageSquare, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  updateNotificationPreferences,
  type NotificationPreferences,
  type PreferenceKey,
} from './actions'

/* ============================================================
   Types & Config
   ============================================================ */

type NotificationPreferencesFormProps = {
  preferences: NotificationPreferences
}

type PreferenceItem = {
  key: PreferenceKey
  label: string
  description: string
  icon: typeof Ticket
}

const IN_APP_PREFERENCES: PreferenceItem[] = [
  {
    key: 'ticket_assigned',
    label: 'Ticket assigned',
    description: 'When a ticket is assigned to you',
    icon: Ticket,
  },
  {
    key: 'mention',
    label: 'Mentions',
    description: 'When someone @mentions you in a comment',
    icon: AtSign,
  },
  {
    key: 'project_updated',
    label: 'Project updates',
    description: 'When a project you are on advances to a new step',
    icon: FolderKanban,
  },
  {
    key: 'ticket_updated',
    label: 'Ticket updates',
    description: 'When a ticket you are assigned to is updated',
    icon: RefreshCw,
  },
  {
    key: 'ticket_commented',
    label: 'Comments',
    description: 'When someone comments on your ticket',
    icon: MessageSquare,
  },
]

/* ============================================================
   Component
   ============================================================ */

export const NotificationPreferencesForm = ({ preferences }: NotificationPreferencesFormProps) => {
  const [isPending, startTransition] = useTransition()

  const [optimisticPrefs, setOptimisticPrefs] = useOptimistic(
    preferences,
    (state: NotificationPreferences, update: { key: PreferenceKey; value: boolean }) => ({
      ...state,
      [update.key]: update.value,
    }),
  )

  const handleToggle = useCallback(
    (key: PreferenceKey, checked: boolean) => {
      startTransition(async () => {
        setOptimisticPrefs({ key, value: checked })

        const result = await updateNotificationPreferences(preferences.id, key, checked)

        if (result.error) {
          toast.error(result.error)
        }
      })
    },
    [preferences.id, setOptimisticPrefs],
  )

  return (
    <div className="space-y-6">
      {/* In-app notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">In-app notifications</CardTitle>
          <CardDescription>
            Choose which notifications appear in your notification bell
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {IN_APP_PREFERENCES.map((item, index) => {
            const Icon = item.icon
            const isChecked = optimisticPrefs[item.key]

            return (
              <div key={item.key}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between gap-4 py-1">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--color-surface-secondary)' }}
                    >
                      <Icon size={14} style={{ color: 'var(--color-text-secondary)' }} />
                    </div>
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={`pref-${item.key}`}
                        className="cursor-pointer text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {item.label}
                      </Label>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`pref-${item.key}`}
                    checked={isChecked}
                    disabled={isPending}
                    onCheckedChange={(checked: boolean) => handleToggle(item.key, checked)}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Email notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email notifications</CardTitle>
          <CardDescription>
            Control whether notifications are also sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--color-surface-secondary)' }}
              >
                <Mail size={14} style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <div className="space-y-0.5">
                <Label
                  htmlFor="pref-email_enabled"
                  className="cursor-pointer text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Email delivery
                </Label>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Receive notification emails in addition to in-app notifications
                </p>
              </div>
            </div>
            <Switch
              id="pref-email_enabled"
              checked={optimisticPrefs.email_enabled}
              disabled={isPending}
              onCheckedChange={(checked: boolean) => handleToggle('email_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
