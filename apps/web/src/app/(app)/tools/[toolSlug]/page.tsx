import { redirect } from 'next/navigation'

export default async function ToolSlugRedirect({
  params,
}: {
  params: Promise<{ toolSlug: string }>
}) {
  const { toolSlug } = await params
  redirect(`/forms/sandbox/${toolSlug}`)
}
