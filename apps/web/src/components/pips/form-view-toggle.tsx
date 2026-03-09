'use client'

import { Eye, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FormMode } from './form-view-context'

type FormViewToggleProps = {
  mode: FormMode
  onToggle: () => void
}

export const FormViewToggle = ({ mode, onToggle }: FormViewToggleProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onToggle}
    data-testid="form-view-toggle"
    className="gap-1.5"
  >
    {mode === 'edit' ? (
      <>
        <Eye size={14} />
        View
      </>
    ) : (
      <>
        <Pencil size={14} />
        Edit
      </>
    )}
  </Button>
)
