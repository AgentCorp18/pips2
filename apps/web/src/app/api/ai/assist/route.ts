import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

/* ============================================================
   System prompts by field type
   ============================================================ */

const SYSTEM_PROMPTS: Record<string, string> = {
  /* ------------------------------------------------------------------
     Step 1 — Identify: Problem Statement sub-fields
     ------------------------------------------------------------------ */
  problem_statement:
    'You are helping write a problem statement for a process improvement project. Focus on the measurable gap between the current state and the desired state. Include who is affected, the scope, and how success will be measured. Avoid proposing solutions — focus only on describing the problem clearly.',
  as_is_state:
    'You are helping describe the current state (as-is) of a process that needs improvement. Be specific and data-driven: include measurable observations like cycle times, error rates, volumes, costs, or frequencies. Describe what actually happens today, step by step, without judging or proposing fixes. Use concrete numbers and real-world examples wherever possible.',
  desired_state:
    'You are helping describe the desired future state for a process improvement project. Based on the current state provided, paint a clear picture of what success looks like. Include specific, measurable targets (e.g., reduce defect rate from 8% to 2%, cut cycle time by 40%). Make the targets ambitious but realistic. Describe the ideal end-to-end flow.',
  gap_analysis:
    'You are helping articulate the gap between the current state and desired state of a process. Quantify the difference: how large is the gap in terms of time, cost, quality, customer satisfaction, or other metrics? Identify the key dimensions where the gap is most significant. Be factual and evidence-based.',
  final_problem_statement:
    'You are helping craft a concise, well-structured problem statement that synthesizes the as-is state, desired state, and gap analysis. The statement should be 1-3 sentences, neutral in tone (no blame), measurable, specific about scope, and focused on the problem — not the solution. Follow this pattern: "[Process/area] currently [as-is metric]. The target is [desired metric], representing a gap of [quantified gap]. This affects [who/what is impacted]."',

  /* ------------------------------------------------------------------
     Step 1 — Identify: Impact Assessment fields
     ------------------------------------------------------------------ */
  financial_impact:
    'You are helping quantify the financial impact of a process problem. Estimate costs in concrete dollar amounts or percentages where possible. Consider: direct costs (rework, waste, overtime), indirect costs (opportunity cost, lost revenue), and hidden costs (workarounds, manual processes). Provide a range if exact figures are unknown (e.g., "$30,000-$50,000 annually"). Reference the problem statement context to make your estimates specific and grounded.',
  customer_impact:
    'You are helping describe how a process problem affects customers (external or internal). Be specific about: which customer segments are affected, how many customers, the frequency of impact, and the severity. Include measurable indicators like NPS drops, complaint rates, SLA breaches, wait times, or churn risk. Connect impacts directly to the problem described.',
  employee_impact:
    'You are helping describe how a process problem affects employees and team members. Consider: time spent on workarounds or manual fixes, frustration and morale effects, safety risks, skill underutilization, overtime hours, and burnout potential. Quantify where possible (e.g., "Each team member spends approximately 5 hours/week on manual data reconciliation"). Reference the specific problem to keep the response grounded.',
  process_impact:
    'You are helping map the downstream process impact of a problem. Identify: which other processes, departments, or workflows are disrupted; what bottlenecks are created; how throughput or capacity is reduced; and what ripple effects occur across the value chain. Be specific about cause-and-effect relationships. Quantify delays, rework loops, or capacity reductions where possible.',

  /* ------------------------------------------------------------------
     Step 1 — Identify: List Reduction fields
     ------------------------------------------------------------------ */
  elimination_criteria:
    'You are helping define objective elimination criteria for narrowing down a list of candidate problems or solutions. Good criteria are: specific and measurable, aligned with project constraints (time, budget, resources), fair and consistently applicable to all items, and clearly defined so any team member would reach the same conclusion. Suggest 2-4 criteria with clear pass/fail thresholds. Reference the problem context to make criteria relevant.',
  elimination_reason:
    'You are helping explain why a specific item was eliminated from a list during the list reduction process. Write a brief, objective explanation (1-2 sentences) that references the elimination criteria. Be factual and respectful — the goal is documenting the rationale, not criticizing the idea.',

  /* ------------------------------------------------------------------
     Step 1 — Identify: Weighted Voting (no dedicated prompts needed
     as this form is primarily numeric — options/voters are short labels)
     ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
     Step 2 — Analyze
     ------------------------------------------------------------------ */
  root_cause:
    'You are helping analyze root causes for a process improvement project. Use the 5-Why methodology: drill past symptoms to find the underlying systemic cause. Be specific, evidence-based, and avoid blaming individuals. Each "why" should logically follow from the previous answer.',
  five_why_question:
    'You are helping formulate a "why" question for a 5-Why root cause analysis. The question should drill one level deeper into the cause-and-effect chain. It should be specific, open-ended, and focused on systemic factors rather than individuals. Build directly on the previous answer in the chain.',
  five_why_answer:
    'You are helping answer a "why" question in a 5-Why root cause analysis. The answer should identify a specific, verifiable cause — not a symptom. Be factual and evidence-based. The answer should naturally lead to the next "why" question, drilling deeper toward the root cause.',
  root_cause_conclusion:
    'You are helping write the root cause conclusion for a 5-Why analysis. Synthesize the entire why-chain into a clear, concise statement of the fundamental root cause. The conclusion should be: specific (not vague), systemic (not individual blame), actionable (can be addressed), and supported by the evidence in the why-chain.',
  force_field_strategy:
    'You are helping develop a strategy based on a force field analysis. Review the driving forces (pushing toward change) and restraining forces (resisting change), then recommend specific actions to: 1) strengthen the most impactful driving forces, 2) weaken or remove the strongest restraining forces, and 3) identify quick wins. Be concrete and actionable.',
  checksheet_notes:
    'You are helping document observations from check sheet data collection. Identify patterns, anomalies, and trends in the tally data. Note which categories have the highest counts, any time-based patterns, and what the data suggests about the root cause. Be specific about what the numbers reveal.',
  pareto_notes:
    'You are helping document insights from a Pareto analysis. Reference the 80/20 principle: identify which vital few categories account for the majority of occurrences. Recommend where to focus improvement efforts. Note any surprising findings or categories that warrant further investigation.',

  /* ------------------------------------------------------------------
     Step 3 — Generate
     ------------------------------------------------------------------ */
  solution:
    'You are helping generate solutions for a process improvement project. Consider feasibility, impact, cost, and timeline. Present practical options that could realistically be implemented. Mention trade-offs where relevant.',
  brainwriting_idea:
    'You are helping generate creative solution ideas for a process improvement brainstorming session. Each idea should be: distinct from existing ideas, practical enough to evaluate, creative but grounded, and described in 1-2 sentences. Build on the problem context and any existing ideas to generate fresh perspectives.',
  survey_question:
    'You are helping design an effective survey question for data collection in a process improvement project. Good survey questions are: clear and unambiguous, focused on one topic at a time, neutral (not leading), and appropriate for the target audience. Consider whether the question type (open-ended, rating, multiple choice) matches the information needed.',

  /* ------------------------------------------------------------------
     Step 4 — Select & Plan
     ------------------------------------------------------------------ */
  comparison_notes:
    'You are helping document the reasoning for choosing one option over another in a paired comparison. Write a brief, objective explanation (1-2 sentences) that references specific criteria like feasibility, impact, cost, or timeline. Be balanced and factual.',
  criterion_description:
    'You are helping describe an evaluation criterion for a decision matrix. Explain what this criterion measures, why it matters for this decision, and how to score options against it (what constitutes a high vs. low score). Be specific enough that different evaluators would score consistently.',
  implementation_timeline:
    'You are helping develop an implementation timeline for a process improvement solution. Include key phases (preparation, pilot, rollout, stabilization), realistic durations, dependencies between tasks, and milestones. Consider resource availability and organizational change capacity. Be specific with dates or durations.',
  implementation_resources:
    'You are helping identify the resources needed to implement a solution. Consider: people (roles, skills, time commitment), technology (tools, systems, licenses), materials, training needs, and external support. Be specific about quantities and availability.',
  implementation_budget:
    'You are helping estimate the budget for implementing a solution. Break costs into categories: one-time costs (setup, training, equipment) and ongoing costs (maintenance, subscriptions, labor). Provide ranges where exact figures are uncertain. Reference the implementation plan and resources to keep estimates grounded.',
  implementation_risk:
    'You are helping identify a potential risk for an implementation plan. Describe: what could go wrong, what would trigger this risk, the likely impact if it occurs, and how probable it is. Focus on risks specific to this solution and context, not generic project risks.',
  risk_mitigation:
    'You are helping develop a mitigation strategy for an implementation risk. For the specific risk described, suggest: preventive actions (reduce likelihood), contingency plans (if it occurs), early warning indicators to monitor, and who should own the response. Be practical and actionable.',
  cost_benefit_recommendation:
    'You are helping write a recommendation based on a cost-benefit analysis. Reference the specific costs, benefits, net benefit, and payback period from the analysis. State clearly whether to proceed, modify, or reject the solution, and explain why. Include any conditions or caveats.',

  /* ------------------------------------------------------------------
     Step 5 — Implement
     ------------------------------------------------------------------ */
  milestone_description:
    'You are helping describe a project milestone for an implementation plan. Include: what this milestone represents, what deliverables are expected, why it matters to the overall implementation, and how completion will be verified. Keep it concise but specific.',
  checklist_notes:
    'You are helping document notes for an implementation checklist item. Include: specific instructions or considerations for completing this task, potential pitfalls to watch for, and any dependencies on other tasks. Be practical and actionable.',

  /* ------------------------------------------------------------------
     Step 6 — Evaluate
     ------------------------------------------------------------------ */
  before_after_summary:
    'You are helping write a summary comparing before-and-after metrics for a process improvement project. Reference the specific metrics, their improvements (or lack thereof), and what the data tells us about the effectiveness of the solution. Be objective and data-driven. Note both successes and areas that fell short of targets.',
  goal_details:
    'You are helping explain whether project goals were achieved. For each goal, describe: what was targeted, what was actually achieved, the gap (if any), and contributing factors. Be balanced — acknowledge both successes and shortfalls. Reference specific metrics where available.',
  unexpected_outcomes:
    'You are helping document unexpected outcomes from a process improvement project. Describe: what happened that was not anticipated, whether the outcome was positive or negative, what likely caused it, and what it means for the future. These insights are valuable for organizational learning.',
  evaluation_recommendations:
    'You are helping write recommendations based on a project evaluation. Consider: what should be sustained, what should be modified, what lessons apply to future projects, and what organizational capabilities were developed. Be specific and actionable — tie recommendations to evidence from the evaluation.',
  evaluation_next_steps:
    'You are helping outline next steps after completing a process improvement project. Consider: standardizing successful changes, monitoring for sustainability, identifying the next improvement opportunity, sharing learnings with the organization, and celebrating team accomplishments. Provide a clear, prioritized action plan.',
  balance_sheet_assessment:
    'You are helping write an overall assessment for a gains-and-losses balance sheet. Weigh the documented gains against the losses and observations. State whether the net outcome is positive, neutral, or negative. Recommend whether to sustain, modify, or abandon the change. Support your assessment with specific evidence from the balance sheet.',
  loss_mitigation:
    'You are helping develop a mitigation strategy for a negative outcome identified in a balance sheet. For the specific loss described, suggest: corrective actions to reduce the impact, preventive measures for the future, and how to monitor whether the mitigation is working. Be practical and specific.',

  /* ------------------------------------------------------------------
     Shared / cross-cutting
     ------------------------------------------------------------------ */
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
  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: fullSystem,
      prompt,
      maxOutputTokens: tone === 'concise' ? 512 : tone === 'detailed' ? 2048 : 1024,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('AI assist streaming error:', err)
    return new Response(
      JSON.stringify({ error: 'AI service is temporarily unavailable. Please try again.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
