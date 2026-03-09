/**
 * PIPS Interactive Guide — Rich Content Data Layer
 *
 * Provides all content for the interactive methodology guide:
 * step-by-step guidance, philosophy, roles, glossary, and onboarding.
 */

import type { PipsStepNumber } from './constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DiagramType =
  | 'problem-framework'
  | 'fishbone'
  | 'diverge-converge'
  | 'flowchart-phases'
  | 'milestone-timeline'
  | 'cycle-return'

export type GuideStepContent = {
  guidingQuestion: string
  whyThisStepMatters: { heading: string; paragraphs: string[] }
  examples: {
    good: { title: string; description: string }
    bad: { title: string; description: string }
  }
  checklist: string[]
  diagramType: DiagramType
  keyInsight: string
  subsections: { title: string; content: string; collapsible?: boolean }[]
}

export type PhilosophyPrinciple = {
  name: string
  description: string
  icon: string
}

export type IterationBracket = {
  label: string
  steps: number[]
  description: string
}

export type GuideRole = {
  title: string
  description: string
  responsibilities: string[]
  icon: string
}

export type GlossaryTerm = {
  term: string
  definition: string
  relatedSteps?: number[]
}

export type GettingStartedStep = {
  step: number
  title: string
  description: string
  duration: string
  tips: string[]
}

// ---------------------------------------------------------------------------
// Step Content — one entry per PIPS step
// ---------------------------------------------------------------------------

