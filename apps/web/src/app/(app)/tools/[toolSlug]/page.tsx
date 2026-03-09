import { notFound } from 'next/navigation'
import { STEP_CONTENT } from '@pips/shared'
import type { PipsStepNumber } from '@pips/shared'
import { SandboxToolForm } from './sandbox-tool-form'

/** Build a mapping from URL slug → { formType, stepNumber, name, description } */
const buildToolMap = () => {
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

const TOOL_MAP = buildToolMap()

type ToolPageProps = {
  params: Promise<{ toolSlug: string }>
}

const ToolSandboxPage = async ({ params }: ToolPageProps) => {
  const { toolSlug } = await params
  const tool = TOOL_MAP[toolSlug]

  if (!tool) notFound()

  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <SandboxToolForm
        toolSlug={toolSlug}
        formType={tool.formType}
        stepNumber={tool.stepNumber}
        name={tool.name}
        description={tool.description}
      />
    </div>
  )
}

export default ToolSandboxPage
