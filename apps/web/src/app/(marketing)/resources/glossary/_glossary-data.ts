export type GlossaryTerm = {
  term: string
  slug: string
  definition: string
  longDescription: string
  relatedStep: number | null
  relatedTools: string[]
  relatedTerms: string[]
  category: 'methodology' | 'tool' | 'principle' | 'role' | 'concept'
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'As-Is State',
    slug: 'as-is-state',
    definition: 'The current condition of a process before any improvement is applied.',
    longDescription:
      'The As-Is State is a factual, measurable description of how a process currently operates. It forms the first part of a PIPS problem statement and establishes the baseline against which improvement will be measured. The As-Is State should be expressed in observable terms — numbers, frequencies, durations — not opinions or blame.',
    relatedStep: 1,
    relatedTools: ['problem-statement'],
    relatedTerms: ['desired-state', 'gap', 'problem-statement', 'baseline'],
    category: 'concept',
  },
  {
    term: 'Baseline',
    slug: 'baseline',
    definition: 'The measured starting point of a metric before improvement begins.',
    longDescription:
      'A baseline is the quantitative measurement of a process metric at the start of a PIPS project. It is captured during Step 1 (Identify) and used again in Step 6 (Evaluate) for the before-after comparison. Without a clear baseline, there is no way to objectively determine whether an improvement effort succeeded. Baselines should be measured over a consistent time period using a consistent method.',
    relatedStep: 1,
    relatedTools: ['problem-statement', 'before-after'],
    relatedTerms: ['as-is-state', 'before-after-comparison', 'gap'],
    category: 'concept',
  },
  {
    term: 'Before-After Comparison',
    slug: 'before-after-comparison',
    definition: 'A structured comparison of baseline metrics with post-implementation results.',
    longDescription:
      'The Before-After Comparison is a Step 6 (Evaluate) tool that places baseline metrics next to post-implementation metrics in a table format. Each row contains the metric name, baseline value, target value, actual value, percentage change, and whether the target was met. It answers the fundamental question: Did the improvement work?',
    relatedStep: 6,
    relatedTools: ['before-after', 'evaluation'],
    relatedTerms: ['baseline', 'evaluation-summary', 'gap'],
    category: 'tool',
  },
  {
    term: 'Brainstorming',
    slug: 'brainstorming',
    definition:
      'A group idea generation technique where judgment is deferred to maximize creative output.',
    longDescription:
      'Brainstorming is a Step 3 (Generate) technique where team members freely propose solutions without criticism or evaluation. The ground rules are: no criticism, quantity over quality, build on others\' ideas, and wild ideas are welcome. The goal is to generate as many ideas as possible before any filtering occurs. Brainstorming follows the "Expand Then Contract" principle.',
    relatedStep: 3,
    relatedTools: ['brainstorming', 'brainwriting'],
    relatedTerms: ['brainwriting', 'expand-then-contract', 'divergent-thinking'],
    category: 'tool',
  },
  {
    term: 'Brainwriting (6-3-5)',
    slug: 'brainwriting',
    definition:
      'A silent, written alternative to brainstorming where 6 people write 3 ideas in 5 minutes, then pass and build.',
    longDescription:
      'Brainwriting 6-3-5 is a structured idea generation method used in Step 3 (Generate). Six participants each write 3 ideas in 5 minutes, then pass their sheet to the next person who builds on those ideas. After 6 rounds, the group can generate up to 108 ideas in 30 minutes. It is especially effective for introverted team members and groups with power dynamics that suppress candid input.',
    relatedStep: 3,
    relatedTools: ['brainwriting', 'brainstorming'],
    relatedTerms: ['brainstorming', 'expand-then-contract', 'silent-brainstorming'],
    category: 'tool',
  },
  {
    term: 'Check Sheet',
    slug: 'check-sheet',
    definition: 'A structured tally form for collecting data by category over time periods.',
    longDescription:
      'A Check Sheet is a Step 2 (Analyze) data collection tool. Rows represent categories (types of defects, errors, or events) and columns represent time periods. Tally marks are recorded each time an event occurs. The completed sheet reveals patterns: which categories are most common, whether there are time-based trends, and where to focus further investigation.',
    relatedStep: 2,
    relatedTools: ['checksheet'],
    relatedTerms: ['data-over-opinions', 'root-cause-analysis', 'baseline'],
    category: 'tool',
  },
  {
    term: 'Close The Loop',
    slug: 'close-the-loop',
    definition:
      'The PIPS principle that every improvement cycle must end with evaluation and feed the next cycle.',
    longDescription:
      'Close The Loop is the third core PIPS principle. It means that every PIPS cycle must reach Step 6 (Evaluate) and explicitly decide: standardize the improvement, iterate with another cycle, or start a new project. The evaluation results and lessons learned become input for the next cycle. This creates a continuous improvement spiral rather than a one-time project.',
    relatedStep: 6,
    relatedTools: ['evaluation', 'lessons-learned', 'before-after'],
    relatedTerms: ['continuous-improvement', 'evaluation-summary', 'lessons-learned'],
    category: 'principle',
  },
  {
    term: 'Continuous Improvement',
    slug: 'continuous-improvement',
    definition:
      'A permanent organizational discipline of systematically identifying and resolving problems.',
    longDescription:
      'Continuous improvement is the overarching philosophy that PIPS embodies. It treats process improvement not as a project with a start and end date, but as a permanent operating discipline — like fitness or maintenance. Organizations that practice continuous improvement build resilience, adaptability, and a culture where getting better is a normal part of daily work.',
    relatedStep: null,
    relatedTools: [],
    relatedTerms: ['close-the-loop', 'pips-cycle', 'kaizen'],
    category: 'concept',
  },
  {
    term: 'Convergent Thinking',
    slug: 'convergent-thinking',
    definition:
      'The process of narrowing options to select the best solution using objective criteria.',
    longDescription:
      'Convergent thinking is the "contract" phase of "Expand Then Contract." In PIPS, it happens in Step 4 (Select & Plan) when the team evaluates the ideas generated in Step 3 using criteria matrices, paired comparisons, and other structured tools. The goal is to move from many options to the best option through objective analysis, not gut feeling.',
    relatedStep: 4,
    relatedTools: ['criteria-matrix', 'paired-comparisons', 'weighted-voting'],
    relatedTerms: ['divergent-thinking', 'expand-then-contract', 'criteria-matrix'],
    category: 'concept',
  },
  {
    term: 'Cost-Benefit Analysis',
    slug: 'cost-benefit-analysis',
    definition:
      'A financial evaluation comparing total implementation costs against projected benefits.',
    longDescription:
      'Cost-Benefit Analysis quantifies the financial returns of a proposed solution by comparing costs (technology, labor, training, disruption) against benefits (savings, error reduction, efficiency gains) over a defined period. It produces key metrics: total cost, total benefit, net benefit, ROI percentage, and payback period. It is the language leadership speaks when allocating resources.',
    relatedStep: 4,
    relatedTools: ['cost-benefit'],
    relatedTerms: ['criteria-matrix', 'roi', 'implementation-plan'],
    category: 'tool',
  },
  {
    term: 'Criteria Matrix',
    slug: 'criteria-matrix',
    definition: 'A weighted scoring tool for evaluating solutions against defined criteria.',
    longDescription:
      'A Criteria Matrix (Decision Matrix) evaluates multiple solutions against weighted criteria. Each criterion gets an importance weight (1-10), each solution gets a score against each criterion (1-5), weights are multiplied by scores, and totals are summed. The highest-scoring solution is the recommended choice. Setting weights before scoring prevents bias toward a pre-selected favorite.',
    relatedStep: 4,
    relatedTools: ['criteria-matrix'],
    relatedTerms: ['convergent-thinking', 'weighted-voting', 'paired-comparisons'],
    category: 'tool',
  },
  {
    term: 'Data Over Opinions',
    slug: 'data-over-opinions',
    definition:
      'The PIPS principle that every decision must be grounded in evidence, not gut feelings.',
    longDescription:
      'Data Over Opinions is the first core PIPS principle. It requires that every claim about a problem, every diagnosis of a cause, and every recommendation for a solution be supported by evidence. This does not require advanced statistics — it means counting things, measuring things, and being honest about what the numbers say. The loudest voice in the room does not win; the data does.',
    relatedStep: null,
    relatedTools: ['checksheet', 'before-after', 'problem-statement'],
    relatedTerms: ['baseline', 'check-sheet', 'as-is-state'],
    category: 'principle',
  },
  {
    term: 'Desired State',
    slug: 'desired-state',
    definition: 'The target condition of a process that the improvement effort aims to achieve.',
    longDescription:
      "The Desired State is the second component of a PIPS problem statement. It describes what the process should look like after improvement, expressed in the same measurable terms as the As-Is State. The gap between As-Is and Desired State defines the scope of the improvement effort. The Desired State should be ambitious but achievable within the team's sphere of influence.",
    relatedStep: 1,
    relatedTools: ['problem-statement'],
    relatedTerms: ['as-is-state', 'gap', 'problem-statement'],
    category: 'concept',
  },
  {
    term: 'Divergent Thinking',
    slug: 'divergent-thinking',
    definition: 'The process of generating many options without judgment or filtering.',
    longDescription:
      'Divergent thinking is the "expand" phase of "Expand Then Contract." In PIPS, it happens in Step 3 (Generate) when the team uses brainstorming and brainwriting to produce as many solution ideas as possible. Judgment is explicitly deferred — no criticism, no evaluation, no filtering. The more ideas generated, the higher the probability of finding an innovative solution.',
    relatedStep: 3,
    relatedTools: ['brainstorming', 'brainwriting'],
    relatedTerms: ['convergent-thinking', 'expand-then-contract', 'brainstorming'],
    category: 'concept',
  },
  {
    term: 'Dot Voting',
    slug: 'dot-voting',
    definition:
      'A quick prioritization technique where each person distributes a fixed number of votes across options.',
    longDescription:
      'Dot voting (also called weighted voting or multi-voting) is a prioritization method where each team member places adhesive dots on the options they favor most. Each person gets a fixed number of dots (typically 3-5) and can distribute them however they choose, including placing multiple dots on one item. The items with the most dots rise to the top. Silent voting prevents anchoring bias.',
    relatedStep: 2,
    relatedTools: ['weighted-voting'],
    relatedTerms: ['weighted-voting', 'fishbone-diagram', 'list-reduction'],
    category: 'tool',
  },
  {
    term: 'Evaluation Summary',
    slug: 'evaluation-summary',
    definition:
      'The capstone document that synthesizes results, retrospective insights, and next-step recommendations.',
    longDescription:
      'The Evaluation Summary is the final deliverable of a PIPS cycle. It includes: a brief project overview, before-after comparison results, process assessment (how well did the team execute?), and a clear recommendation: standardize (make permanent), iterate (run another cycle), or close (problem resolved). It serves as both a close-out report and a reference for future improvement efforts.',
    relatedStep: 6,
    relatedTools: ['evaluation'],
    relatedTerms: ['before-after-comparison', 'lessons-learned', 'close-the-loop'],
    category: 'tool',
  },
  {
    term: 'Expand Then Contract',
    slug: 'expand-then-contract',
    definition:
      'The PIPS principle of first generating many options (diverge) then selecting the best (converge).',
    longDescription:
      'Expand Then Contract is the second core PIPS principle. It requires that idea generation (Step 3) be separated from evaluation (Step 4). First, the team diverges — producing as many ideas as possible without judgment. Then, the team converges — applying objective criteria to select the best option. This prevents the common trap of evaluating ideas before enough options have been considered.',
    relatedStep: null,
    relatedTools: ['brainstorming', 'brainwriting', 'criteria-matrix'],
    relatedTerms: ['divergent-thinking', 'convergent-thinking', 'brainstorming'],
    category: 'principle',
  },
  {
    term: 'Facilitator',
    slug: 'facilitator',
    definition:
      'The person who manages the PIPS process and group dynamics without contributing content.',
    longDescription:
      "The Facilitator guides the PIPS team through each step, managing time, group dynamics, and the structured process. The facilitator's job is to manage how the team works, not what they produce. Key skills include: time-boxing activities, ensuring equal participation, handling dominant voices, and keeping the group focused on the current step. A skilled facilitator is the single biggest multiplier of PIPS effectiveness.",
    relatedStep: null,
    relatedTools: [],
    relatedTerms: ['process-guide', 'scribe', 'team-roles'],
    category: 'role',
  },
  {
    term: 'Fishbone Diagram',
    slug: 'fishbone-diagram',
    definition:
      'A visual cause-and-effect analysis tool that maps potential causes across structured categories.',
    longDescription:
      'The Fishbone Diagram (Ishikawa or Cause-and-Effect Diagram) is a Step 2 (Analyze) tool that maps all potential causes of a problem across categories. The "head" is the problem, the "bones" are cause categories (typically the 6Ms: Man, Machine, Method, Material, Measurement, Mother Nature). Teams brainstorm causes on sticky notes, cluster them, and vote on the top root causes for further investigation.',
    relatedStep: 2,
    relatedTools: ['fishbone'],
    relatedTerms: ['root-cause-analysis', 'five-why-analysis', 'six-m-categories'],
    category: 'tool',
  },
  {
    term: 'Five-Why Analysis',
    slug: 'five-why-analysis',
    definition:
      'A root cause technique that drills deeper by repeatedly asking "Why?" until reaching an actionable cause.',
    longDescription:
      'The Five-Why Analysis is a Step 2 (Analyze) technique that starts with a symptom and repeatedly asks "Why does this happen?" Each answer reveals a deeper cause. The name suggests five iterations, but the actual number varies — stop when you reach a cause that is actionable and within the team\'s control. Often used after the Fishbone Diagram identifies the top suspected causes.',
    relatedStep: 2,
    relatedTools: ['five-why'],
    relatedTerms: ['root-cause-analysis', 'fishbone-diagram', 'symptom'],
    category: 'tool',
  },
  {
    term: 'Force Field Analysis',
    slug: 'force-field-analysis',
    definition: 'A tool that maps the forces driving change against the forces resisting it.',
    longDescription:
      'Force Field Analysis (developed by Kurt Lewin) is a Step 2 (Analyze) tool that identifies driving forces (pushing toward the desired change) and restraining forces (resisting the change). Each force is rated on a 1-5 scale. The analysis reveals where to focus: strengthen drivers, weaken resistors, or both. It is especially valuable when the solution is known but adoption is the challenge.',
    relatedStep: 2,
    relatedTools: ['force-field'],
    relatedTerms: ['root-cause-analysis', 'change-management', 'driving-forces'],
    category: 'tool',
  },
  {
    term: 'Gap',
    slug: 'gap',
    definition: 'The measurable difference between the As-Is State and the Desired State.',
    longDescription:
      'The Gap is the third component of a PIPS problem statement. It quantifies the difference between where the process is now (As-Is) and where it needs to be (Desired State). The gap should be expressed in concrete terms: percentages, dollars, hours, error counts. A well-defined gap gives the team a clear target and makes it possible to measure whether the improvement succeeded.',
    relatedStep: 1,
    relatedTools: ['problem-statement'],
    relatedTerms: ['as-is-state', 'desired-state', 'problem-statement'],
    category: 'concept',
  },
  {
    term: 'Implementation Plan',
    slug: 'implementation-plan',
    definition:
      'The operational blueprint for executing the selected solution with tasks, owners, and deadlines.',
    longDescription:
      'An Implementation Plan is a Step 4 (Select & Plan) deliverable that transforms the selected solution into a sequence of tasks with owners, deadlines, milestones, dependencies, and risk mitigation. It typically includes phases (pilot, limited rollout, full rollout), a RACI chart, a communication plan, and a rollback strategy. It answers every execution question before the team faces it.',
    relatedStep: 4,
    relatedTools: ['implementation-plan', 'raci', 'milestone-tracker'],
    relatedTerms: ['raci-chart', 'milestone-tracker', 'implementation-checklist'],
    category: 'tool',
  },
  {
    term: 'Kaizen',
    slug: 'kaizen',
    definition:
      'A Japanese philosophy of continuous, incremental improvement involving everyone in the organization.',
    longDescription:
      'Kaizen (Japanese for "change for the better") is a philosophy of continuous, incremental improvement that involves every employee from the CEO to the frontline worker. PIPS shares Kaizen\'s core belief that improvement is everyone\'s job and should be a permanent practice, not a one-time event. PIPS operationalizes this philosophy with a structured 6-step framework.',
    relatedStep: null,
    relatedTools: [],
    relatedTerms: ['continuous-improvement', 'lean', 'pips-cycle'],
    category: 'concept',
  },
  {
    term: 'Lean',
    slug: 'lean',
    definition: 'A methodology focused on eliminating waste and maximizing value in processes.',
    longDescription:
      'Lean is a management philosophy originating from the Toyota Production System. It focuses on identifying and eliminating waste (muda) — any activity that consumes resources without creating value for the customer. PIPS incorporates Lean thinking in its emphasis on data-driven problem identification and its focus on measurable improvement, but packages it in a more accessible framework.',
    relatedStep: null,
    relatedTools: [],
    relatedTerms: ['continuous-improvement', 'kaizen', 'six-sigma', 'waste'],
    category: 'concept',
  },
  {
    term: 'Lessons Learned',
    slug: 'lessons-learned',
    definition:
      'A structured document capturing what went well, what did not, and what to do differently next time.',
    longDescription:
      'Lessons Learned is a Step 6 (Evaluate) deliverable that captures the team\'s reflections through a structured retrospective. Each lesson includes: the situation, what happened, what was learned, and the recommended action for the future. Lessons learned feed directly into the next PIPS cycle, creating the "Close The Loop" mechanism that compounds organizational learning over time.',
    relatedStep: 6,
    relatedTools: ['lessons-learned'],
    relatedTerms: ['close-the-loop', 'evaluation-summary', 'retrospective'],
    category: 'tool',
  },
  {
    term: 'Milestone Tracker',
    slug: 'milestone-tracker',
    definition: 'A progress monitoring tool that compares planned vs. actual milestone dates.',
    longDescription:
      'A Milestone Tracker is a Step 5 (Implement) tool that records key project checkpoints with their planned dates, actual completion dates, status (on track, at risk, late), and notes. It provides a high-level view of project progress for both the team and stakeholders. When milestones are missed, the tracker forces the conversation about why and how to adjust.',
    relatedStep: 5,
    relatedTools: ['milestone-tracker'],
    relatedTerms: ['implementation-plan', 'implementation-checklist'],
    category: 'tool',
  },
  {
    term: 'PIPS Cycle',
    slug: 'pips-cycle',
    definition:
      'A complete pass through all 6 PIPS steps from problem identification to evaluation.',
    longDescription:
      'A PIPS Cycle is one complete iteration through the 6 steps: Identify, Analyze, Generate, Select & Plan, Implement, and Evaluate. The evaluation in Step 6 determines the next action: standardize the improvement, iterate with another cycle on remaining gaps, or start an entirely new cycle on a different problem. Multiple cycles compound over time to produce significant organizational improvement.',
    relatedStep: null,
    relatedTools: [],
    relatedTerms: ['continuous-improvement', 'close-the-loop'],
    category: 'methodology',
  },
  {
    term: 'Problem Statement',
    slug: 'problem-statement',
    definition:
      'A clear, measurable description of As-Is state, Desired State, and the gap between them.',
    longDescription:
      'A Problem Statement is the foundational deliverable of Step 1 (Identify). It consists of three parts: the current state (As-Is), the desired state, and the measurable gap. A well-written problem statement is specific, measurable, free of blame, and does not contain assumed solutions. It ensures the entire team agrees on what they are solving before any analysis or solution generation begins.',
    relatedStep: 1,
    relatedTools: ['problem-statement'],
    relatedTerms: ['as-is-state', 'desired-state', 'gap', 'smart-criteria'],
    category: 'tool',
  },
  {
    term: 'RACI Chart',
    slug: 'raci-chart',
    definition:
      'A responsibility matrix defining who is Responsible, Accountable, Consulted, and Informed for each task.',
    longDescription:
      'A RACI Chart is a Step 4 (Select & Plan) tool that assigns clear ownership for every task in the implementation plan. R = Responsible (does the work), A = Accountable (owns the outcome, exactly one per task), C = Consulted (provides input before the decision), I = Informed (notified after the decision). It eliminates the ambiguity that kills projects: "I thought you were doing that."',
    relatedStep: 4,
    relatedTools: ['raci'],
    relatedTerms: ['implementation-plan', 'accountability'],
    category: 'tool',
  },
  {
    term: 'Retrospective',
    slug: 'retrospective',
    definition:
      'A structured team reflection on what went well, what to improve, and what actions to take.',
    longDescription:
      'A Retrospective is a facilitated session in Step 6 (Evaluate) where the team reflects on the improvement project. Each member writes responses to three prompts: What went well? What could be improved? What specific action should we take? Responses are shared, clustered by theme, and discussed. The output feeds into the Lessons Learned document and informs future PIPS cycles.',
    relatedStep: 6,
    relatedTools: ['lessons-learned', 'evaluation'],
    relatedTerms: ['lessons-learned', 'close-the-loop', 'evaluation-summary'],
    category: 'concept',
  },
  {
    term: 'Root Cause Analysis',
    slug: 'root-cause-analysis',
    definition:
      'The systematic process of identifying the underlying causes of a problem, not just its symptoms.',
    longDescription:
      'Root Cause Analysis is the central activity of Step 2 (Analyze). It uses structured tools — Fishbone Diagrams, Five-Why Analysis, Force Field Analysis, and Check Sheets — to move past surface symptoms and identify the real drivers of a problem. The distinction between symptoms and root causes is critical: treating a symptom provides temporary relief, but the problem recurs. Treating the root cause resolves the problem permanently.',
    relatedStep: 2,
    relatedTools: ['fishbone', 'five-why', 'force-field', 'checksheet'],
    relatedTerms: ['fishbone-diagram', 'five-why-analysis', 'symptom'],
    category: 'concept',
  },
  {
    term: 'Six Sigma',
    slug: 'six-sigma',
    definition: 'A data-driven methodology for reducing defects and variation in processes.',
    longDescription:
      "Six Sigma is a quality methodology developed at Motorola and popularized by GE. It uses statistical methods to reduce process variation and defects to near-zero levels (3.4 defects per million opportunities). PIPS draws on Six Sigma's emphasis on data and measurement but does not require the statistical expertise or certification structure. PIPS is designed to be accessible to teams without specialized training.",
    relatedStep: null,
    relatedTools: [],
    relatedTerms: ['lean', 'continuous-improvement', 'data-over-opinions'],
    category: 'concept',
  },
  {
    term: 'SMART Criteria',
    slug: 'smart-criteria',
    definition:
      'A framework for writing effective goals: Specific, Measurable, Achievable, Relevant, Time-bound.',
    longDescription:
      "SMART Criteria is a framework used in Step 1 (Identify) to ensure problem statements and improvement targets are well-defined. Specific: clearly defined, not vague. Measurable: quantifiable with data. Achievable: within the team's capability. Relevant: aligned with organizational priorities. Time-bound: has a target date. PIPS applies SMART criteria to both the problem statement and the improvement target.",
    relatedStep: 1,
    relatedTools: ['problem-statement'],
    relatedTerms: ['problem-statement', 'as-is-state', 'desired-state'],
    category: 'concept',
  },
  {
    term: 'Symptom',
    slug: 'symptom',
    definition:
      'A visible effect of a problem that recurs if only the symptom is treated, not the root cause.',
    longDescription:
      'A symptom is what you observe on the surface — the error message, the customer complaint, the missed deadline. It is the effect, not the cause. One of the most common process improvement mistakes is treating symptoms as if they were root causes. PIPS Step 2 (Analyze) explicitly distinguishes between symptoms and root causes, ensuring teams dig deep enough to find causes they can act on.',
    relatedStep: 2,
    relatedTools: ['fishbone', 'five-why'],
    relatedTerms: ['root-cause-analysis', 'five-why-analysis', 'fishbone-diagram'],
    category: 'concept',
  },
]

/** Get all unique first letters for the alphabetical index */
export const getGlossaryLetters = (): string[] => {
  const letters = new Set(GLOSSARY_TERMS.map((t) => t.term[0]!.toUpperCase()))
  return Array.from(letters).sort()
}

/** Get terms grouped by first letter */
export const getTermsByLetter = (): Record<string, GlossaryTerm[]> => {
  const grouped: Record<string, GlossaryTerm[]> = {}
  for (const term of GLOSSARY_TERMS) {
    const letter = term.term[0]!.toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(term)
  }
  // Sort terms within each letter
  for (const letter of Object.keys(grouped)) {
    grouped[letter]!.sort((a, b) => a.term.localeCompare(b.term))
  }
  return grouped
}

/** Find a term by slug */
export const findTermBySlug = (slug: string): GlossaryTerm | null => {
  return GLOSSARY_TERMS.find((t) => t.slug === slug) ?? null
}
