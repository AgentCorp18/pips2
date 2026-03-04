'use client'

import { useActionState, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Mail, CheckCircle2, File } from 'lucide-react'
import { requestTemplateDownload, type TemplateDownloadState } from './actions'
import type { Template } from './_template-data'
import { TEMPLATE_CATEGORIES } from './_template-data'

const FORMAT_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  Excel: FileSpreadsheet,
  Word: File,
}

const FORMAT_COLORS: Record<string, string> = {
  PDF: 'text-red-500',
  Excel: 'text-emerald-500',
  Word: 'text-blue-500',
}

const initialState: TemplateDownloadState = {
  success: false,
  error: null,
  templateId: null,
}

export const TemplateCard = ({ template }: { template: Template }) => {
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, isPending] = useActionState(requestTemplateDownload, initialState)

  const categoryMeta = TEMPLATE_CATEGORIES[template.category]
  const FormatIcon = FORMAT_ICONS[template.format] ?? FileText

  const isSuccess = state.success && state.templateId === template.id
  const effectiveDownloaded = isSuccess
  const effectiveShowForm = showForm && !isSuccess

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <FormatIcon size={18} className={FORMAT_COLORS[template.format] ?? 'text-gray-500'} />
          <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
            {template.format}
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: categoryMeta.color }}
        >
          Step {template.step}
        </span>
      </div>

      {/* Content */}
      <h3 className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">
        {template.name}
      </h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        {template.description}
      </p>

      {/* Action */}
      <div className="mt-4">
        {effectiveDownloaded ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={16} />
            <span className="font-medium">Download link sent!</span>
          </div>
        ) : effectiveShowForm ? (
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="templateId" value={template.id} />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] py-1.5 pl-8 pr-3 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="shrink-0 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {isPending ? 'Sending...' : 'Get Template'}
              </button>
            </div>
            {state.error && <p className="text-xs text-red-500">{state.error}</p>}
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)] py-2 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
          >
            <Download size={14} />
            Download Template
          </button>
        )}
      </div>
    </div>
  )
}
