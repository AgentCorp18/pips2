/**
 * Renders a JSON-LD <script> tag for structured data.
 * Server component — no client JS cost.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */
export const JsonLd = ({ data }: { data: Record<string, unknown> }) => {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}
