type ChapterPreview = {
  summary: string
  previewParagraphs: string[]
  fullContent?: string[]
  keyTakeaways: string[]
}

export const CHAPTER_PREVIEWS: Record<string, ChapterPreview> = {
  foreword: {
    summary:
      'Why another process improvement book? Because the gap between methodology and the people who use it has never been properly bridged. PIPS was built for practitioners, not consultants.',
    previewParagraphs: [
      "I know what you are thinking. The last thing the world needs is another book about process improvement. Your bookshelf -- or more likely, a forgotten folder on your company's shared drive -- already has at least one Lean manual, a Six Sigma workbook, maybe a Kaizen guide that someone brought back from a conference in 2017.",
      'Here is how it usually goes. Someone in leadership reads an article, attends a seminar, or hires a consultant. They come back fired up. There is a kickoff meeting. There are new terms to learn. Maybe some colored belts get mentioned. People nod along, because the ideas genuinely make sense.',
      'Then reality sets in. The methodology requires a certification program. The tools require a statistician to operate. The consultant leaves. The champion gets pulled onto another project. The binder goes on the shelf.',
    ],
    fullContent: [
      'The problem is not the methodologies. The problem is the gap between the methodology and the people who are supposed to use it.',
      'I spent the better part of two decades in healthcare IT and operations, mostly in pharmacy benefits management. That experience taught me something that became the foundation of everything in this book: the people closest to the work are the ones who can fix it.',
      'PIPS stands for Process Improvement and Problem Solving. It is a six-step structured methodology for identifying problems, analyzing their root causes, generating solutions, selecting the best one, implementing it, and evaluating the results. If that sounds simple, good. It is supposed to.',
      'You do not need a certification to use PIPS. You do not need a consultant standing over your shoulder. You need a team, a problem, some data, and the willingness to follow a structured process instead of jumping straight to solutions.',
    ],
    keyTakeaways: [
      'Traditional process improvement methodologies fail not because they are wrong, but because they are inaccessible to the people who need them most',
      'PIPS was designed for practitioners — the accounting clerk, the pharmacy tech, the help desk analyst',
      'No certification, no statistics degree, no consultant required',
      'The "never-ending" part is the whole point — improvement is a permanent operating discipline, not a project',
    ],
  },
  introduction: {
    summary:
      'An introduction to the PIPS framework, its intellectual roots, and how this book is structured to help you start improving processes immediately.',
    previewParagraphs: [
      'This book is organized around the six steps of the PIPS methodology, but it is more than a how-to manual. It is a guide to building a culture where continuous improvement becomes second nature.',
      'Each chapter builds on the last. The early chapters establish the philosophy and principles. The middle chapters walk through each step with tools, templates, and real examples. The later chapters tackle the harder questions: how to scale, how to sustain, and what to do when things go wrong.',
    ],
    fullContent: [
      'You can read this book front to back, or you can jump to the step your team is currently working on. Either way, start with the first three chapters — they establish the foundation that makes everything else work.',
      'Throughout the book, you will follow a running case study: Meridian Health Systems, a mid-sized healthcare company tackling process improvement across multiple departments. Their journey mirrors what most organizations experience.',
    ],
    keyTakeaways: [
      'The book follows the 6 PIPS steps but also covers philosophy, culture, and facilitation',
      'A running case study illustrates each concept in a real-world context',
      'The methodology is designed to be used immediately, not studied theoretically',
    ],
  },
  ch01: {
    summary:
      'Why do organizations struggle with the same problems year after year? Chapter 1 examines the fundamental challenge of problem solving in complex organizations.',
    previewParagraphs: [
      'Every organization has problems. That is not a criticism — it is a fact of organizational life. Systems degrade, environments change, people turn over, and the processes that worked last year start to strain under new conditions.',
      'The question is not whether you have problems. The question is whether you have a systematic way to solve them. Most organizations do not. They have talented people, good intentions, and a reflexive habit of jumping straight to solutions.',
      'The jump-to-solution reflex is the single biggest obstacle to lasting improvement. A team sees a problem, someone suggests a fix, the fix gets implemented, and the problem either persists or reappears six months later. Why? Because nobody stopped to ask whether they were solving the right problem.',
    ],
    keyTakeaways: [
      'The jump-to-solution reflex is the single biggest obstacle to lasting improvement',
      'Most organizations solve symptoms, not root causes — which is why problems recur',
      'Structured problem solving is a learnable discipline, not an innate talent',
      'The cost of solving the wrong problem is always higher than the cost of slowing down to define the right one',
    ],
  },
  ch02: {
    summary:
      'What PIPS is, where it came from, and why it works. A clear overview of the six-step framework and its intellectual heritage.',
    previewParagraphs: [
      'PIPS stands for Process Improvement and Problem Solving. It is a structured, six-step methodology that guides teams from problem identification through implementation and evaluation.',
      "The framework has its roots in Xerox Corporation's Problem Solving Process, developed in the 1980s as part of their quality revolution. But PIPS is not a historical artifact. It has been adapted, simplified, and tested in environments where theory meets practice.",
    ],
    keyTakeaways: [
      'PIPS is built on proven foundations — Deming, Ishikawa, Lewin, Osborn — adapted for modern teams',
      'The six steps create a discipline that prevents the most common problem-solving mistakes',
      'Accessibility is the core design principle: same framework for individual contributors and senior leaders',
      'The cycle is continuous — Step 6 feeds back into Step 1',
    ],
  },
  ch03: {
    summary:
      'The three principles that underpin every PIPS decision: Data Over Opinions, Expand Then Contract, and Close The Loop.',
    previewParagraphs: [
      'Before you learn the steps, you need to understand the principles. PIPS is built on three core ideas that guide every decision, every tool, and every meeting in the methodology.',
      'Data Over Opinions means that every claim, every diagnosis, and every recommendation must be grounded in evidence. Not gut feelings. Not the opinion of the loudest person in the room. Data.',
    ],
    keyTakeaways: [
      'Data Over Opinions: measure before you act, and measure again after',
      'Expand Then Contract: diverge first (generate many options), then converge (select objectively)',
      'Close The Loop: every cycle ends with evaluation that feeds the next cycle',
      'These three principles prevent the most common process improvement failures',
    ],
  },
  ch04: {
    summary:
      'Step 1: Identify. How to define a clear, measurable problem statement that the whole team agrees on. The foundation of every successful improvement project.',
    previewParagraphs: [
      'Every PIPS project starts here. Step 1 is about defining what you are solving before you try to solve it. It sounds obvious, but it is the step most teams want to rush past.',
      'A well-written problem statement describes three things: the current state (As-Is), the desired state, and the measurable gap between them. Notice what is not in that list: solutions, blame, or assumptions about causes.',
    ],
    keyTakeaways: [
      'A problem statement defines As-Is, Desired State, and measurable Gap',
      'Never include a solution in the problem statement',
      'Quantify the gap with data — percentages, dollars, time, error counts',
      'Team agreement on the problem statement prevents scope creep and misaligned effort',
    ],
  },
  ch05: {
    summary:
      'Step 2: Analyze. Root cause analysis with fishbone diagrams, 5-Why drills, force field analysis, and check sheets. Stop treating symptoms.',
    previewParagraphs: [
      'With a clear problem statement in hand, Step 2 asks the most important question in process improvement: Why? Why does this problem exist? Not what should we do about it — why does it happen?',
      'Root cause analysis is the discipline that separates effective improvement from band-aid fixes. Teams that skip it waste time and resources solving symptoms. Teams that do it well solve problems that stay solved.',
    ],
    keyTakeaways: [
      'Start broad with the Fishbone Diagram, then drill deep with the 5-Why technique',
      'Involve the people closest to the work — they see causes that data and leadership miss',
      'Validate suspected root causes with data before moving to solutions',
      'A problem with multiple root causes may need multiple improvement cycles',
    ],
  },
  ch06: {
    summary:
      'Step 3: Generate. Brainstorming and brainwriting techniques that produce innovative solutions by deferring judgment and maximizing participation.',
    previewParagraphs: [
      'Step 3 is where the "Expand Then Contract" principle is most visible. Before you can pick the best solution, you need many solutions to choose from. The more ideas you generate, the higher the chance of finding something truly innovative.',
      "The ground rules are simple: no criticism, quantity matters, build on others' ideas, and wild ideas are welcome. Judgment is deferred until Step 4.",
    ],
    keyTakeaways: [
      'Quantity over quality in idea generation — the best ideas often come after the obvious ones',
      'Brainwriting (6-3-5) ensures equal participation, especially for quieter team members',
      'Separating idea generation from evaluation is critical — they use different cognitive modes',
      'Set a numerical target to push past the obvious: 30 ideas in 15 minutes',
    ],
  },
  ch07: {
    summary:
      'Step 4: Select & Plan. Objective decision-making with criteria matrices, paired comparisons, RACI charts, and implementation planning.',
    previewParagraphs: [
      'Step 4 is where divergent thinking becomes convergent thinking. The ideas generated in Step 3 now face objective evaluation. The goal is to select the best solution on evidence, not opinion, and then plan its execution in detail.',
      'The criteria matrix is the workhorse of this step. Define what matters, weight each criterion by importance, score each solution, and let the math decide.',
    ],
    keyTakeaways: [
      'Set evaluation criteria and weights before scoring solutions to prevent bias',
      'Every task in the implementation plan needs exactly one Accountable person (RACI)',
      'Build the plan backward from the target date to surface unrealistic timelines',
      'Include risk mitigation and a rollback plan — hope is not a strategy',
    ],
  },
  ch08: {
    summary:
      'Step 5: Implement. Execution with milestone tracking, task checklists, change management, and stakeholder communication.',
    previewParagraphs: [
      'Plans are only as good as their execution. Step 5 is where the rubber meets the road. The team executes the implementation plan, tracks progress against milestones, surfaces blockers early, and manages change.',
      'The shift from planning to execution requires a different facilitation style. Instead of long workshops, Step 5 runs on regular, brief check-ins — weekly stand-ups, milestone reviews, and real-time checklist updates.',
    ],
    keyTakeaways: [
      'Run a pilot before full rollout to catch issues early with lower risk',
      'Weekly stand-ups surface blockers before they become crises',
      'Document deviations from the plan — they feed lessons learned in Step 6',
      'Celebrate milestone completions to maintain team momentum through long implementations',
    ],
  },
  ch09: {
    summary:
      'Step 6: Evaluate. Measuring results with before-after comparisons, structured retrospectives, and lessons learned that feed the next cycle.',
    previewParagraphs: [
      'The cycle closes in Step 6. This is where "Close The Loop" becomes more than a principle — it becomes a practice. The team measures whether the improvement hit its targets, captures what they learned, and decides what happens next.',
      'The before-after comparison is simple but powerful: the same metrics, measured the same way, compared across the same time period. Did the gap close?',
    ],
    keyTakeaways: [
      'Compare the same metrics you defined in Step 1 — never move the goalposts',
      'Run a structured retrospective while memories are fresh',
      'Decide explicitly: standardize, iterate, or start a new cycle',
      'Share lessons learned with the broader organization — improvement compounds across teams',
    ],
  },
  ch10: {
    summary:
      'PIPS works in every department — IT, operations, finance, HR, marketing, clinical. This chapter shows how the framework adapts to different contexts.',
    previewParagraphs: [
      'One of the most common objections to process improvement is "That works in manufacturing, but we are different." Every department believes its work is unique. And they are right — the content of the work varies. But the structure of problem solving does not.',
      'The six PIPS steps work the same whether you are fixing a claims processing error, reducing employee onboarding time, or improving marketing campaign conversion rates. The tools are the same. The discipline is the same.',
    ],
    keyTakeaways: [
      'PIPS adapts to any department — the steps and tools are universal',
      'The content of problems varies; the structure of solving them does not',
      'Cross-departmental PIPS projects reveal systemic issues that no single team can see',
    ],
  },
  ch11: {
    summary:
      'How to scale PIPS from a single team to an entire organization. Training, governance, and the infrastructure for enterprise-wide improvement.',
    previewParagraphs: [
      'A single successful PIPS project proves the methodology works. Scaling it across an organization requires something more: infrastructure, training, governance, and cultural reinforcement.',
      'Scaling PIPS does not mean mandating it from the top. It means making it easy, visible, and rewarding. Teams that see other teams succeed with PIPS will adopt it voluntarily.',
    ],
    keyTakeaways: [
      'Start with pilot teams, demonstrate results, then scale through proof rather than mandate',
      'Train facilitators, not just participants — skilled facilitation is the multiplier',
      'Create a central repository of completed PIPS projects so teams learn from each other',
      'Leadership must participate, not just sponsor — their involvement signals that improvement matters',
    ],
  },
  ch12: {
    summary:
      'Building a culture where continuous improvement is not a program but a permanent operating discipline. The hardest and most valuable chapter in the book.',
    previewParagraphs: [
      'Culture is the ultimate determinant of whether PIPS survives beyond the first project. You can train every person in the organization, buy the best tools, and set up the most elegant governance — but if the culture does not support continuous improvement, it will not last.',
      'Building an improvement culture is not about posters on the wall. It is about what gets rewarded, what gets measured, and what leaders pay attention to.',
    ],
    keyTakeaways: [
      'Culture is built through consistent behavior, not declarations or programs',
      'Reward improvement effort, not just improvement results — the process matters',
      'Make improvement visible: share projects, celebrate completions, publish lessons learned',
      'Leaders who ask "What have we improved this quarter?" set the cultural tone',
    ],
  },
  ch13: {
    summary:
      "The Facilitator's Playbook. Practical guidance for running PIPS sessions — room setup, timing, difficult participants, and group dynamics.",
    previewParagraphs: [
      'A skilled facilitator can make a mediocre team produce excellent results. An unskilled facilitator can make an excellent team produce mediocre results. Facilitation is the multiplier that determines how well PIPS actually works in practice.',
      'This chapter is a practical playbook — room setup, timing guides, techniques for handling difficult participants, and strategies for maintaining energy through long workshops.',
    ],
    keyTakeaways: [
      "The facilitator's job is to manage the process, not contribute content",
      'Silent writing before group discussion prevents groupthink and anchoring',
      'Time-box every activity — open-ended discussions are where sessions go to die',
      'Handle dominant voices privately ("I value your input — can you hold back so others contribute?")',
    ],
  },
  ch14: {
    summary:
      'When PIPS fails. Honest examination of common failure modes, anti-patterns, and how to recognize and recover from them.',
    previewParagraphs: [
      'PIPS does not always work. No methodology does. This chapter examines the most common failure modes — not to discourage you, but to arm you with the pattern recognition to see trouble coming.',
      'The most dangerous failure mode is not a bad fishbone diagram or a weak criteria matrix. It is the organizational failure to follow through. Teams do the analysis, pick a solution, build a plan, and then nothing happens.',
    ],
    keyTakeaways: [
      'The most common failure is not analytical — it is organizational: leadership does not follow through',
      'Skipping steps creates a cascade of failures downstream',
      'If the team cannot agree on the problem statement, the project is not ready',
      'Failed PIPS projects still teach — capture the lessons and feed them forward',
    ],
  },
  ch15: {
    summary:
      'PIPS as a living system. How continuous improvement compounds over time, creating organizational resilience that no single project can deliver.',
    previewParagraphs: [
      "The power of PIPS is not in any single project. It is in the compounding effect of many projects over time. Each cycle makes the organization a little better. Each lesson learned prevents a future mistake. Each trained facilitator multiplies the methodology's reach.",
      'Organizations that practice continuous improvement for years develop a resilience that is hard to see but impossible to miss. They adapt faster. They recover from disruptions more quickly. They attract and retain better talent.',
    ],
    keyTakeaways: [
      'Continuous improvement compounds — each cycle builds on the last',
      'Organizational resilience emerges from the discipline of repeated PIPS cycles',
      'The "never-ending quest" is not exhausting — it is energizing when the culture supports it',
      'You never have to be perfect. You just have to keep getting better.',
    ],
  },
  'appendix-a': {
    summary:
      'A complete reference for every PIPS tool — when to use it, how to use it, and common mistakes to avoid.',
    previewParagraphs: [
      'This appendix provides a quick-reference guide to every tool in the PIPS toolkit: Problem Statement, Fishbone Diagram, 5-Why Analysis, Force Field Analysis, Check Sheet, Brainstorming, Brainwriting, Criteria Matrix, Paired Comparisons, RACI Chart, Implementation Plan, Milestone Tracker, Before & After Comparison, Evaluation Summary, and Lessons Learned.',
    ],
    keyTakeaways: [
      'Every tool has a specific purpose tied to a specific PIPS step',
      'Tools are designed to be used by any team member without specialized training',
      'Common mistakes are listed for each tool so teams can avoid known pitfalls',
    ],
  },
  'appendix-b': {
    summary:
      'A one-page quick reference card summarizing all 6 PIPS steps, their tools, and key questions.',
    previewParagraphs: [
      'Print this page and keep it visible. It summarizes the entire PIPS methodology on a single reference card: the 6 steps, the tools used in each step, the key questions to ask, and the completion criteria before moving on.',
    ],
    keyTakeaways: [
      'The entire PIPS methodology fits on a single reference card',
      'Post it in team areas, meeting rooms, and project spaces',
      'Use it as a facilitation checklist to ensure no step is skipped',
    ],
  },
}
