import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/* ============================================================
   System prompts by field type
   ============================================================ */

const SYSTEM_PROMPTS: Record<string, string> = {
  problem_statement:
    'Help write a clear problem statement for a process improvement project. Focus on measurable gaps between current and desired state.',
  root_cause:
    'Help analyze root causes using the 5-Why methodology. Be specific and evidence-based.',
  solution:
    'Help generate creative solutions. Consider feasibility, impact, and resources required.',
  ticket_description: 'Help write a clear ticket description with acceptance criteria and context.',
  comment: "Help write a professional comment that's clear and actionable.",
  project_description:
    'Help write a compelling project description that explains the business value.',
  lessons_learned:
    "Help capture lessons learned. Focus on what went well, what didn't, and what to do differently.",
  general: 'Help improve and expand on this text. Keep the same tone and intent.',
}

/* ============================================================
   Request validation
   ============================================================ */

const requestSchema = z.object({
  prompt: z.string().min(1).max(5000),
  context: z.string().max(5000).default(''),
  fieldType: z.string().min(1).max(50),
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

  const { prompt, context, fieldType } = parsed.data

  const systemPrompt = SYSTEM_PROMPTS[fieldType] ?? SYSTEM_PROMPTS.general

  const fullSystem = context
    ? `${systemPrompt}\n\nContext about this project/item:\n${context}`
    : systemPrompt

  // Stream the response using Vercel AI SDK
  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: fullSystem,
    prompt,
    maxOutputTokens: 1024,
  })

  return result.toTextStreamResponse()
}