export const GUIDE_STEP_CONTENT: Record<PipsStepNumber, GuideStepContent> = {
  1: {
    guidingQuestion: 'What problem are we solving and why does it matter?',
    whyThisStepMatters: {
      heading: 'A Well-Defined Problem Is Half the Solution',
      paragraphs: [
        'Most improvement efforts fail not because of poor solutions, but because teams never properly defined the problem. When a problem statement is vague or biased, the team spends weeks solving the wrong thing — burning budget, eroding trust, and demoralizing participants. Step 1 exists to prevent that costly mistake.',
        'A rigorous problem definition forces the team to separate observation from assumption. By describing the current state (As-Is), the desired state, and the measurable gap between them, you create a shared mental model that aligns every stakeholder. Without this alignment, each person optimizes for their own interpretation of the problem, pulling the project in different directions.',
        'Data anchors the conversation. When you quantify the gap — "cycle time is 14 days versus the 5-day target" or "customer complaints increased 40% quarter-over-quarter" — the problem becomes objective and undeniable. This data-first approach also establishes the baseline you will measure against in Step 6, closing the loop on the entire PIPS cycle.',
        'Finally, scoping matters. A problem that is too broad ("improve quality") cannot be solved in a single cycle; a problem that is too narrow ("fix the Tuesday afternoon label printer jam") may not justify the team effort. Step 1 guides you to a scope that is meaningful, measurable, and within the team\'s sphere of influence.',
      ],
    },
    examples: {
      good: {
        title: 'Specific, Measurable Problem Statement',
        description:
          'As-Is: Average customer onboarding takes 14 business days from signed contract to first login. Desired State: Reduce onboarding to 5 business days or fewer. Gap: 9 business days of excess cycle time. Impact: Each day of delay costs an estimated $2,300 in deferred revenue per customer, totaling roughly $180,000/quarter across 20 new customers.',
      },
      bad: {
        title: 'Vague, Blame-Oriented Statement',
        description:
          '"Onboarding is too slow because the IT team never prioritizes our requests." This statement lacks measurable data, blames a specific group instead of describing the process, provides no baseline or target, and poisons collaboration before the project even begins.',
      },
    },
    checklist: [
      'Draft the As-Is state with specific, observable facts',
      'Define the Desired State with a measurable target',
      'Quantify the gap between As-Is and Desired State',
      'Assess the business impact in dollars, time, or quality metrics',
      "Confirm the problem scope is within the team's sphere of influence",
      'Validate the problem with data from at least two independent sources',
      'Get written agreement from all team members on the problem statement',
      'Identify and document key stakeholders affected by this problem',
    ],
    diagramType: 'problem-framework',
    keyInsight:
      'The team that invests an extra hour defining the problem saves ten hours of rework later. Resist the urge to jump to solutions — diagnosis before prescription.',
    subsections: [
      {
        title: 'Writing a SMART Problem Statement',
        content:
          'Apply the SMART framework to your problem statement: Specific (what exactly is happening?), Measurable (what numbers describe it?), Achievable (can this team solve it?), Relevant (does it matter to the organization?), and Time-bound (when do we need results?). A statement that passes all five criteria is ready for Step 2.',
      },
      {
        title: 'Stakeholder Alignment Techniques',
        content:
          'Before finalizing the problem statement, interview stakeholders at multiple levels. Use a simple template: "In your words, what is the problem? What data supports that? What would success look like?" Synthesize responses to find common ground. If stakeholders disagree on the problem itself, that disagreement IS the first problem to resolve.',
        collapsible: true,
      },
      {
        title: 'Common Pitfalls in Problem Definition',
        content:
          'Watch for these traps: (1) Solution-in-disguise — "We need a new CRM" is a solution, not a problem. (2) Scope creep — trying to solve everything in one cycle. (3) Blame framing — naming individuals or teams as the cause. (4) Assumption-as-fact — treating theories as confirmed root causes before analysis. (5) Metric-free statements — if you cannot measure it, you cannot improve it.',
        collapsible: true,
      },
      {
        title: 'Data Collection Quick-Start',
        content:
          'Start with data you already have: system logs, survey results, financial reports, help desk tickets. Create a simple data summary table with columns for Metric, Current Value, Target Value, and Source. If no data exists, design a quick check sheet (Step 2 tool) to collect observations over 1-2 weeks before finalizing the problem statement.',
        collapsible: true,
      },
    ],
  },

  2: {
    guidingQuestion: 'What are the root causes driving this problem?',
    whyThisStepMatters: {
      heading: 'Treating Symptoms Guarantees the Problem Returns',
      paragraphs: [
        'When a pipe bursts, you can mop the floor all day, but the leak continues until you fix the pipe. Root cause analysis is finding the broken pipe. Without it, organizations pour resources into surface-level fixes that provide temporary relief but never resolve the underlying issue. The problem recurs — often worse than before — and the team loses credibility.',
        'Structured analysis tools like the fishbone diagram, 5-Why technique, and force field analysis exist because human intuition about causes is unreliable. Cognitive biases — recency bias, confirmation bias, anchoring — lead us to blame the most visible factor rather than the most impactful one. These tools override intuition with systematic investigation.',
        'The fishbone diagram maps causes across categories (People, Process, Equipment, Materials, Environment, Management), ensuring no dimension is overlooked. The 5-Why technique drills past surface explanations to actionable root causes. Force field analysis reveals the equilibrium of forces for and against change, highlighting which restraining forces to reduce and which driving forces to strengthen.',
        'Critically, root cause analysis should be validated with data. A suspected cause is a hypothesis until evidence confirms it. Collecting data — even a simple tally over a few days — separates real causes from plausible-sounding theories. This is the "Data Over Opinions" principle in action.',
      ],
    },
    examples: {
      good: {
        title: 'Structured Fishbone with Data Validation',
        description:
          'The team mapped causes of onboarding delays across six categories. Under "Process," they identified three handoffs between departments with no SLA. Under "People," they found the provisioning specialist role had 160% workload. They ran a 5-Why on the top cause: "Why is provisioning overloaded?" → "Because they handle both new accounts and password resets" → "Because there is no self-service password reset" → Root cause: lack of self-service tooling. A two-week tally confirmed password resets consumed 35% of provisioning time.',
      },
      bad: {
        title: 'Gut-Feel Blame Assignment',
        description:
          '"The problem is that IT is understaffed." This skips analysis entirely, assumes a single cause without evidence, frames the problem as a resource issue (which may be a symptom), and provides no actionable path forward. If staffing is truly the cause, structured analysis will surface it with supporting data — no need to assume.',
      },
    },
    checklist: [
      'Review the problem statement from Step 1 with the full team',
      'Complete a fishbone diagram with causes in at least 4 of the 6M categories',
      'Run a 5-Why drill on the top 2-3 suspected root causes',
      'Rate each cause on a 1-5 impact scale with team consensus',
      'Validate the top root causes with quantitative or observational data',
      'Complete a force field analysis identifying driving and restraining forces',
      "Document which causes are within the team's control versus outside it",
    ],
    diagramType: 'fishbone',
    keyInsight:
      'Ask "why" until you reach a cause the team can act on. If the answer is "because physics" or "because of human nature," you have gone one level too deep — step back.',
    subsections: [
      {
        title: 'The 6M Fishbone Categories',
        content:
          'Use these six categories to ensure comprehensive coverage: Man (people, skills, training), Machine (equipment, technology, tools), Method (processes, procedures, policies), Material (inputs, data, supplies), Measurement (metrics, inspection, feedback), and Mother Nature (environment, external factors, market conditions). Not every category will have causes — that is expected.',
      },
      {
        title: 'When to Use Each Analysis Tool',
        content:
          'Start with the fishbone to map the landscape broadly. Use the 5-Why technique to drill into the most impactful causes identified by the fishbone. Apply force field analysis when the problem involves organizational change — it reveals resistance factors that technical analysis misses. Use a check sheet when you need data to validate a suspected cause over time.',
        collapsible: true,
      },
      {
        title: 'Involving the Right People',
        content:
          'Root cause analysis requires diverse perspectives. Include frontline staff who live the process daily — they see causes that managers miss. Include cross-functional representatives from upstream and downstream processes. Avoid having only leadership in the room, as they tend to see the problem from a strategic altitude that misses operational detail.',
        collapsible: true,
      },
    ],
  },

  3: {
    guidingQuestion: 'What are all the possible ways we could solve this?',
    whyThisStepMatters: {
      heading: 'Great Solutions Come From a Wide Field of Options',
      paragraphs: [
        'The biggest threat to innovation is premature convergence — settling on the first reasonable idea before exploring the full possibility space. Research consistently shows that the best solutions rarely appear in the first round of ideas. They emerge when teams push past the obvious to generate 30, 50, or even 100 options, because quantity drives quality in idea generation.',
        'Step 3 embodies the "Expand Then Contract" principle. This step is pure expansion — generating ideas without evaluation, criticism, or feasibility filtering. Evaluation happens later in Step 4. Mixing generation and evaluation in the same session kills creativity: people self-censor to avoid criticism, bold ideas never surface, and the team converges on safe but mediocre solutions.',
        "Structured techniques like brainstorming and brainwriting (6-3-5) level the playing field. In traditional open discussion, extroverts dominate and introverts stay silent. Brainwriting gives every participant equal voice: six people write three ideas in five minutes, then pass their sheets to build on each other's thinking. The result is a diverse pool of ideas that reflects the entire team's knowledge.",
        'Wild ideas are welcome — even encouraged. An impractical idea often contains the seed of a practical innovation. "What if we automated the entire process?" might be unrealistic, but it sparks thinking about which specific steps could be automated at reasonable cost.',
      ],
    },
    examples: {
      good: {
        title: 'Structured Brainwriting Session',
        description:
          'The team ran a 6-3-5 brainwriting session to address onboarding delays. In 30 minutes, six team members generated 108 ideas across five rounds. Ideas ranged from practical ("create a provisioning checklist template") to ambitious ("build a self-service onboarding portal"). After clustering, the team identified 12 distinct themes. No ideas were eliminated — that is Step 4\'s job. The quantity-first approach surfaced the self-service portal concept, which ultimately became the winning solution.',
      },
      bad: {
        title: 'Unstructured Discussion With Immediate Criticism',
        description:
          'The team lead asked "So what should we do?" and one person suggested a new hire. Another said "We tried that, it did not work." A third suggested software, and the manager replied "Too expensive." After 20 minutes, the team had three ideas, two of which were already rejected. The loudest voice in the room picked the surviving option. This is not brainstorming — it is debate disguised as ideation.',
      },
    },
    checklist: [
      'Set explicit ground rules: no criticism, quantity over quality, build on ideas',
      'Run at least one structured idea generation technique (brainstorming or brainwriting)',
      'Set and meet a minimum idea target (e.g., 30+ ideas)',
      'Include all team members, not just vocal participants',
      'Group similar ideas into themes without eliminating any',
      'Record every idea — even wild ones — in a shared document',
      'Resist the urge to evaluate or rank ideas during this step',
      'Consider ideas from outside the industry or adjacent disciplines',
    ],
    diagramType: 'diverge-converge',
    keyInsight:
      'The first ten ideas are obvious. The next ten are interesting. The best ideas often come after the team thinks they have run out — push past the wall.',
    subsections: [
      {
        title: 'Brainwriting 6-3-5 Method',
        content:
          'Six participants each write three ideas on a sheet in five minutes. Sheets rotate to the next person, who reads the existing ideas and adds three more — building on, combining, or sparking new directions. After five rotations, you have up to 108 ideas in 30 minutes. This technique eliminates groupthink, gives introverts equal voice, and generates far more ideas than verbal brainstorming.',
      },
      {
        title: 'Facilitation Tips for Idea Generation',
        content:
          'Create psychological safety by emphasizing that wild ideas are valued. Use round-robin sharing so no one dominates. Set a timer to maintain energy. Play background music to reduce self-consciousness during silent writing. Post all ideas visually on a wall or board so the team can see the growing collection — it builds momentum and sparks connections.',
        collapsible: true,
      },
      {
        title: 'Clustering Ideas Into Themes',
        content:
          'After generation, read each idea aloud and place it on a wall. Group similar ideas into clusters and label each cluster with a theme name. Typical themes might include "technology solutions," "process redesigns," "training and skills," and "organizational changes." Do not discard outlier ideas — they may represent innovative thinking that does not fit neatly into existing categories.',
        collapsible: true,
      },
      {
        title: 'Cross-Pollination From Other Fields',
        content:
          'Ask the team: "How would a hospital solve this? A restaurant? A software startup?" Analogies from unrelated industries often reveal approaches that your industry has never considered. A logistics company improved warehouse picking by studying how Amazon routes packages. A clinic reduced wait times by applying Disney theme park queue management principles.',
        collapsible: true,
      },
    ],
  },

  4: {
    guidingQuestion: 'Which solution best fits our criteria and how will we execute it?',
    whyThisStepMatters: {
      heading: 'Objective Selection Prevents the Loudest Voice From Winning',
      paragraphs: [
        'After the creative expansion of Step 3, Step 4 shifts to convergence — methodically narrowing the field to the best solution and building a concrete plan to implement it. This is where the "Expand Then Contract" principle completes its arc. Without a structured selection process, teams default to authority bias (the boss picks), recency bias (the last idea discussed wins), or politics (the idea with the strongest advocate prevails).',
        'A weighted criteria matrix replaces subjective preference with transparent scoring. The team agrees on evaluation criteria — cost, time to implement, expected impact, risk, sustainability — and assigns weights before seeing the scores. Each solution is scored independently by team members, then scores are averaged and multiplied by weights. The highest total wins, and the rationale is documented for stakeholders.',
        'Planning is equally critical. A brilliant solution with a poor implementation plan fails just as surely as a mediocre solution. The RACI chart clarifies ownership: who is Responsible for doing the work, who is Accountable for the outcome, who must be Consulted for input, and who should be Informed of progress. Without clear ownership, tasks fall through cracks and deadlines slip.',
        'The implementation plan itself works backward from the target date, setting milestones that create natural checkpoints. Each milestone has a clear deliverable, an owner, and a date. Quick wins — low-effort, high-impact items — are scheduled early to build momentum and demonstrate value to skeptical stakeholders.',
      ],
    },
    examples: {
      good: {
        title: 'Criteria Matrix With Weighted Scoring',
        description:
          'The team defined five criteria: Implementation Cost (weight 3), Time to Impact (weight 4), Expected Improvement (weight 5), Risk Level (weight 2), and Sustainability (weight 4). Three shortlisted solutions were scored 1-5 by each team member independently. Solution B — the self-service onboarding portal — scored highest overall (weighted total: 72/90) due to its strong expected improvement and sustainability scores. The team documented why Solution A (quick but not sustainable) and Solution C (high impact but high risk) were not selected.',
      },
      bad: {
        title: 'Decision by Default',
        description:
          'The team spent the meeting debating two options without any evaluation criteria. The senior manager said "Let us just go with Option A, we are running out of time." No scoring, no documentation, no criteria. Six weeks into implementation, the team discovers Option A requires a system migration nobody anticipated. There is no documented rationale to revisit the decision, and the project stalls.',
      },
    },
    checklist: [
      'Define 4-6 evaluation criteria before reviewing solutions',
      'Assign weights to each criterion by team consensus',
      'Score each shortlisted solution independently (avoid groupthink)',
      'Calculate weighted totals and select the top solution',
      'Document the selection rationale for stakeholder communication',
      'Build a RACI chart with exactly one Accountable person per task',
      'Create an implementation plan with milestones, owners, and dates',
      'Identify the top 3-5 risks and document mitigation strategies',
    ],
    diagramType: 'flowchart-phases',
    keyInsight:
      'Weight the criteria before scoring the solutions. If you score first, you unconsciously adjust weights to justify your favorite — this is confirmation bias in action.',
    subsections: [
      {
        title: 'Building a Weighted Criteria Matrix',
        content:
          'List evaluation criteria in rows and solutions in columns. Assign each criterion a weight from 1 (low importance) to 5 (critical). Have each team member independently score every solution 1-5 against each criterion. Average the individual scores, multiply by the weight, and sum the column. The solution with the highest total is the objectively best fit. Display the math transparently so the team trusts the outcome.',
      },
      {
        title: 'RACI Roles Explained',
        content:
          'Responsible: the person who does the work. Accountable: the person who owns the outcome (exactly one per task). Consulted: people whose input is needed before a decision. Informed: people who need to know the outcome but are not involved in the work. Common mistakes: multiple Accountable people (leads to diffusion of responsibility) and no Consulted people (leads to rework when stakeholders are surprised).',
        collapsible: true,
      },
      {
        title: 'Backward Planning From Target Date',
        content:
          'Start with the desired completion date and work backward. Identify the final deliverable, then ask "What must be complete before this?" for each milestone. This reveals dependencies, highlights unrealistic timelines early, and ensures the critical path is visible. Add buffer time (10-20%) for unforeseen issues. Break the plan into phases: pilot, adjust, scale.',
        collapsible: true,
      },
      {
        title: 'Quick Wins to Build Momentum',
        content:
          'Identify 2-3 low-effort, high-impact tasks that can be completed in the first week or two. Quick wins serve three purposes: they demonstrate tangible progress to stakeholders, they build team confidence, and they often remove small blockers that make subsequent work easier. Schedule quick wins at the front of the implementation plan.',
        collapsible: true,
      },
    ],
  },

  5: {
    guidingQuestion: 'Are we executing the plan effectively and addressing issues as they arise?',
    whyThisStepMatters: {
      heading: 'Plans Do Not Survive Contact With Reality — Execution Requires Active Management',
      paragraphs: [
        'A plan is a map, not the territory. Step 5 is where the team navigates the actual terrain — encountering obstacles, making adjustments, and driving toward milestones. The difference between successful and failed implementations is not the quality of the plan but the discipline of execution: tracking progress, surfacing blockers early, and communicating proactively.',
        'Milestone tracking provides the heartbeat of implementation. Instead of waiting until the deadline to discover the project is off track, milestones create regular checkpoints. When a milestone is missed, the team investigates immediately — is it a resource issue, a dependency failure, or a scope change? Early detection means small course corrections instead of crisis-mode recovery.',
        'Communication is the most underestimated execution skill. Stakeholders who are not informed become anxious, then resistant, then obstructive. A brief weekly update — what was accomplished, what is next, what needs help — prevents surprise and maintains organizational support. Change management checklists ensure that the people affected by the improvement are trained, informed, and supported through the transition.',
        'The implementation phase also generates invaluable data for Step 6. Every deviation from the plan, every unexpected blocker, every adaptation the team makes — these are the raw material for lessons learned. Documenting them in real time, while memories are fresh, is far more reliable than trying to reconstruct events weeks later during the evaluation workshop.',
      ],
    },
    examples: {
      good: {
        title: 'Disciplined Milestone Tracking With Early Escalation',
        description:
          'The team set four milestones over eight weeks: (1) self-service portal wireframes approved by Week 2, (2) development complete by Week 5, (3) pilot launch with 10 customers by Week 6, (4) full rollout by Week 8. At the Week 2 check-in, wireframes were approved on schedule. At Week 4, the developer flagged a two-day delay due to an API integration issue. The project lead escalated to IT, secured a workaround in 24 hours, and the project stayed on track. Deviations were logged in the issue tracker for the Step 6 retrospective.',
      },
      bad: {
        title: 'Set-and-Forget Plan Execution',
        description:
          'The team created a detailed implementation plan in Step 4, then did not check progress for six weeks. When the project lead finally asked for a status update, two of four milestones had been missed. The developer had been waiting on credentials from IT for three weeks but never escalated. The project was six weeks behind with no documentation of what went wrong. The evaluation in Step 6 had nothing to analyze.',
      },
    },
    checklist: [
      'Kick off implementation with a launch meeting confirming roles and timeline',
      'Set up a regular check-in cadence (weekly stand-ups recommended)',
      'Track each milestone with status, owner, and completion date',
      'Establish an escalation path for blockers before they occur',
      'Communicate progress to stakeholders at least weekly',
      'Run a pilot with a small group before full rollout when possible',
      'Document all deviations from the plan and their reasons',
      'Update the risk register at each check-in',
    ],
    diagramType: 'milestone-timeline',
    keyInsight:
      'A blocker that is escalated within 24 hours is a minor inconvenience. A blocker that festers for three weeks becomes a project-killing crisis. Speed of escalation is everything.',
    subsections: [
      {
        title: 'Running Effective Stand-Ups',
        content:
          'Keep stand-ups to 15 minutes maximum. Each owner answers three questions: What did I complete since last check-in? What am I working on next? What is blocking me? The facilitator logs blockers in real time and assigns follow-up owners. Stand-ups are status syncs, not problem-solving sessions — take detailed discussions offline.',
      },
      {
        title: 'Change Management Essentials',
        content:
          'People resist change they do not understand. Before rollout, complete these change management steps: identify who is affected, communicate why the change is happening (link back to the problem from Step 1), provide training on new processes or tools, assign a point of contact for questions, and schedule a feedback session two weeks after rollout.',
        collapsible: true,
      },
      {
        title: 'Pilot Before You Scale',
        content:
          'A pilot tests your solution with a small, controlled group before full deployment. Choose a representative group (not the most enthusiastic early adopters — they will tolerate rough edges that others will not). Define pilot success criteria in advance. Collect structured feedback through a brief survey and debrief session. Fix critical issues before scaling to the full population.',
        collapsible: true,
      },
    ],
  },

  6: {
    guidingQuestion: 'Did we achieve our goal, and what did we learn for next time?',
    whyThisStepMatters: {
      heading: 'Measurement Closes the Loop — Without It, Improvement Is Just Guessing',
      paragraphs: [
        'Step 6 is where the PIPS cycle comes full circle. The problem defined in Step 1, the causes identified in Step 2, the solutions generated in Step 3, the plan built in Step 4, and the execution managed in Step 5 — all of it culminates in a single question: did it work? The answer must come from data, not opinion. This is the "Close The Loop" principle in its purest form.',
        'The before-and-after comparison is the centerpiece of evaluation. Using the same metrics established in Step 1, the team compares baseline values to post-implementation results. Did onboarding time drop from 14 days to 5? Did customer complaints decrease by 40%? If the targets were met, the improvement is validated. If not, the gap between actual and target becomes the input for the next PIPS cycle.',
        'Lessons learned are the compound interest of continuous improvement. Each cycle teaches the team something about their organization, their processes, and their approach to problem-solving. Teams that capture and share these insights get better with every cycle. Teams that skip this step repeat the same mistakes. A structured retrospective — what went well, what to improve, what to do differently — ensures that insights are captured while they are fresh.',
        'The final decision is a fork in the road: standardize (the improvement worked, make it permanent), iterate (partial success, run another cycle to close the remaining gap), or pivot (the approach was wrong, start a new PIPS cycle with a revised problem statement). This decision should be made deliberately by the team, not by default.',
      ],
    },
    examples: {
      good: {
        title: 'Data-Driven Before-and-After With Lessons Learned',
        description:
          'The team presented a before/after comparison: onboarding time dropped from 14 days (baseline) to 4.5 days (actual), exceeding the 5-day target. Customer satisfaction scores for onboarding improved from 3.1 to 4.4 out of 5. The retrospective surfaced three key lessons: (1) involving IT early saved weeks of integration delays, (2) the pilot phase caught a permissions bug that would have affected 200 customers, (3) weekly stakeholder updates prevented two potential escalations. The team decided to standardize the self-service portal and start a new PIPS cycle targeting the next bottleneck: contract-to-kickoff handoff time.',
      },
      bad: {
        title: 'Skipped Evaluation and Moved On',
        description:
          'After implementing the solution, the project lead declared "It seems to be working" in an email and disbanded the team. No metrics were compared, no retrospective was held, and no lessons were documented. Three months later, onboarding times crept back up because the new process was never formally standardized. A new team was assembled to "fix onboarding" — essentially restarting from scratch because no institutional knowledge was captured.',
      },
    },
    checklist: [
      'Collect post-implementation data on the same metrics defined in Step 1',
      'Create a before-and-after comparison table with baseline, target, and actual values',
      'Calculate percentage improvement for each metric',
      'Run a structured retrospective: what went well, what to improve, what to do differently',
      'Document lessons learned and share with the broader organization',
      'Assess sustainability: will the improvement hold without active management?',
      'Make an explicit decision: standardize, iterate, or start a new PIPS cycle',
    ],
    diagramType: 'cycle-return',
    keyInsight:
      'An improvement project that does not measure its results is indistinguishable from one that failed. Measurement is not optional — it is the entire point.',
    subsections: [
      {
        title: 'Building the Before-and-After Table',
        content:
          'Create a table with these columns: Metric Name, Baseline Value (from Step 1), Target Value (from Step 1), Actual Value (measured now), Percent Change, and Status (met/not met). Include both primary metrics (directly related to the problem) and secondary metrics (related outcomes you want to monitor for unintended effects). Present this table as the first agenda item in the evaluation workshop.',
      },
      {
        title: 'Running a Structured Retrospective',
        content:
          'Give each participant sticky notes in three colors: green (what went well), yellow (what could improve), red (what to do differently). Allow five minutes of silent writing. Share one note at a time in round-robin fashion and cluster similar themes. Vote on the top insights to carry forward. The output is a concise list of lessons that future teams can reference.',
        collapsible: true,
      },
      {
        title: 'Standardize, Iterate, or Pivot',
        content:
          'Standardize when targets are fully met and the improvement is sustainable without active management — document the new process, update training materials, and close the project. Iterate when partial improvement was achieved but the gap remains — refine the solution and run another cycle. Pivot when the approach fundamentally missed the mark — return to Step 1 with revised understanding and start fresh.',
        collapsible: true,
      },
      {
        title: 'Sharing Results Across the Organization',
        content:
          "Publish a one-page summary: problem statement, solution implemented, results achieved, and key lessons. Present at a team meeting or all-hands. Share in the organization's knowledge repository. This transparency builds a culture of continuous improvement, inspires other teams to run their own PIPS cycles, and creates institutional memory that compounds over time.",
        collapsible: true,
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// PIPS Philosophy
// ---------------------------------------------------------------------------

export const PIPS_PHILOSOPHY: {
  title: string
  paragraphs: string[]
  principles: PhilosophyPrinciple[]
} = {
  title: 'The PIPS Philosophy',
  paragraphs: [
    'PIPS is built on the conviction that every organization — regardless of size, industry, or maturity — can systematically improve its processes when equipped with the right framework. Continuous improvement is not a one-time initiative or a consultant-driven program; it is a cultural capability that compounds over time. The organizations that thrive are those that make improvement a habit, not an event.',
    'At its core, PIPS rejects the notion that problem-solving is an art practiced only by experts. It is a discipline — a repeatable, teachable set of skills that any team can learn. The six-step structure provides guardrails that prevent common failure modes: jumping to solutions before understanding the problem, selecting ideas based on politics rather than evidence, and declaring victory without measuring results.',
    'Three principles underpin every PIPS cycle. They are simple to state but challenging to practice consistently. Teams that internalize these principles find that their improvement cycles become faster, more effective, and more rewarding with each iteration.',
  ],
  principles: [
    {
      name: 'Data Over Opinions',
      description:
        'Every assertion about a problem, cause, or solution must be grounded in observable evidence. Data does not mean complex analytics — a simple tally sheet, a customer complaint log, or a process timing study counts. The goal is to replace "I think" and "I feel" with "the data shows." When opinions conflict, data resolves the debate. When data is unavailable, the team\'s first action is to collect it.',
      icon: 'bar-chart',
    },
    {
      name: 'Expand Then Contract',
      description:
        'Creative thinking and critical thinking are both essential, but they must happen separately. First expand: generate ideas broadly without judgment (Step 3). Then contract: evaluate and select using objective criteria (Step 4). Mixing these modes in the same session kills creativity — people self-censor to avoid criticism, and the team converges on the first acceptable idea rather than the best possible one.',
      icon: 'arrows-expand',
    },
    {
      name: 'Close The Loop',
      description:
        'Every improvement cycle must end with measurement and reflection (Step 6). Did the change achieve the target defined in Step 1? What lessons did the team learn? Should the team standardize, iterate, or pivot? Without closing the loop, organizations accumulate half-finished initiatives, unmeasured experiments, and institutional amnesia. Closing the loop transforms isolated projects into a compounding learning system.',
      icon: 'refresh-cw',
    },
  ],
}

// ---------------------------------------------------------------------------
// Iteration Info — Non-Linear Nature of PIPS
// ---------------------------------------------------------------------------

export const PIPS_ITERATION_INFO: {
  description: string
  brackets: IterationBracket[]
} = {
  description:
    'While the six steps are numbered sequentially, real improvement work is not strictly linear. Teams frequently loop back to earlier steps as new information emerges. A root cause discovered in Step 2 may require refining the problem statement in Step 1. A solution selected in Step 4 may reveal gaps that send the team back to Step 3 for more ideas. This is expected and healthy — it means the team is learning. The three brackets below describe how the steps naturally cluster in practice.',
  brackets: [
    {
      label: 'Foundation',
      steps: [1, 2],
      description:
        'Steps 1 and 2 form the diagnostic foundation. The team defines the problem and identifies root causes. These steps often iterate together — a well-defined problem leads to sharper analysis, and deeper analysis sometimes reveals that the problem needs reframing. Teams should expect to cycle between Steps 1 and 2 at least once before moving forward.',
    },
    {
      label: 'Development',
      steps: [3, 4],
      description:
        'Steps 3 and 4 form the solution development bracket. Step 3 generates a wide field of options; Step 4 narrows them to the best solution and builds the implementation plan. If the criteria matrix reveals that no solution adequately addresses the root causes, the team loops back to Step 3 to generate additional ideas. This bracket embodies the Expand Then Contract principle.',
    },
    {
      label: 'Closure',
      steps: [5, 6],
      description:
        'Steps 5 and 6 form the execution and learning bracket. Step 5 implements the plan; Step 6 evaluates the results. If evaluation shows the target was not met, the team decides whether to iterate (refine the current solution and cycle through Steps 3-6 again) or pivot (return to Step 1 with new understanding). This bracket embodies the Close The Loop principle and feeds the next improvement cycle.',
    },
  ],
}

// ---------------------------------------------------------------------------
// Guide Roles
// ---------------------------------------------------------------------------

export const GUIDE_ROLES: GuideRole[] = [
  {
    title: 'Leader',
    description:
      'The project sponsor who champions the improvement initiative, secures resources, removes organizational barriers, and ensures the team has the authority to act on their recommendations.',
    responsibilities: [
      'Define the strategic importance of the improvement project',
      'Secure budget, time, and personnel for the team',
      'Remove organizational barriers and escalate blockers',
      'Communicate progress and results to senior leadership',
      'Ensure recommendations are implemented, not shelved',
    ],
    icon: 'shield',
  },
  {
    title: 'Process Guide',
    description:
      'The methodology expert who ensures the team follows the PIPS framework correctly. They facilitate workshops, select the right tools for each step, and keep the team focused on the methodology without being prescriptive about the content.',
    responsibilities: [
      'Facilitate workshops and guide the team through each PIPS step',
      'Select and explain the appropriate tools for each session',
      'Keep discussions focused and productive',
      'Ensure all voices are heard and no one dominates',
      'Coach the team on PIPS principles and best practices',
    ],
    icon: 'compass',
  },
  {
    title: 'Scribe',
    description:
      'The team member who captures all ideas, decisions, and action items in real time. Accurate documentation ensures nothing is lost and provides the raw material for Step 6 lessons learned.',
    responsibilities: [
      'Record all ideas during brainstorming and brainwriting sessions',
      'Document decisions, rationale, and dissenting viewpoints',
      'Maintain the project log with action items and owners',
      'Distribute meeting notes within 24 hours of each session',
      'Organize documentation for the evaluation in Step 6',
    ],
    icon: 'edit-3',
  },
  {
    title: 'Timekeeper',
    description:
      'The team member who manages session timing, ensures agenda items receive appropriate attention, and prevents the team from spending disproportionate time on any single discussion.',
    responsibilities: [
      'Track time during workshops and alert the team at transition points',
      'Ensure each agenda item receives its allocated time',
      'Flag when discussions are running over and facilitate parking lot decisions',
      'Coordinate scheduling for upcoming sessions',
      'Help the Process Guide pace activities to maintain energy',
    ],
    icon: 'clock',
  },
  {
    title: 'Presenter',
    description:
      "The team member who communicates the team's findings, recommendations, and results to stakeholders. They translate technical analysis into clear, compelling narratives for diverse audiences.",
    responsibilities: [
      'Prepare and deliver presentations at milestone checkpoints',
      'Translate analytical findings into stakeholder-friendly language',
      'Represent the team in leadership briefings and reviews',
      'Gather stakeholder feedback and relay it back to the team',
      'Present the final evaluation results and lessons learned',
    ],
    icon: 'mic',
  },
  {
    title: 'Facilitator',
    description:
      'The neutral party who manages group dynamics, ensures psychological safety, and enables productive collaboration. Often overlaps with the Process Guide role but focuses specifically on interpersonal dynamics.',
    responsibilities: [
      'Create a psychologically safe environment for open discussion',
      'Manage dominant personalities and draw out quieter participants',
      'Mediate conflicts and redirect unproductive debates',
      'Use structured techniques to prevent groupthink',
      'Monitor team energy and adjust session pace accordingly',
    ],
    icon: 'users',
  },
]

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'PIPS',
    definition:
      'Process Improvement Problem Solving — a six-step methodology for identifying, analyzing, and resolving process problems through structured teamwork and data-driven decision making.',
    relatedSteps: [1, 2, 3, 4, 5, 6],
  },
  {
    term: 'Problem Statement',
    definition:
      'A clear, measurable description of the gap between the current state (As-Is) and the desired state. Includes quantified impact and is free of blame or embedded solutions.',
    relatedSteps: [1],
  },
  {
    term: 'As-Is State',
    definition:
      'The current, observable condition of a process before any improvement intervention. Described with data and facts, not opinions.',
    relatedSteps: [1],
  },
  {
    term: 'Desired State',
    definition:
      'The target condition the team aims to achieve through the improvement effort. Must be specific, measurable, and achievable within the project scope.',
    relatedSteps: [1],
  },
  {
    term: 'Root Cause',
    definition:
      'The fundamental reason a problem exists. Addressing the root cause eliminates the problem; addressing symptoms only provides temporary relief.',
    relatedSteps: [2],
  },
  {
    term: 'Fishbone Diagram',
    definition:
      'A cause-and-effect analysis tool (also called Ishikawa diagram) that maps potential causes across six categories: Man, Machine, Method, Material, Measurement, and Mother Nature.',
    relatedSteps: [2],
  },
  {
    term: '5-Why Analysis',
    definition:
      'A root cause technique that repeatedly asks "why" (typically five times) to drill past symptoms to the underlying cause the team can act on.',
    relatedSteps: [2],
  },
  {
    term: 'Force Field Analysis',
    definition:
      'A tool that maps the driving forces (pushing toward change) and restraining forces (resisting change) to identify which forces to strengthen or weaken.',
    relatedSteps: [2],
  },
  {
    term: 'Check Sheet',
    definition:
      'A structured tally form used to collect and quantify data by category over defined time periods. Provides evidence to validate or refute suspected causes.',
    relatedSteps: [2],
  },
  {
    term: 'Brainstorming',
    definition:
      'A group idea generation technique where participants freely suggest solutions without criticism. Emphasizes quantity over quality to maximize the solution space.',
    relatedSteps: [3],
  },
  {
    term: 'Brainwriting (6-3-5)',
    definition:
      'A silent, written idea generation method where six participants write three ideas in five minutes, then pass their sheets. Produces up to 108 ideas in 30 minutes while ensuring equal participation.',
    relatedSteps: [3],
  },
  {
    term: 'Criteria Matrix',
    definition:
      'A decision tool that scores solutions against weighted evaluation criteria. Each criterion is assigned an importance weight, and solutions are scored independently to produce an objective ranking.',
    relatedSteps: [4],
  },
  {
    term: 'Paired Comparisons',
    definition:
      'A prioritization technique that compares every option against every other option in pairs, producing a forced ranking without the ambiguity of group voting.',
    relatedSteps: [4],
  },
  {
    term: 'Weighted Voting',
    definition:
      'A group prioritization method where each participant distributes a fixed number of votes across options. Items with the most total votes are prioritized.',
    relatedSteps: [1, 4],
  },
  {
    term: 'RACI Chart',
    definition:
      'A responsibility assignment matrix defining who is Responsible (does the work), Accountable (owns the outcome), Consulted (provides input), and Informed (notified of progress) for each task.',
    relatedSteps: [4],
  },
  {
    term: 'Implementation Plan',
    definition:
      'A detailed roadmap specifying tasks, owners, milestones, dependencies, target dates, and risk mitigation strategies for executing the selected solution.',
    relatedSteps: [4, 5],
  },
  {
    term: 'Milestone',
    definition:
      'A significant checkpoint in the implementation plan that marks the completion of a phase or deliverable. Used to track progress and trigger reviews.',
    relatedSteps: [5],
  },
  {
    term: 'Milestone Tracker',
    definition:
      'A visual tool that displays planned versus actual completion dates for each milestone, making schedule performance immediately visible to the team.',
    relatedSteps: [5],
  },
  {
    term: 'Before & After Comparison',
    definition:
      'A table comparing baseline metrics (from Step 1) with post-implementation results (from Step 6) to quantify the improvement achieved.',
    relatedSteps: [1, 6],
  },
  {
    term: 'Lessons Learned',
    definition:
      'A structured capture of what went well, what could improve, and what to do differently. Created during Step 6 and shared with the organization to compound improvement knowledge.',
    relatedSteps: [6],
  },
  {
    term: 'Balance Sheet',
    definition:
      'A decision tool that lists gains on one side and losses or costs on the other, helping the team weigh the overall value of the improvement against its investment.',
    relatedSteps: [4, 6],
  },
  {
    term: 'Continuous Improvement',
    definition:
      'The organizational philosophy that processes can always be made better through ongoing, incremental cycles of problem identification, analysis, and resolution. PIPS is one framework for practicing continuous improvement.',
    relatedSteps: [1, 2, 3, 4, 5, 6],
  },
  {
    term: 'Stakeholder',
    definition:
      'Any person or group affected by or able to influence the improvement project. Includes process owners, customers, leadership, and frontline staff who work within the process.',
    relatedSteps: [1, 4, 5],
  },
  {
    term: 'KPI (Key Performance Indicator)',
    definition:
      'A quantifiable measure used to evaluate the success of the improvement effort. KPIs are defined in Step 1 and measured in Step 6 to close the loop.',
    relatedSteps: [1, 6],
  },
  {
    term: 'Baseline',
    definition:
      'The starting measurement of a metric before any improvement intervention. Establishes the reference point against which all improvement is measured.',
    relatedSteps: [1, 6],
  },
  {
    term: 'Scope',
    definition:
      'The defined boundary of the improvement project — what is included and what is excluded. Proper scoping prevents the team from trying to solve everything in one cycle.',
    relatedSteps: [1],
  },
  {
    term: 'Quick Win',
    definition:
      'A low-effort, high-impact improvement that can be implemented early in the plan to build momentum, demonstrate value, and maintain stakeholder support.',
    relatedSteps: [4, 5],
  },
  {
    term: 'Escalation Path',
    definition:
      'A predefined chain of communication for resolving blockers that the team cannot address on their own. Established during planning and activated during implementation.',
    relatedSteps: [4, 5],
  },
  {
    term: 'Retrospective',
    definition:
      'A structured team reflection session held during Step 6 that examines what went well, what could improve, and what actions to take in future cycles.',
    relatedSteps: [6],
  },
  {
    term: 'Facilitation',
    definition:
      'The practice of guiding a group through structured activities to achieve productive outcomes. Includes managing time, ensuring participation, and maintaining psychological safety.',
    relatedSteps: [1, 2, 3, 4, 5, 6],
  },
]

// ---------------------------------------------------------------------------
// Getting Started — Onboarding Steps
// ---------------------------------------------------------------------------

export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    step: 1,
    title: 'Assemble Your Team',
    description:
      'Identify 4-8 team members who represent different perspectives on the process you want to improve. Include frontline staff, process owners, and at least one person from a downstream function affected by the process.',
    duration: '1-2 days',
    tips: [
      'Aim for diversity of perspective, not just seniority',
      'Include someone who is skeptical — they will ask the hard questions',
      'Secure a time commitment from each member before starting',
      'Assign roles (Leader, Process Guide, Scribe, Timekeeper) upfront',
    ],
  },
  {
    step: 2,
    title: 'Choose Your Problem',
    description:
      "Select a process problem that is meaningful enough to justify team effort but scoped tightly enough to resolve in one PIPS cycle (typically 6-12 weeks). The problem should be within the team's sphere of influence.",
    duration: '1-3 days',
    tips: [
      'Start with a problem the team already feels — motivation drives execution',
      'Avoid problems that require organizational restructuring for your first cycle',
      'If unsure, use weighted voting to prioritize among candidate problems',
      'Confirm the problem has available data or that data can be collected quickly',
    ],
  },
  {
    step: 3,
    title: 'Set Up Your Project',
    description:
      'Create a new PIPS project in the application. Add team members, assign roles, and set a target completion date. This becomes the central hub for all artifacts, discussions, and progress tracking throughout the cycle.',
    duration: '30 minutes',
    tips: [
      'Use a descriptive project name that reflects the problem, not the solution',
      'Set a realistic target date — first-time teams typically need 8-12 weeks',
      'Invite all team members so they can access project artifacts immediately',
      'Bookmark the project for quick access from your dashboard',
    ],
  },
  {
    step: 4,
    title: 'Learn the Methodology',
    description:
      'Walk through the interactive guide for each of the six steps before starting. Understanding the full journey helps the team appreciate why each step matters and prevents the temptation to skip ahead to solutions.',
    duration: '1-2 hours',
    tips: [
      'Have the entire team review the guide, not just the Process Guide',
      'Pay special attention to the "Why This Step Matters" sections',
      'Discuss the three PIPS principles as a team — Data Over Opinions, Expand Then Contract, Close The Loop',
      'Reference the glossary when encountering unfamiliar terms',
    ],
  },
  {
    step: 5,
    title: 'Schedule Your Sessions',
    description:
      'Block time for the key workshops: Step 1 problem definition (60 min), Step 2 root cause analysis (90 min), Step 3 idea generation (60 min), Step 4 selection and planning (120 min). Steps 5 and 6 run as ongoing check-ins.',
    duration: '30 minutes',
    tips: [
      'Schedule sessions 1-2 weeks apart to allow for data collection between steps',
      'Book a room with whiteboard space or ensure all participants have digital collaboration tools',
      'Send pre-read materials 2-3 days before each session',
      'Protect session time fiercely — rescheduling kills momentum',
    ],
  },
  {
    step: 6,
    title: 'Run Step 1 and Build Momentum',
    description:
      'Facilitate your first workshop: define the problem statement using the Step 1 guide. A successful first session sets the tone for the entire cycle. Focus on creating a clear, data-backed problem statement the whole team agrees on.',
    duration: '60 minutes',
    tips: [
      'Start with individual silent writing before group discussion',
      'Use the Step 1 checklist to confirm completeness',
      'End with explicit team agreement on the problem statement',
      'Celebrate completing Step 1 — the hardest part is starting',
    ],
  },
  {
    step: 7,
    title: 'Iterate Through the Remaining Steps',
    description:
      'Work through Steps 2-6 using the guide, tools, and checklists for each step. Remember that backtracking is expected — if new information in Step 2 changes your understanding of the problem, update Step 1. The guide will prompt you at each transition.',
    duration: '6-12 weeks total',
    tips: [
      'Use the step checklists to confirm readiness before advancing',
      'Document everything in the project — future you will thank current you',
      'Check in with stakeholders at Steps 2, 4, and 6 at minimum',
      'After Step 6, decide as a team: standardize, iterate, or start a new cycle',
    ],
  },
]
