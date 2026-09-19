/**
 * Renders a JSON-LD <script> tag for structured data.
 * Server component — no client JS cost.
 *
 * SECURITY: JSON.stringify does not escape `<`, so a value containing a closing
 * script sequence would terminate the script element early and everything after
 * it would be parsed as HTML. Those characters are escaped to their \\u form,
 * which is equivalent JSON but inert inside a script element. U+2028/U+2029 are
 * escaped too: they are valid in JSON but are line terminators in JavaScript.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data
 */

const LINE_SEPARATOR = String.fromCharCode(0x2028)
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029)

const SCRIPT_UNSAFE = new RegExp(`[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`, 'g')

const SCRIPT_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  [LINE_SEPARATOR]: '\\u2028',
  [PARAGRAPH_SEPARATOR]: '\\u2029',
}

/** Serialise a value to JSON that is safe to embed inside a <script> element. */
export const serializeJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify(data).replace(SCRIPT_UNSAFE, (char) => SCRIPT_ESCAPES[char] ?? char)

export const JsonLd = ({ data }: { data: Record<string, unknown> }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
