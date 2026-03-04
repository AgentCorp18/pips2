type ToolStep = {
  title: string
  description: string
}

type ToolExample = {
  scenario: string
  walkthrough: string
}

type ToolDetail = {
  seoDescription: string
  whatItIs: string
  whenToUse: string[]
  steps: ToolStep[]
  example: ToolExample
  proTips: string[]
}

export const TOOL_DETAILS: Record<string, ToolDetail> = {
  'problem-statement': {
    seoDescription:
      'Learn how to write clear, measurable problem statements using the PIPS methodology. Define the As-Is state, desired state, and gap with data-driven precision.',
    whatItIs:
      'A Problem Statement is the foundation of every PIPS improvement project. It describes three things: the current state (As-Is), the desired state, and the measurable gap between them. A well-crafted problem statement is specific, measurable, and free of blame or assumed solutions. It grounds the team in shared reality before anyone proposes a fix.',
    whenToUse: [
      'At the start of every PIPS project — Step 1 always begins here',
      'When a team senses a problem but has not yet defined it precisely',
      'When stakeholders disagree about what the real issue is',
      'When you need to justify an improvement effort with data',
    ],
    steps: [
      {
        title: 'Describe the current state (As-Is)',
        description:
          'Write what is happening right now, using observable facts and data. Avoid opinions, blame, or assumed causes. Example: "Payment posting takes an average of 4.2 business days."',
      },
      {
        title: 'Define the desired state',
        description:
          'Write what the ideal outcome looks like, using the same metrics. Example: "Payment posting should complete within 1 business day."',
      },
      {
        title: 'Quantify the gap',
        description:
          'Calculate the difference between As-Is and Desired using percentages, dollars, time, or error counts. Example: "The gap is 3.2 business days, affecting 1,200 payments per month."',
      },
      {
        title: 'Assess the impact',
        description:
          'Document who is affected and what it costs the organization. Include financial, operational, and human impact where possible.',
      },
      {
        title: 'Validate with the team',
        description:
          'Review the draft problem statement with all stakeholders. Confirm agreement before proceeding to root cause analysis in Step 2.',
      },
    ],
    example: {
      scenario: 'Healthcare claims processing — Member ID mismatches',
      walkthrough:
        'As-Is: 8.3% of pharmacy claims are rejected due to member ID mismatches, requiring manual correction by the claims team. Desired State: Member ID mismatch rate below 1%. Gap: 7.3 percentage points, affecting approximately 2,400 claims per month. Impact: Each manual correction takes 12 minutes, costing the team 480 hours per month and delaying medication delivery for affected members.',
    },
    proTips: [
      'Use SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound',
      'Never include a solution in the problem statement — "We need a new system" is a solution, not a problem',
      'Quantify in multiple dimensions: time, money, error rate, and customer impact',
      'Start by having each team member independently write what they think the problem is — the differences are revealing',
    ],
  },
  'impact-assessment': {
    seoDescription:
      'Quantify the real cost of a problem with an Impact Assessment. Measure financial, operational, and human effects to prioritize improvement efforts.',
    whatItIs:
      'An Impact Assessment quantifies the effect of a problem across multiple dimensions — financial cost, operational disruption, customer or employee experience, and strategic risk. It helps teams prioritize which problems to tackle first by making the cost of inaction visible.',
    whenToUse: [
      'After writing the initial problem statement, to add quantitative weight',
      'When leadership needs a business case to approve the improvement project',
      'When multiple problems compete for team attention and you need a ranking',
      'When the problem seems small but you suspect the cumulative impact is large',
    ],
    steps: [
      {
        title: 'Identify impact categories',
        description:
          'Common categories include: financial cost, time/labor, error rate, customer satisfaction, compliance risk, and employee morale.',
      },
      {
        title: 'Gather baseline data',
        description:
          'Collect current metrics for each impact category. Use existing reports, system data, and time studies. If hard data is unavailable, use estimates with confidence levels.',
      },
      {
        title: 'Calculate annualized cost',
        description:
          'Multiply per-incident costs by frequency. Express the total in terms leadership cares about: dollars, hours, or risk level.',
      },
      {
        title: 'Document indirect effects',
        description:
          'Capture downstream impacts: rework, delayed deliverables, missed SLAs, staff turnover, and opportunity cost.',
      },
    ],
    example: {
      scenario: 'IT help desk — Recurring Monday morning ticket spikes',
      walkthrough:
        'Direct cost: 47 extra tickets every Monday, averaging 22 minutes each = 17 hours of analyst time per week. Indirect cost: Other tickets are delayed by 2 hours on Mondays, violating the 4-hour SLA for 12% of high-priority requests. Annualized: 884 hours of analyst time ($44,200 at blended rate) plus $18,000 in SLA penalty risk.',
    },
    proTips: [
      'Include both hard costs (dollars) and soft costs (morale, trust) — leadership responds to both',
      'Use ranges rather than false precision: "$40K-$55K annually" is more credible than "$47,312"',
      'Compare the cost of the problem to the estimated cost of solving it — the ratio builds the case',
    ],
  },
  fishbone: {
    seoDescription:
      'Master the Fishbone Diagram (Ishikawa) for root cause analysis. Map causes across 6M categories to find why problems really happen.',
    whatItIs:
      'The Fishbone Diagram — also called an Ishikawa or Cause-and-Effect Diagram — is a visual tool for mapping all potential causes of a problem across structured categories. It looks like a fish skeleton: the "head" is the problem, and the "bones" are cause categories. The classic 6M categories are People (Man), Process (Method), Equipment (Machine), Materials, Measurement, and Environment (Mother Nature). Teams use it to move beyond obvious causes and uncover systemic issues.',
    whenToUse: [
      'In Step 2 (Analyze) as the primary root cause analysis tool',
      'When a problem has multiple potential causes across different areas',
      'When the team needs to see the full picture before drilling into specifics',
      'Before running a 5-Why analysis — the fishbone identifies which causes to investigate further',
    ],
    steps: [
      {
        title: 'Draw the skeleton',
        description:
          'Write the problem statement at the head (right side). Draw a horizontal line (the spine). Add diagonal lines for each cause category (the bones).',
      },
      {
        title: 'Brainstorm causes silently',
        description:
          'Give each team member sticky notes. Ask them to write one potential cause per note, placing it on the appropriate category bone. Allow 10-15 minutes of silent brainstorming.',
      },
      {
        title: 'Cluster and discuss',
        description:
          'Read all notes aloud. Group related causes. Discuss each cluster — are these symptoms or root causes? Add sub-bones for deeper causes.',
      },
      {
        title: 'Vote on top root causes',
        description:
          'Use dot voting (each person gets 3-5 dots) to identify the causes the team believes are most significant. The top 2-3 become candidates for 5-Why analysis.',
      },
    ],
    example: {
      scenario: 'Onboarding process takes 3x longer than target',
      walkthrough:
        'People: New hires wait 5 days for IT access because the request form is routed manually. Process: Three departments review the same document independently, adding 4 days. Equipment: The onboarding system requires VPN, which 40% of new hires cannot set up without IT help. Materials: The orientation handbook was last updated 18 months ago and references deprecated tools. After dot voting, "manual IT access routing" and "redundant departmental reviews" emerged as the top root causes.',
    },
    proTips: [
      'Use the 6M categories as starting points, but rename them to fit your context (e.g., "Technology" instead of "Machine" for office environments)',
      'Silent brainstorming first prevents groupthink and gives quieter team members equal voice',
      'A fishbone with 30+ causes is normal — it means the team is thorough, not that the problem is unsolvable',
      'Photograph the completed fishbone and share it — it becomes a reference for the rest of the project',
    ],
  },
  'five-why': {
    seoDescription:
      'Use the 5-Why Analysis technique to drill from surface symptoms to true root causes. A simple, powerful method for any team to uncover why problems keep recurring.',
    whatItIs:
      'The 5-Why Analysis is a root cause investigation technique that works by repeatedly asking "Why?" until you reach a cause the team can act on. Starting from a known problem or symptom, each "why" peels back a layer. You rarely need exactly five — sometimes three are enough, sometimes seven are needed. The rule is: stop when you reach a cause that is actionable and within the team\'s control.',
    whenToUse: [
      'After the fishbone diagram identifies the top 2-3 suspected root causes',
      'When a problem keeps recurring despite previous fixes — the real root cause has not been found',
      'When the team needs a fast, structured way to investigate a specific cause without extensive data collection',
    ],
    steps: [
      {
        title: 'State the problem clearly',
        description:
          'Write the specific symptom or cause from the fishbone at the top. Be precise: "Claims are rejected" is too vague. "8.3% of claims are rejected due to member ID mismatch" is actionable.',
      },
      {
        title: 'Ask "Why does this happen?"',
        description:
          'Write the answer. It should be a factual statement, not an opinion. If there are multiple answers, branch the analysis.',
      },
      {
        title: 'Repeat for each answer',
        description:
          'Ask "Why?" again for each response. Continue until the answer is a systemic cause that the team can address with a process change, policy update, training, or system fix.',
      },
      {
        title: 'Verify with data',
        description:
          'The final root cause should be verifiable. Ask: "If we fix this, will the original problem go away?" If not, continue asking why.',
      },
    ],
    example: {
      scenario: 'Payment postings crash twice per day',
      walkthrough:
        'Why do payment postings crash? Because the batch job exceeds the memory limit. Why does it exceed the memory limit? Because the batch includes all records, not just new ones. Why does it include all records? Because the query has no date filter. Why is there no date filter? Because the original developer assumed the table would stay small. Root cause: The batch query was never optimized for growth. Fix: Add a date filter and optimize the query for incremental processing.',
    },
    proTips: [
      'Branch when there are multiple valid answers to a "Why?" — do not force a single chain',
      'Stop asking when you reach something the team can change — do not drill into causes outside your control',
      'Watch for circular logic: if Why #4 sounds like Why #1, you have gone in a circle',
      'Document the chain visually — it becomes a powerful communication tool for stakeholders',
    ],
  },
  'force-field': {
    seoDescription:
      'Map the driving and restraining forces for change with Force Field Analysis. Understand what pushes improvement forward and what holds it back.',
    whatItIs:
      'Force Field Analysis, developed by social psychologist Kurt Lewin, maps the forces pushing toward a desired change (driving forces) against the forces resisting it (restraining forces). By rating each force on a 1-5 scale, teams see where to focus: strengthen the drivers, weaken the resistors, or both. It is especially useful when a solution is known but adoption is the challenge.',
    whenToUse: [
      'When the team has identified root causes but needs to understand what will help or hinder change',
      'When stakeholder resistance is expected and needs to be managed proactively',
      'When comparing multiple solutions — the one with the strongest driving forces and weakest restraining forces is often most feasible',
    ],
    steps: [
      {
        title: 'Define the desired change',
        description:
          'Write the specific change you want to make at the top. Be concrete: "Reduce payment posting time from 4.2 days to 1 day."',
      },
      {
        title: 'List driving forces',
        description:
          'Brainstorm everything pushing the change forward: leadership support, customer complaints, cost savings, regulatory requirements, available technology.',
      },
      {
        title: 'List restraining forces',
        description:
          'Brainstorm everything resisting the change: budget constraints, staff resistance, legacy systems, training needs, competing priorities.',
      },
      {
        title: 'Rate and strategize',
        description:
          'Rate each force 1-5. For the strongest restraining forces, develop mitigation strategies. For the strongest driving forces, determine how to amplify them.',
      },
    ],
    example: {
      scenario: 'Migrating from manual spreadsheet tracking to a digital project management tool',
      walkthrough:
        'Driving forces: CEO mandate (5), current error rate of 12% (4), time savings of 15 hours/week (4), competitor pressure (3). Restraining forces: Staff comfort with spreadsheets (4), migration cost of $25K (3), 6-week learning curve (3), IT bandwidth (2). Strategy: Address staff comfort by running parallel systems for 2 weeks. Offset migration cost with the 15-hour/week savings (payback in 8 weeks).',
    },
    proTips: [
      'Weakening a strong restraining force is often more effective than strengthening an already-strong driving force',
      'Include emotional and cultural forces, not just rational ones — "fear of looking incompetent" is real',
      'Use this tool in stakeholder presentations to show you have thought about adoption challenges',
    ],
  },
  checksheet: {
    seoDescription:
      'Collect and quantify data systematically with Check Sheets. A simple tally tool for gathering evidence before making improvement decisions.',
    whatItIs:
      'A Check Sheet is a structured tally form for collecting data by category over defined time periods. It is the simplest data collection tool in PIPS, but it is surprisingly powerful. Before a team can improve a process, they need to know how often problems occur, when they happen, and what types are most common. The Check Sheet provides that evidence.',
    whenToUse: [
      'When the team suspects a pattern but has no data to prove it',
      'When you need to validate root causes identified in the fishbone or 5-Why',
      'When tracking defect types, error categories, or event frequencies over time',
      'Before and after an improvement, to measure the change',
    ],
    steps: [
      {
        title: 'Define categories',
        description:
          'List the types of events, errors, or defects you want to track. Keep it to 5-10 categories for clarity.',
      },
      {
        title: 'Set the time period',
        description:
          'Decide how long to collect data and how often to record (hourly, daily, weekly). A typical collection period is 2-4 weeks.',
      },
      {
        title: 'Create the tally form',
        description:
          'Rows are categories, columns are time periods. Provide clear instructions for the people doing the tallying.',
      },
      {
        title: 'Collect and analyze',
        description:
          'Review the completed sheet. Look for patterns: Which category has the most tallies? Is there a time-of-day or day-of-week pattern? Do the numbers confirm or challenge your assumptions?',
      },
    ],
    example: {
      scenario: 'IT help desk — Categorizing recurring ticket types',
      walkthrough:
        'Categories: password resets, VPN issues, email problems, software installation, hardware failure, access requests. After 2 weeks of tallying, password resets accounted for 38% of all tickets, and 72% of those came on Monday mornings after the weekend lockout policy activated. This data directly informed the root cause analysis.',
    },
    proTips: [
      'Keep the form simple — if it takes more than 10 seconds to record an event, people will stop using it',
      'Train everyone who will be tallying, and do a trial run on day one',
      'Use a physical tally sheet near the point of work; digital forms introduce friction',
      'Always graph the results — a bar chart of check sheet data tells a story instantly',
    ],
  },
  brainstorming: {
    seoDescription:
      'Run effective brainstorming sessions using the PIPS methodology. Learn the rules, facilitation tips, and techniques for generating high-quality ideas.',
    whatItIs:
      'Brainstorming is a group idea generation technique where team members freely propose solutions without criticism or evaluation. The goal is quantity over quality: the more ideas generated, the higher the chance of finding an innovative solution. In PIPS, brainstorming follows the "Expand Then Contract" principle — Step 3 (Generate) is pure expansion, and Step 4 (Select) handles contraction.',
    whenToUse: [
      'In Step 3 (Generate) after root causes have been identified in Step 2',
      'When the team needs fresh, creative solutions beyond the obvious fixes',
      'When team energy is high and people are comfortable speaking up',
      'When combined with brainwriting for teams with mixed participation styles',
    ],
    steps: [
      {
        title: 'Set the ground rules',
        description:
          'No criticism. No evaluation. Build on others\' ideas ("Yes, and..."). Quantity matters. Wild ideas are welcome. All ideas are recorded.',
      },
      {
        title: 'State the problem to solve',
        description:
          'Read the problem statement from Step 1 and the key root causes from Step 2. Ensure everyone understands what they are solving for.',
      },
      {
        title: 'Generate ideas (timed)',
        description:
          'Set a timer for 15-20 minutes. Go around the room in rounds, with each person contributing one idea per round. Record every idea on a whiteboard or sticky notes.',
      },
      {
        title: 'Group and clarify',
        description:
          'After the timer ends, read through all ideas. Group similar ones into themes. Clarify any that are ambiguous. Do not evaluate yet — that happens in Step 4.',
      },
    ],
    example: {
      scenario: 'Reducing new employee onboarding time from 21 days to 7 days',
      walkthrough:
        'The team generated 34 ideas in 20 minutes. Themes included: pre-boarding automation (send equipment before Day 1), self-service IT setup guides, consolidated orientation replacing 4 separate sessions, buddy system pairing, and a digital onboarding checklist replacing the paper binder. Three of these ideas eventually combined into the selected solution.',
    },
    proTips: [
      'Set a numerical target — "Let us get to 30 ideas" pushes teams past the obvious',
      'Record every idea exactly as stated — do not rephrase or filter',
      'If the group goes quiet, ask: "What would we do if we had unlimited budget?" or "How would a competitor solve this?"',
      'Combine brainstorming with brainwriting: start with silent writing, then open up to verbal sharing',
    ],
  },
  brainwriting: {
    seoDescription:
      'Use the Brainwriting 6-3-5 technique for silent idea generation. A structured method that ensures every team member contributes equally.',
    whatItIs:
      'Brainwriting (6-3-5) is a silent, written alternative to verbal brainstorming. Six people each write 3 ideas in 5 minutes, then pass their sheet to the next person who builds on those ideas. After 6 rounds, the group has generated up to 108 ideas in 30 minutes — without a single person dominating the conversation. It is especially effective for introverted team members, cross-functional groups, and teams with power dynamics that suppress candid input.',
    whenToUse: [
      'When quieter team members are not contributing in verbal brainstorming',
      'When there are power dynamics that might suppress honest input (e.g., the boss is in the room)',
      'When the team is geographically distributed and verbal brainstorming is impractical',
      'As a warm-up before verbal brainstorming to get ideas flowing',
    ],
    steps: [
      {
        title: 'Prepare the sheets',
        description:
          'Give each participant a sheet with 6 rows and 3 columns. The top row is for their initial ideas.',
      },
      {
        title: 'Write 3 ideas (5 minutes)',
        description:
          'Each person writes 3 ideas in the first row. Ideas should be brief but clear. No discussion.',
      },
      {
        title: 'Pass and build (5 rounds)',
        description:
          'Pass the sheet to the next person. Read the previous ideas and write 3 more — building on, combining, or adding to what you see. Repeat 5 times.',
      },
      {
        title: 'Collect and review',
        description:
          'Gather all sheets. Read every idea aloud. Group similar ideas into themes. You now have a rich pool of solutions built through collective intelligence.',
      },
    ],
    example: {
      scenario: 'Reducing customer complaint response time',
      walkthrough:
        'A team of 6 produced 87 unique ideas in 30 minutes (some cells had sub-ideas). Themes included auto-categorization of complaints, tiered response templates, escalation automation, and a customer self-service portal. The brainwriting approach surfaced an idea from a junior team member that would not have been voiced in a verbal session: a simple auto-reply that set expectations and reduced follow-up calls by 40%.',
    },
    proTips: [
      'Works well with 4-8 participants — adjust the "6" in 6-3-5 to match your group size',
      'Allow extra time for reading in later rounds as sheets accumulate more ideas',
      "Remind participants: building on someone else's idea is just as valuable as writing a new one",
      'Combine with verbal brainstorming afterward: "Which ideas on the sheets sparked new thinking?"',
    ],
  },
  'criteria-matrix': {
    seoDescription:
      'Evaluate and rank solutions objectively with a Weighted Criteria Matrix. Score options against defined criteria to make evidence-based decisions.',
    whatItIs:
      'A Criteria Matrix (also called a Decision Matrix or Weighted Scoring Model) is a structured tool for evaluating multiple solutions against defined criteria. Each criterion gets a weight reflecting its importance (1-10), and each solution gets a score against each criterion (1-5). Multiply weights by scores, sum the totals, and the highest-scoring solution wins. It removes gut-feel bias from decision-making.',
    whenToUse: [
      'In Step 4 (Select & Plan) to choose the best solution from the brainstormed list',
      'When there are 3-8 viable solutions and the team disagrees on which is best',
      'When the decision involves trade-offs (cost vs. speed vs. quality) that need to be made explicit',
      'When leadership needs transparent reasoning behind the recommendation',
    ],
    steps: [
      {
        title: 'Define criteria',
        description:
          'List the factors that matter: cost, time to implement, impact on the problem, feasibility, risk, maintainability. Get team consensus on the list.',
      },
      {
        title: 'Assign weights',
        description:
          "Rate each criterion's importance from 1 (low) to 10 (critical). Assign weights before scoring solutions to prevent bias toward a pre-selected favorite.",
      },
      {
        title: 'Score each solution',
        description:
          'Have each team member independently score every solution against every criterion (1 = poor, 5 = excellent). Then discuss and reconcile scores as a group.',
      },
      {
        title: 'Calculate and rank',
        description:
          'Multiply each score by its criterion weight. Sum the weighted scores for each solution. The highest total is the recommended choice.',
      },
    ],
    example: {
      scenario: 'Choosing between 3 approaches to reduce invoice processing time',
      walkthrough:
        'Criteria: Implementation cost (weight 7), time savings (weight 9), staff training needed (weight 5), risk of disruption (weight 6). Solution A (new software) scored 2-5-2-3, total = 93. Solution B (process redesign) scored 4-4-4-4, total = 112. Solution C (partial automation) scored 3-4-3-4, total = 102. Solution B won — it had the best balance of impact and feasibility.',
    },
    proTips: [
      'Always set weights before revealing the solutions — it prevents reverse-engineering scores to justify a favorite',
      'Have individuals score independently first, then discuss — this surfaces genuine disagreements',
      'If two solutions score within 5% of each other, they are effectively tied — pick the one with lower risk',
      'Document the criteria and weights for future projects — they often transfer to similar decisions',
    ],
  },
  'paired-comparisons': {
    seoDescription:
      'Use Paired Comparisons to systematically rank options by comparing every pair head-to-head. A structured decision-making technique for teams.',
    whatItIs:
      'Paired Comparisons is a decision technique where every option is compared to every other option one pair at a time. For each pair, the team votes on which is better. The option that wins the most comparisons ranks highest. It is especially useful when criteria are hard to quantify or when the team struggles with the abstraction of scoring matrices.',
    whenToUse: [
      'When criteria-based scoring feels too abstract for the team',
      'When options are qualitatively different and hard to score on a common scale',
      'When the team needs a quick ranking of 4-8 options',
      'As a validation check on criteria matrix results',
    ],
    steps: [
      {
        title: 'List all options',
        description: 'Write each solution or option on a card or row. Label them A, B, C, etc.',
      },
      {
        title: 'Compare each pair',
        description:
          'For every possible pair (A vs B, A vs C, B vs C, etc.), ask: "Which is better overall?" Record the winner.',
      },
      {
        title: 'Tally wins',
        description:
          'Count how many times each option won. The option with the most wins ranks first.',
      },
      {
        title: 'Review the ranking',
        description:
          'Does the ranking make intuitive sense? If not, revisit the comparisons where the team was most divided.',
      },
    ],
    example: {
      scenario: 'Ranking 5 training program improvements',
      walkthrough:
        'Options: A (video tutorials), B (peer mentoring), C (external certification), D (lunch-and-learn series), E (hands-on workshops). After 10 pairwise comparisons, the ranking was: E (4 wins), B (3 wins), A (2 wins), D (1 win), C (0 wins). Hands-on workshops won because they consistently beat every other option on engagement and retention.',
    },
    proTips: [
      'With N options, you need N*(N-1)/2 comparisons — keep options to 8 or fewer to stay practical',
      'Use secret ballot for each comparison if power dynamics are a concern',
      'If there is a tie, use a tiebreaker criterion the team agrees on in advance',
    ],
  },
  raci: {
    seoDescription:
      'Build clear RACI charts to define Responsible, Accountable, Consulted, and Informed roles for every task. Eliminate ambiguity in project ownership.',
    whatItIs:
      'A RACI Chart is a responsibility assignment matrix that defines who is Responsible (does the work), Accountable (owns the outcome), Consulted (provides input before the decision), and Informed (notified after the decision) for every task in a project. It eliminates the ambiguity that kills projects: "I thought you were doing that." Every task has exactly one Accountable person.',
    whenToUse: [
      'In Step 4 (Select & Plan) when building the implementation plan',
      'When a project crosses departmental boundaries and roles are unclear',
      'When tasks are falling through the cracks because nobody owns them',
      'When onboarding new team members who need to understand their responsibilities',
    ],
    steps: [
      {
        title: 'List all tasks',
        description:
          'Break the implementation plan into individual tasks or deliverables. Be specific enough that each task has a clear completion point.',
      },
      {
        title: 'List all people or roles',
        description:
          'Identify everyone involved in the project. Use role names if specific people are not yet assigned.',
      },
      {
        title: 'Assign R, A, C, I',
        description:
          'For each task-person intersection, assign one letter. Rules: exactly one A per task, at least one R per task, C and I are optional. A person can be both R and A for the same task.',
      },
      {
        title: 'Validate and communicate',
        description:
          'Review the chart with all parties. Confirm every A agrees they own the outcome. Resolve any gaps or overlaps. Post the RACI where the team can reference it.',
      },
    ],
    example: {
      scenario: 'Implementing a new automated payment posting system',
      walkthrough:
        'Tasks: vendor selection, contract negotiation, system configuration, data migration, user training, go-live support. The RACI made it clear that IT was Responsible for configuration but Finance was Accountable for the outcome. This surfaced a gap: nobody had been assigned as Responsible for data validation after migration. Adding that row and owner prevented a critical oversight.',
    },
    proTips: [
      'If a task has two Accountable people, it has zero — split the task or pick one owner',
      'Minimize the number of C (Consulted) people — too many slows decisions to a crawl',
      'Review the RACI at each milestone check-in — roles may need to shift as the project evolves',
      'Look for people with too many A assignments — they are likely bottlenecks and need tasks redistributed',
    ],
  },
  'implementation-plan': {
    seoDescription:
      'Create detailed implementation plans with timelines, milestones, risk mitigation, and resource allocation. Turn decisions into executable action.',
    whatItIs:
      'An Implementation Plan is the operational blueprint for executing the selected solution. It transforms the decision from Step 4 into a sequence of tasks with owners, deadlines, milestones, dependencies, and risk mitigation. A strong implementation plan answers every question the team will face during execution before they face it.',
    whenToUse: [
      'In Step 4 (Select & Plan) after the solution has been chosen',
      'When the solution involves multiple departments, phases, or dependencies',
      'When the timeline is tight and sequencing matters',
      'When stakeholders need confidence that the team has a realistic execution path',
    ],
    steps: [
      {
        title: 'Define the scope',
        description:
          'Document what is in scope and what is explicitly out of scope. Include assumptions and constraints.',
      },
      {
        title: 'Break into phases',
        description:
          'Group tasks into logical phases: pilot, limited rollout, full rollout. Define the entry criteria for each phase.',
      },
      {
        title: 'Assign tasks, owners, and deadlines',
        description:
          'Every task needs a single owner and a target date. Use the RACI chart to ensure alignment.',
      },
      {
        title: 'Identify risks and mitigations',
        description:
          'List the top 3-5 risks. For each, document the trigger, impact, and mitigation strategy.',
      },
      {
        title: 'Define milestones',
        description:
          'Set 3-5 key milestones that serve as checkpoints. Each milestone should have measurable completion criteria.',
      },
    ],
    example: {
      scenario: 'Rolling out automated invoice processing across 3 regions',
      walkthrough:
        'Phase 1 (Weeks 1-3): Pilot with Region A — 50 invoices, 3 users. Milestone: 95% accuracy rate. Phase 2 (Weeks 4-6): Expand to Region B with process refinements from Phase 1. Phase 3 (Weeks 7-10): Full rollout to all regions. Risk: Legacy system integration failure (mitigation: maintain manual fallback for 2 weeks post-launch). Each phase had a go/no-go decision gate.',
    },
    proTips: [
      'Build the plan backward from the target date to surface unrealistic timelines early',
      'Include a communication plan: who needs to know what, when, and through which channel',
      'Always include a rollback plan — if the implementation fails, how do you revert safely?',
      'Identify quick wins within the first phase to build momentum and stakeholder confidence',
    ],
  },
  'implementation-checklist': {
    seoDescription:
      'Track implementation tasks with detailed checklists. Assign owners, set statuses, and ensure nothing falls through the cracks during execution.',
    whatItIs:
      "An Implementation Checklist is a granular task list that breaks the implementation plan into individual, trackable items. Each item has an owner, a due date, a status (not started, in progress, complete, blocked), and notes. It serves as the team's daily execution reference and the basis for stand-up check-ins during Step 5.",
    whenToUse: [
      'During Step 5 (Implement) as the primary execution tracking tool',
      'When the implementation plan has many small tasks that need individual tracking',
      'When multiple team members are working on different parts simultaneously',
    ],
    steps: [
      {
        title: 'Decompose plan tasks',
        description:
          'Take each task from the implementation plan and break it into specific, completable subtasks. Each should take 1-5 days.',
      },
      {
        title: 'Assign owners and dates',
        description:
          'Every subtask gets a single owner and a target completion date. Align with the RACI chart.',
      },
      {
        title: 'Set initial status',
        description:
          'Mark all items as "Not Started." Use statuses: Not Started, In Progress, Complete, Blocked, Deferred.',
      },
      {
        title: 'Review at each check-in',
        description:
          'Update the checklist at every stand-up or milestone review. Blocked items get escalated immediately.',
      },
    ],
    example: {
      scenario: 'IT system migration checklist',
      walkthrough:
        'The migration plan had 8 high-level tasks. The checklist expanded them into 47 subtasks. During the weekly stand-up in Week 2, the checklist showed 3 blocked items — all related to the same vendor dependency. The team escalated as a group, resolved the vendor issue in 48 hours, and stayed on schedule.',
    },
    proTips: [
      'Keep checklist items small enough to complete in 1-5 days — larger items hide delays',
      'Use a shared, visible checklist (not email or private notes) so the whole team sees progress',
      'Document reasons for deferred items — they become input for lessons learned in Step 6',
    ],
  },
  'milestone-tracker': {
    seoDescription:
      'Track improvement project milestones with planned vs. actual dates. Visualize progress, catch delays early, and keep stakeholders informed.',
    whatItIs:
      'A Milestone Tracker records the key checkpoints of an improvement project — planned date, actual date, status, and notes. It provides a high-level view of project progress for both the team and stakeholders. When a milestone is missed, the tracker forces the conversation: Why? What is the revised date? What needs to change?',
    whenToUse: [
      'During Step 5 (Implement) as the primary progress reporting tool',
      'For stakeholder updates and status reports',
      'When the project spans weeks or months and the team needs a birds-eye view of progress',
    ],
    steps: [
      {
        title: 'Define milestones',
        description:
          'Identify 3-7 key milestones from the implementation plan. Each should be a verifiable event, not an activity.',
      },
      {
        title: 'Set planned dates',
        description: 'Record the target date for each milestone based on the implementation plan.',
      },
      {
        title: 'Update as milestones are reached',
        description:
          'When a milestone is completed, record the actual date. If it is late, document why.',
      },
      {
        title: 'Report at each check-in',
        description:
          'Use the tracker as the first slide in milestone reviews. Green/yellow/red status makes progress visible instantly.',
      },
    ],
    example: {
      scenario: 'ERP module rollout — 5 milestones over 12 weeks',
      walkthrough:
        'Milestone 1 (Requirements finalized): Planned Week 2, Actual Week 2 — on time. Milestone 2 (Configuration complete): Planned Week 5, Actual Week 6 — delayed 1 week due to vendor dependency. Milestone 3 (User acceptance testing): Planned Week 8, Actual Week 8 — recovered schedule by adding weekend sessions. The tracker made the delay visible early enough to adjust.',
    },
    proTips: [
      'Use verifiable milestones: "Configuration complete and signed off" not "Configuration mostly done"',
      'Track both planned and actual dates — the delta is the metric that matters',
      'If a milestone is late, update the projected dates for all downstream milestones immediately',
    ],
  },
  'before-after': {
    seoDescription:
      'Compare baseline metrics with post-improvement results using Before & After analysis. Measure whether your process improvement delivered real results.',
    whatItIs:
      'A Before & After Comparison is a structured measurement tool that places baseline metrics (from Step 1) side by side with post-implementation results. It answers the fundamental question: "Did the improvement work?" The comparison uses the same metrics, measurement methods, and time periods defined at the start of the project to ensure an honest evaluation.',
    whenToUse: [
      'In Step 6 (Evaluate) after the implementation is complete and has had time to stabilize',
      'When presenting results to leadership and stakeholders',
      'When deciding whether to standardize the solution or iterate with another cycle',
    ],
    steps: [
      {
        title: 'Retrieve baseline data',
        description:
          'Pull the metrics recorded in Step 1: As-Is values, targets, and measurement definitions.',
      },
      {
        title: 'Collect post-implementation data',
        description:
          'Measure the same metrics using the same method. Ensure enough time has passed for results to stabilize (typically 2-4 weeks post-implementation).',
      },
      {
        title: 'Calculate improvement',
        description:
          'For each metric, compute the change: absolute difference, percentage improvement, and whether the target was met.',
      },
      {
        title: 'Document and present',
        description:
          'Create a comparison table: Metric, Baseline, Target, Actual, % Change, Target Met (Y/N). Include commentary on why targets were or were not met.',
      },
    ],
    example: {
      scenario: 'Reducing payment posting time',
      walkthrough:
        'Metric: Average posting time. Baseline: 4.2 business days. Target: 1 business day. Actual: 1.3 business days. Improvement: 69% reduction. Target partially met — the team achieved a 3x improvement but fell 0.3 days short of the target. Root cause of the gap: one legacy integration still requires manual intervention. Recommendation: start a new PIPS cycle focused on that integration.',
    },
    proTips: [
      'Never change the metrics after the project starts — moving goalposts destroys credibility',
      'Measure over a consistent time period: if the baseline was a 4-week average, the "after" should be too',
      'Present both absolute and relative improvements — "$120K saved" and "42% reduction" tell different stories',
      'If results exceed the target, document why — it may reveal best practices worth replicating',
    ],
  },
  evaluation: {
    seoDescription:
      'Write comprehensive evaluation summaries for process improvement projects. Assess results, document outcomes, and determine next steps.',
    whatItIs:
      "The Evaluation Summary is the capstone document of a PIPS cycle. It synthesizes the before-after comparison, the team's retrospective insights, and a clear recommendation for next steps: standardize the solution, iterate with another cycle, or close the project. It serves as both a project close-out report and a reference for future improvement efforts.",
    whenToUse: [
      'At the end of Step 6 (Evaluate) to formally close the improvement cycle',
      'When presenting final results to leadership',
      'When archiving the project for future reference',
    ],
    steps: [
      {
        title: 'Summarize the project',
        description:
          'Brief overview: what problem was tackled, what solution was implemented, and the timeline.',
      },
      {
        title: 'Present the results',
        description:
          'Include the before-after comparison data. Highlight which targets were met and which were not.',
      },
      {
        title: 'Assess the process',
        description:
          'How well did the team execute? Were timelines realistic? Were the right people involved? What would you do differently?',
      },
      {
        title: 'Recommend next steps',
        description:
          'Explicitly choose one: Standardize (make the change permanent), Iterate (run another PIPS cycle on remaining gaps), or Close (problem is resolved, move on).',
      },
    ],
    example: {
      scenario: 'Onboarding improvement project — final evaluation',
      walkthrough:
        'Problem: Onboarding took 21 business days (target: 7). Solution: Pre-boarding automation, consolidated orientation, and self-service IT setup. Results: Onboarding reduced to 8.5 business days (60% improvement, target partially met). Process assessment: Phase 1 pilot was rushed; Phase 2 benefited from the extra week. Recommendation: Standardize the current process and start a new PIPS cycle focused on the IT setup step, which accounts for the remaining 1.5-day gap.',
    },
    proTips: [
      'Write the evaluation while memories are fresh — waiting weeks loses critical detail',
      'Include both quantitative results and qualitative team feedback',
      'Be honest about what did not work — candor builds trust and improves future projects',
      'Archive the evaluation where future teams can find it — organizational learning compounds over time',
    ],
  },
  'lessons-learned': {
    seoDescription:
      'Capture and share lessons learned from improvement projects. Document what worked, what did not, and what to do differently next time.',
    whatItIs:
      'A Lessons Learned document captures the team\'s reflections on what went well, what did not go well, and what they would do differently in the next improvement cycle. It is the mechanism by which organizations learn from experience rather than repeating the same mistakes. In PIPS, lessons learned feed directly back into Step 1 of the next cycle — this is how "Close The Loop" works in practice.',
    whenToUse: [
      'At the end of every PIPS cycle, regardless of whether the project succeeded or failed',
      'During the retrospective session in Step 6',
      'When onboarding new team members who will inherit the improved process',
    ],
    steps: [
      {
        title: 'Run a structured retrospective',
        description:
          'Each team member writes responses to three prompts: What went well? What could be improved? What action should we take?',
      },
      {
        title: 'Cluster and discuss',
        description:
          'Share responses, group similar themes, and discuss the most impactful insights as a team.',
      },
      {
        title: 'Document actionable lessons',
        description:
          'For each lesson, write: the situation, what happened, what was learned, and the recommended action for next time.',
      },
      {
        title: 'Share broadly',
        description:
          'Publish lessons learned to the broader organization. Other teams facing similar problems benefit from your experience.',
      },
    ],
    example: {
      scenario: 'After a 3-month claims processing improvement project',
      walkthrough:
        'What went well: The fishbone diagram surfaced a cause that no one had considered (a batch query with no date filter). The brainwriting session produced the winning idea from a junior team member. What could improve: The pilot phase was too short (1 week instead of 3), which missed an edge case that affected 8% of transactions. What we would do differently: Extend pilot phases and include edge-case testing as a checklist item.',
    },
    proTips: [
      'Capture lessons from both successes and failures — successes teach what to replicate',
      'Include specific, actionable recommendations, not vague sentiments like "communicate better"',
      'Review previous lessons learned at the start of every new PIPS project — this is how organizations avoid repeating mistakes',
      "Assign an owner to each lesson's recommended action to ensure follow-through",
    ],
  },
  'balance-sheet': {
    seoDescription:
      'Weigh gains against losses with a Balance Sheet analysis. Make informed go/no-go decisions by comparing what you gain and what you give up.',
    whatItIs:
      'A Balance Sheet is a decision-support tool that lists everything gained and everything lost or risked by a particular decision. Unlike a cost-benefit analysis (which focuses on financial metrics), a balance sheet captures qualitative factors: team morale, customer trust, organizational learning, opportunity cost. It is especially useful for decisions where the numbers do not tell the whole story.',
    whenToUse: [
      'In Step 6 (Evaluate) to weigh the overall value of the improvement',
      'When deciding whether to standardize a solution or revert to the old process',
      'When presenting results to stakeholders who care about more than financial ROI',
    ],
    steps: [
      {
        title: 'List gains',
        description:
          'Everything positive that resulted from the improvement: cost savings, time savings, error reduction, morale improvement, customer satisfaction, knowledge gained.',
      },
      {
        title: 'List losses or costs',
        description:
          'Everything negative: implementation cost, training time, temporary productivity dip, increased complexity, opportunities deferred.',
      },
      {
        title: 'Assess the balance',
        description:
          'Do the gains outweigh the losses? Are the losses temporary while the gains are permanent? Is the trade-off acceptable?',
      },
      {
        title: 'Make the decision',
        description:
          'Based on the balance, recommend: proceed (gains dominate), iterate (mixed results), or revert (losses outweigh gains).',
      },
    ],
    example: {
      scenario: 'Evaluating a new automated scheduling system',
      walkthrough:
        'Gains: 12 hours/week saved in manual scheduling, 23% fewer scheduling conflicts, staff satisfaction up 15 points. Losses: $18K implementation cost, 3-week learning curve with 10% productivity dip, 2 staff members resistant to change. Balance: Gains are permanent and recurring; losses are one-time. The 12 hours/week savings alone pay back the $18K in 6 months. Recommendation: Standardize.',
    },
    proTips: [
      'Include intangible gains and losses — team learning, customer trust, and cultural shift matter',
      'Distinguish between one-time costs and recurring costs or savings',
      'If the balance is ambiguous, it usually means more data is needed before deciding',
    ],
  },
  'cost-benefit': {
    seoDescription:
      'Conduct cost-benefit analysis for process improvement decisions. Quantify financial returns, payback periods, and ROI to build the business case.',
    whatItIs:
      'A Cost-Benefit Analysis quantifies the financial returns of a proposed solution by comparing total implementation costs against projected benefits over a defined period. It produces key decision metrics: total cost, total benefit, net benefit, ROI percentage, and payback period. It is the language leadership speaks when approving resource allocation.',
    whenToUse: [
      'In Step 4 (Select & Plan) when comparing solutions that have different cost profiles',
      'When leadership requires a financial business case before approving the implementation',
      'When the team needs to choose between a quick, cheap fix and a larger, more impactful investment',
    ],
    steps: [
      {
        title: 'Identify all costs',
        description:
          'Include: technology, labor, training, disruption, maintenance, and opportunity cost. Separate one-time costs from recurring costs.',
      },
      {
        title: 'Quantify all benefits',
        description:
          'Include: labor savings, error reduction, faster cycle times, revenue gains, risk avoidance. Use conservative estimates.',
      },
      {
        title: 'Calculate over a time horizon',
        description:
          'Project costs and benefits over 1-3 years. Calculate net benefit (benefits minus costs), ROI (net benefit / costs), and payback period.',
      },
      {
        title: 'Sensitivity analysis',
        description:
          'What if benefits are 20% lower than projected? What if costs are 20% higher? Is the decision still positive?',
      },
    ],
    example: {
      scenario: 'Automating invoice matching vs. hiring additional staff',
      walkthrough:
        'Option A (automation): Cost $45K year 1, $8K/year maintenance. Benefit: $72K/year labor savings. Payback: 8 months. 3-year ROI: 253%. Option B (additional staff): Cost $55K/year salary + benefits. Benefit: $40K/year in faster processing. Payback: Never positive — costs exceed benefits each year. The analysis made the choice clear.',
    },
    proTips: [
      'Use conservative estimates — under-promise and over-deliver builds trust with leadership',
      'Always include a sensitivity analysis — single-point estimates create false confidence',
      'Express ROI in terms leadership cares about: "For every $1 invested, we get $2.53 back over 3 years"',
      'Do not forget to include the cost of doing nothing — the status quo has a price too',
    ],
  },
  'weighted-voting': {
    seoDescription:
      "Use weighted voting to prioritize options fairly. Each team member distributes a fixed number of votes to surface the group's true priorities.",
    whatItIs:
      'Weighted Voting (also called dot voting or multi-voting) is a prioritization technique where each team member distributes a fixed number of votes (typically 3-5 dots) across options. Unlike simple majority voting, weighted voting captures the intensity of preference — a person can put all their dots on one item they feel strongly about. The items with the most dots rise to the top.',
    whenToUse: [
      'After brainstorming to narrow a long list of ideas to a shortlist',
      'After fishbone analysis to identify the top root causes to investigate',
      'Whenever the team needs a quick, democratic ranking of options',
    ],
    steps: [
      {
        title: 'Display all options',
        description:
          'Post every option on a wall, whiteboard, or shared screen where all are visible.',
      },
      {
        title: 'Distribute votes',
        description:
          'Give each person 3-5 votes (sticky dots or markers). They can distribute them however they choose — including putting multiple votes on one item.',
      },
      {
        title: 'Vote silently',
        description:
          'Everyone places their votes at the same time without discussion. This prevents anchoring bias.',
      },
      {
        title: 'Count and rank',
        description:
          'Tally the votes. The top 3-5 items become the shortlist for further analysis.',
      },
    ],
    example: {
      scenario: 'Narrowing 28 brainstormed ideas to 5 for evaluation',
      walkthrough:
        'After a brainwriting session, the team had 28 ideas posted on the wall. Each of the 7 team members got 5 dots. After silent voting, the top 5 ideas had 8, 7, 6, 5, and 5 dots respectively. The bottom 15 ideas had zero or one dot each. The team moved the top 5 into the criteria matrix for detailed evaluation.',
    },
    proTips: [
      'Do not allow discussion before voting — it biases results toward the most persuasive speaker',
      'With large lists (20+), give each person more votes (7-10) to avoid too many zero-vote items',
      'Use colored dots to track voting by role (e.g., red for managers, blue for frontline) if you want to see preference differences',
    ],
  },
  'list-reduction': {
    seoDescription:
      'Systematically reduce a long list of options to a manageable shortlist. Use structured elimination criteria to narrow down without losing the best ideas.',
    whatItIs:
      'List Reduction is a structured technique for narrowing a long list of options (typically from a brainstorming session) to a manageable shortlist. It applies pass/fail criteria to eliminate options that clearly do not meet basic requirements, without getting into detailed scoring. The result is a focused shortlist ready for deeper evaluation with tools like the Criteria Matrix.',
    whenToUse: [
      'After brainstorming produces 20+ ideas and weighted voting alone is not sufficient',
      'When the team needs to eliminate options that are infeasible before investing time in evaluation',
      'As a first filter before applying the criteria matrix',
    ],
    steps: [
      {
        title: 'Define must-have criteria',
        description:
          'Set 3-5 pass/fail filters: Is it within budget? Can it be implemented within the timeline? Does it address the root cause? Is it within our control?',
      },
      {
        title: 'Screen each option',
        description:
          'For each idea, check it against every must-have criterion. If it fails any one, it is eliminated.',
      },
      {
        title: 'Review the survivors',
        description:
          'The remaining options are the shortlist. Confirm the team agrees that no important idea was lost.',
      },
      {
        title: 'Move to detailed evaluation',
        description:
          'The shortlist (typically 3-8 options) goes into the criteria matrix or paired comparisons for final selection.',
      },
    ],
    example: {
      scenario: 'Reducing 32 improvement ideas to 6 finalists',
      walkthrough:
        'Must-have criteria: (1) Can be implemented in under 90 days, (2) Costs less than $50K, (3) Does not require new headcount. Of 32 ideas, 14 failed on timeline, 8 failed on cost, and 4 failed on headcount. The remaining 6 ideas passed all three filters and moved to the criteria matrix.',
    },
    proTips: [
      'Keep must-have criteria binary (pass/fail) — do not introduce scoring at this stage',
      'If the list reduces to fewer than 3, your criteria may be too strict — revisit them',
      'Save the eliminated ideas — they may become relevant in a future cycle with different constraints',
    ],
  },
  interviewing: {
    seoDescription:
      'Conduct structured interviews for process improvement data gathering. Ask the right questions to surface problems, causes, and solution ideas from stakeholders.',
    whatItIs:
      'Structured Interviewing is a data gathering technique where the improvement team talks one-on-one or in small groups with people who experience the problem. Unlike casual conversation, structured interviews follow a prepared guide with open-ended questions designed to surface facts, patterns, and insights. The people closest to the work often see things that data alone cannot reveal.',
    whenToUse: [
      'In Step 1 (Identify) to understand the problem from multiple perspectives',
      'In Step 2 (Analyze) to investigate root causes that are not captured in system data',
      'When quantitative data tells you what is happening but not why',
    ],
    steps: [
      {
        title: 'Prepare the interview guide',
        description:
          'Write 5-10 open-ended questions. Start broad ("Walk me through your typical day") and narrow ("When does this problem happen most often?"). Include follow-up prompts.',
      },
      {
        title: 'Select interviewees',
        description:
          'Include people at multiple levels: frontline workers, supervisors, managers, and affected stakeholders. Aim for diversity of perspective.',
      },
      {
        title: 'Conduct the interview',
        description:
          'Listen more than talk. Take notes or record (with permission). Ask "Can you give me an example?" to move from general to specific.',
      },
      {
        title: 'Synthesize findings',
        description:
          'After all interviews, look for themes, contradictions, and surprises. Present anonymized findings to the team.',
      },
    ],
    example: {
      scenario: 'Investigating why the accounting close takes 12 days instead of 5',
      walkthrough:
        'Interviews with 8 staff across 3 departments revealed: (1) Two teams were reconciling the same data independently because neither knew the other did it. (2) One manual step required a physical signature that could easily be digital. (3) The closing checklist had 4 steps that were no longer relevant but nobody had removed them. None of these causes appeared in the system data.',
    },
    proTips: [
      'Promise and maintain confidentiality — people share more when they are not worried about attribution',
      'Ask "What else?" at the end of every answer — the best insights often come last',
      'Interview skeptics and resistors, not just supporters — their objections reveal real constraints',
      'Schedule 30-45 minutes per interview — shorter feels rushed, longer causes fatigue',
    ],
  },
  surveying: {
    seoDescription:
      'Design and deploy surveys for process improvement data collection. Gather quantitative and qualitative feedback at scale from teams and stakeholders.',
    whatItIs:
      'Surveying is a data collection method that gathers structured feedback from a large group of people. Unlike interviews (which are deep but narrow), surveys are broad but standardized. They use a mix of rating scales, multiple-choice questions, and open-ended responses to quantify perceptions, measure satisfaction, and identify problem areas across an organization.',
    whenToUse: [
      'When you need input from more people than you can interview individually',
      'When you want to quantify satisfaction, frequency, or severity across a population',
      'Before and after an improvement to measure perception change',
      'When gathering input anonymously would produce more honest responses',
    ],
    steps: [
      {
        title: 'Define the objective',
        description:
          'What specific information do you need? Tie every question back to the problem statement or evaluation criteria.',
      },
      {
        title: 'Design the survey',
        description:
          'Keep it under 10 minutes. Use Likert scales (1-5) for quantitative data, open-ended questions for qualitative data. Pilot test with 2-3 people first.',
      },
      {
        title: 'Distribute and collect',
        description:
          'Send to all relevant stakeholders with a clear deadline. Follow up once. Aim for a 60%+ response rate for reliable results.',
      },
      {
        title: 'Analyze and report',
        description:
          'Calculate averages and distributions for scaled questions. Code and theme open-ended responses. Present findings with the data, not just your interpretation.',
      },
    ],
    example: {
      scenario: 'Measuring satisfaction with the new onboarding process',
      walkthrough:
        'A 7-question survey was sent to 45 employees who completed onboarding in the past 3 months. Response rate: 78% (35 responses). Key finding: Overall satisfaction averaged 4.1/5 (up from 2.8 before the improvement). The open-ended question revealed that IT setup was still the biggest pain point, averaging 2.9/5. This data directly informed the next PIPS cycle.',
    },
    proTips: [
      'Shorter is better — every additional question reduces completion rate by 5-10%',
      'Always include at least one open-ended question — the qualitative data often contains the most actionable insights',
      'Benchmark by running the same survey before and after the improvement',
      'Share results with respondents — people are more likely to respond next time if they see their feedback mattered',
    ],
  },
}
