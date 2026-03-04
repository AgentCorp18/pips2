'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WORKSHOP_TEMPLATES } from '@/lib/workshop-templates'
import { createSession } from './actions'

export const WorkshopCreateButton = () => {
  const [showPicker, setShowPicker] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreateFromTemplate = (templateId: string) => {
    const template = WORKSHOP_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    startTransition(async () => {
      const result = await createSession(template.name, template.modules)
      if (result.success) {
        router.push(`/knowledge/workshop/${result.data.id}`)
      }
    })
  }

  const handleCreateBlank = () => {
    startTransition(async () => {
      const result = await createSession('New Workshop Session', [])
      if (result.success) {
        router.push(`/knowledge/workshop/${result.data.id}`)
      }
    })
  }

  if (!showPicker) {
    return (
      <Button size="sm" onClick={() => setShowPicker(true)}>
        <Plus size={14} />
        New Session
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Create Workshop Session
          </h2>
          <Button variant="ghost" size="icon-xs" onClick={() => setShowPicker(false)}>
            <X size={14} />
          </Button>
        </div>

        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Choose a template or start from scratch
        </p>

        <div className="mt-4 space-y-2">
          {WORKSHOP_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer transition-all hover:border-[var(--color-primary)]"
              onClick={() => !isPending && handleCreateFromTemplate(template.id)}
            >
              <CardContent className="py-3">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  {template.name}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                  {template.description}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                    <Clock size={11} />
                    {template.duration}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    {template.modules.length} modules
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleCreateBlank} disabled={isPending}>
            Blank Session
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPicker(false)}>
            Cancel
          </Button>
        </div>

        {isPending && (
          <p className="mt-2 text-center text-xs text-[var(--color-text-tertiary)]">
            Creating session...
          </p>
        )}
      </div>
    </div>
  )
}
