'use client'

import { useRef, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { AiAssistButton } from '@/components/ui/ai-assist-button'

type FormTextareaProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helperText?: string
  maxLength?: number
  rows?: number
  required?: boolean
  aiFieldType?: string
  aiContext?: string
}

export const FormTextarea = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  helperText,
  maxLength = 2000,
  rows = 3,
  required = false,
  aiFieldType,
  aiContext,
}: FormTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleAccept = useCallback(
    (text: string) => {
      onChange(text)
    },
    [onChange],
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-[var(--color-error)]"> *</span>}
        </Label>
        {aiFieldType && (
          <AiAssistButton
            fieldRef={textareaRef}
            fieldType={aiFieldType}
            context={aiContext}
            onAccept={handleAccept}
          />
        )}
      </div>
      {helperText && <p className="text-xs text-[var(--color-text-tertiary)]">{helperText}</p>}
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="flex min-h-[80px] w-full rounded-[var(--radius-md)] border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <div className="flex justify-end">
        <span className="text-[10px] text-[var(--color-text-tertiary)]">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  )
}
