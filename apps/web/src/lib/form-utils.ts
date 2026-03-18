import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'

/** Resolve a form_type string to its human-readable name from STEP_CONTENT */
export const getFormDisplayName = (formType: string): string => {
  for (let step = 1; step <= 6; step++) {
    const content = STEP_CONTENT[step as PipsStepNumber]
    const found = content.forms.find((f) => f.type === formType)
    if (found) return found.name
  }
  // Fallback: convert underscores to title case
  return formType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
