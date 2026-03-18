import { notFound } from 'next/navigation'
import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { SandboxForm } from './sandbox-form'

/** Build a mapping from URL slug → { formType, stepNumber, name, description } */
const buildFormMap = () => {
  const map: Record<
    string,
    { formType: string; stepNumber: number; name: string; description: string }
  > = {}
  for (let step = 1; step <= 6; step++) {
    const content = STEP_CONTENT[step as PipsStepNumber]
    for (const form of content.forms) {
      const urlSlug = form.type.replace(/_/g, '-')
      map[urlSlug] = {
        formType: form.type,
        stepNumber: step,
        name: form.name,
        description: form.description,
      }
    }
  }
  return map
}

const FORM_MAP = buildFormMap()

type FormSandboxPageProps = {
  params: Promise<{ formSlug: string }>
}

const FormSandboxPage = async ({ params }: FormSandboxPageProps) => {
  const { formSlug } = await params
  const form = FORM_MAP[formSlug]

  if (!form) notFound()

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <SandboxForm
        formSlug={formSlug}
        formType={form.formType}
        stepNumber={form.stepNumber}
        name={form.name}
        description={form.description}
      />
    </div>
  )
}

export default FormSandboxPage
