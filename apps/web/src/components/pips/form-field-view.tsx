'use client'

import { Badge } from '@/components/ui/badge'

/* ---- Single text field (textarea / input replacement) ---- */

type FormFieldViewProps = {
  label: string
  value: string
  helperText?: string
}

export const FormFieldView = ({ label, value, helperText }: FormFieldViewProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
    {helperText && <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>}
    {value ? (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {value}
      </p>
    ) : (
      <p className="text-sm italic text-[var(--color-text-tertiary)]">Not provided</p>
    )}
  </div>
)

/* ---- Tag list (read-only badge list) ---- */

type FormTagListViewProps = {
  label: string
  values: string[]
  helperText?: string
}

export const FormTagListView = ({ label, values, helperText }: FormTagListViewProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
    {helperText && <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>}
    {values.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {values.map((item, i) => (
          <Badge key={i} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-sm italic text-[var(--color-text-tertiary)]">None</p>
    )}
  </div>
)

/* ---- Select / single value with label ---- */

type FormSelectViewProps = {
  label: string
  value: string
  options?: { value: string; label: string }[]
  helperText?: string
}

export const FormSelectView = ({ label, value, options, helperText }: FormSelectViewProps) => {
  const displayValue = options?.find((o) => o.value === value)?.label ?? value

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
      {helperText && <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>}
      {displayValue ? (
        <Badge variant="outline" className="w-fit">
          {displayValue}
        </Badge>
      ) : (
        <p className="text-sm italic text-[var(--color-text-tertiary)]">Not selected</p>
      )}
    </div>
  )
}

/* ---- Inline text value (for tables / compact layouts) ---- */

type FormInlineViewProps = {
  value: string
  placeholder?: string
  className?: string
}

export const FormInlineView = ({ value, placeholder, className }: FormInlineViewProps) => (
  <span className={className ?? 'text-sm text-[var(--color-text-secondary)]'}>
    {value || (
      <span className="italic text-[var(--color-text-tertiary)]">
        {placeholder ?? 'Not provided'}
      </span>
    )}
  </span>
)
