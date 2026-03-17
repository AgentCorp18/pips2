'use client'

import { useState } from 'react'
import {
  Factory,
  Headphones,
  ServerCrash,
  UserCheck,
  ClipboardCheck,
  Timer,
  TrendingDown,
  ShieldAlert,
  Scale,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SYSTEM_TEMPLATES, VERTICALS, type FormTemplate } from '@/lib/form-templates'
import { TemplateApplyDialog } from './template-apply-dialog'

/* ──────────────────────────────────────────────────
   Icon map
────────────────────────────────────────────────── */

const ICON_MAP: Record<string, LucideIcon> = {
  Factory,
  Headphones,
  ServerCrash,
  UserCheck,
  ClipboardCheck,
  Timer,
  TrendingDown,
  ShieldAlert,
  Scale,
  Star,
}

const TemplateIcon = ({ name, size = 22 }: { name: string; size?: number }) => {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon size={size} aria-hidden="true" />
}

/* ──────────────────────────────────────────────────
   Filter tab types
────────────────────────────────────────────────── */

type FilterTab = 'all' | FormTemplate['vertical']

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'customer_service', label: 'Customer Service' },
  { id: 'it', label: 'IT / Technology' },
  { id: 'hr', label: 'HR / People' },
  { id: 'quality', label: 'Quality' },
]

/* ──────────────────────────────────────────────────
   Template card
────────────────────────────────────────────────── */

type TemplateCardProps = {
  template: FormTemplate
  onUse: (template: FormTemplate) => void
}

const TemplateCard = ({ template, onUse }: TemplateCardProps) => {
  const vertical = VERTICALS[template.vertical]

  return (
    <Card
      className="flex flex-col transition-shadow hover:shadow-md"
      data-testid={`template-card-${template.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
            style={{ backgroundColor: `${vertical.color}18`, color: vertical.color }}
          >
            <TemplateIcon name={template.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-semibold leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {template.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{ borderColor: vertical.color, color: vertical.color }}
                data-testid={`template-card-badge-${template.id}`}
              >
                {vertical.label}
              </Badge>
              <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {template.forms.length} forms
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <p
          className="flex-1 text-xs leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {template.description}
        </p>
        <Button
          size="sm"
          className="w-full"
          onClick={() => onUse(template)}
          data-testid={`template-card-use-${template.id}`}
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  )
}

/* ──────────────────────────────────────────────────
   Template browser (client)
────────────────────────────────────────────────── */

export const TemplateBrowser = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered =
    activeFilter === 'all'
      ? SYSTEM_TEMPLATES
      : SYSTEM_TEMPLATES.filter((t) => t.vertical === activeFilter)

  const handleUse = (template: FormTemplate) => {
    setSelectedTemplate(template)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // Keep selectedTemplate until dialog fully closes to avoid content flash
      setTimeout(() => setSelectedTemplate(null), 200)
    }
  }

  return (
    <div>
      {/* Filter tabs */}
      <div
        className="mb-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter templates by vertical"
        data-testid="template-filter-tabs"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
            data-testid={`filter-tab-${tab.id}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === tab.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="template-grid"
      >
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} onUse={handleUse} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            No templates found for this category.
          </p>
        </div>
      )}

      {/* Apply dialog */}
      <TemplateApplyDialog
        template={selectedTemplate}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      />
    </div>
  )
}
