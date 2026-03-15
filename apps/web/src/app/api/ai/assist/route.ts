import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

/* ============================================================
   System prompts by field type
   ============================================================ */

const SYSTEM_PROMPTS: Record<string, string> = {
  problem_statement:
    'You are helping write a problem statement for a process improvement project. Focus on the measurable gap between the current state and the desired state. Include who is affected, the scope, and how success will be measured. Avoid proposing solutions — focus only on describing the problem clearly.',
  root_cause:
    'You are helping analyze root causes for a process improvement project. Use the 5-Why methodology: drill past symptoms to find the underlying systemic cause. Be specific, evidence-based, and avoid blaming individuals. Each "why" should logically follow from the previous answer.',
  solution:
    'You are helping generate solutions for a process improvement project. Consider feasibility, impact, cost, and timeline. Present practical options that could realistically be implemented. Mention trade-offs where relevant.',
  ticket_description:
    'You are helping write a clear ticket/task description. Include: what needs to be done, why it matters, acceptance criteria, and any relevant context. Write for someone unfamiliar with the background.',
  comment:
    'You are helping write a professional comment. Be clear, constructive, and actionable. Focus on moving the conversation forward.',
  project_description:
    'You are helping write a project description for a process improvement initiative. Explain the business value, scope, expected outcomes, and key stakeholders. Make it compelling but realistic.',
  lessons_learned:
    "You are helping capture lessons learned from a process improvement project. Cover: what went well (and why), what didn't go as planned (and why), what you would do differently, and recommendations for future projects.",
  general:
    'You are a helpful writing assistant for a process improvement project management tool. Help improve and expand on the text while keeping the same intent. Write naturally and avoid generic filler.',
}

/* ============================================================
   Tone instructions
   ============================================================ */

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional:
    'Write in a professional, business-appropriate tone. Use clear and direct language.',
  casual:
    'Write in a friendly, conversational tone. Keep it approachable and easy to read, but still substantive.',
  concise:
    'Be brief and to the point. Use short sentences. Cut any unnecessary words. Aim for maximum clarity in minimum words.',
  detailed:
    'Be thorough and comprehensive. Include relevant details, examples, and explanations. Aim for completeness.',
}

/* ============================================================
   Request validation
   ============================================================ */

const requestSchema = z.object({
  prompt: z.string().min(1).max(5000),
  context: z.string().max(5000).default(''),
  fieldType: z.string().min(1).max(50),
  tone: z.enum(['professional', 'casual', 'concise', 'detailed']).default('professional'),
})

/* ============================================================
   POST /api/ai/assist
   ============================================================ */

export const POST = async (request: Request) => {
  // Check for API key first
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          'AI features are not configured. Please set the ANTHROPIC_API_KEY environment variable.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Require authentication
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Rate limit: 10 requests per minute per user
  const { allowed, resetAt } = await checkRateLimit(`ai-assist:${user.id}`, 10, 60_000)

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  // Parse and validate body
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const parsed = requestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid payload',
        details: parsed.error.flatten().fieldErrors,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { prompt, context, fieldType, tone } = parsed.data

  const systemPrompt = SYSTEM_PROMPTS[fieldType] ?? SYSTEM_PROMPTS.general
  const toneInstruction = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.professional

  let fullSystem = `${systemPrompt}\n\n${toneInstruction}`

  fullSystem +=
    '\n\nIMPORTANT: Write plain text only. Do not use markdown formatting (no headers, no bullet points with *, no bold with **). Write in natural paragraphs. If listing items, use simple numbered lists or commas.'

  if (context) {
    fullSystem += `\n\nContext about this project/item:\n${context}`
  }

  // Stream the response using Vercel AI SDK
  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: fullSystem,
    prompt,
    maxOutputTokens: tone === 'concise' ? 512 : tone === 'detailed' ? 2048 : 1024,
  })

  return result.toTextStreamResponse()
}
