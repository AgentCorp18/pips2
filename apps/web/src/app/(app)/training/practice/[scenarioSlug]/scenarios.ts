type ScenarioStep = {
  step: number
  title: string
  description: string
  prompt: string
}

type ScenarioData = {
  slug: string
  title: string
  description: string
  context: string
  estimatedMinutes: number
  steps: ScenarioStep[]
}

export const PRACTICE_SCENARIOS: Record<string, ScenarioData> = {
  'parking-lot-guided': {
    slug: 'parking-lot-guided',
    title: 'Parking Lot Problem — Guided Walkthrough',
    description:
      'Practice the first three PIPS steps with a simple, relatable scenario about a parking lot problem at a mid-size office building.',
    context:
      'You are the operations manager at a 200-person office building. Over the past three months, employees have been complaining that there are never enough parking spaces. The lot has 150 spaces for 200 employees. Complaints have increased from 2 per week to 12 per week. Some employees are arriving 30 minutes early just to secure a spot, while others are parking illegally on nearby streets and receiving tickets.',
    estimatedMinutes: 20,
    steps: [
      {
        step: 1,
        title: 'Write the Problem Statement',
        description:
          'Define the problem using the PIPS problem statement framework. Remember the cardinal rule: never embed a solution in the problem statement.',
        prompt:
          'Write a clear problem statement that describes the gap between the current state and the desired state. Include measurable data where possible. Do NOT suggest any solutions in your problem statement.',
      },
      {
        step: 2,
        title: 'Analyze Root Causes',
        description:
          'Use a fishbone approach to identify potential root causes across categories like People, Process, Environment, and Equipment.',
        prompt:
          'List at least 3 categories of potential causes and identify 2-3 specific causes in each category. For example, under "Process" you might list shift scheduling patterns. Think broadly before narrowing down.',
      },
      {
        step: 3,
        title: 'Generate Solutions',
        description:
          'Brainstorm at least 8 potential solutions. Remember the brainstorming rules: defer judgment, go for quantity, encourage wild ideas, and build on others.',
        prompt:
          'List at least 8 potential solutions. Include a mix of quick fixes and longer-term structural changes. Do not evaluate or filter ideas yet — quantity over quality at this stage.',
      },
    ],
  },

  'onboarding-delays-full': {
    slug: 'onboarding-delays-full',
    title: 'Employee Onboarding Delays — Full Cycle',
    description:
      'Work through all six PIPS steps on a real-world scenario about slow employee onboarding that is causing new hire frustration and productivity loss.',
    context:
      'You are the HR director at a 500-person technology company. New hires are taking an average of 6 weeks to become fully productive, compared to an industry benchmark of 3 weeks. Exit interviews from the first year show that 40% of voluntary departures cite "poor onboarding experience" as a factor. IT equipment takes 5 business days to provision, training materials are outdated, and there is no standardized onboarding checklist across departments.',
    estimatedMinutes: 45,
    steps: [
      {
        step: 1,
        title: 'Define the Problem',
        description: 'Write a clear, measurable problem statement.',
        prompt:
          'Write a problem statement that captures the gap between the current onboarding timeline (6 weeks) and the target (3 weeks). Include the business impact (turnover, productivity loss) without suggesting any solutions.',
      },
      {
        step: 2,
        title: 'Root Cause Analysis',
        description: 'Identify root causes using fishbone and 5-Why techniques.',
        prompt:
          'Build a fishbone analysis with categories: People, Process, Technology, Policy, Environment. Then pick the top cause and drill down with 5 Whys to find the root cause.',
      },
      {
        step: 3,
        title: 'Generate Solutions',
        description: 'Brainstorm potential solutions without filtering.',
        prompt:
          'Generate at least 10 potential solutions addressing the root causes you identified. Include both quick wins (< 1 week to implement) and structural changes (1-3 months).',
      },
      {
        step: 4,
        title: 'Select and Plan',
        description: 'Evaluate solutions and create an implementation plan.',
        prompt:
          'Choose your top 3 solutions and evaluate them against these criteria: cost, time to implement, expected impact, and ease of adoption. Select the best option and outline a 3-milestone implementation plan with owners and dates.',
      },
      {
        step: 5,
        title: 'Implementation Plan',
        description: 'Detail the execution steps.',
        prompt:
          'Write a concrete implementation plan for your selected solution. Include: (1) three specific milestones with deadlines, (2) who is responsible for each, (3) what resources are needed, (4) how you will communicate changes to the organization.',
      },
      {
        step: 6,
        title: 'Evaluate Results',
        description: 'Plan how you will measure success and close the loop.',
        prompt:
          'Describe how you will evaluate the solution after 90 days. What metrics will you track? What does success look like? What will you do if onboarding time drops to 4 weeks but not 3? Describe your three possible outcome paths.',
      },
    ],
  },

  'stalled-analysis-team': {
    slug: 'stalled-analysis-team',
    title: 'Stalled Analysis Team — Facilitation Challenge',
    description:
      'Practice facilitating a team that has stalled in Step 2 (Analyze). Diagnose the blockage and guide the team forward.',
    context:
      'You are facilitating a PIPS team of six people investigating why customer claims rejections have increased by 30% over the past quarter. The team completed Step 1 with a solid problem statement, but they have been stuck in Step 2 for three weeks. Two team members dominate discussions, one person has not spoken in two meetings, and the group keeps debating opinions instead of collecting data. The team lead is frustrated and considering abandoning the PIPS approach.',
    estimatedMinutes: 20,
    steps: [
      {
        step: 2,
        title: 'Diagnose the Blockage',
        description: 'Identify why the team is stuck and plan your facilitation intervention.',
        prompt:
          'As the facilitator, diagnose why this team is stuck. Identify at least 3 specific problems (participation imbalance, opinion vs. data, etc.) and describe what facilitation technique you would use for each. Reference the PIPS principles in your answer.',
      },
      {
        step: 3,
        title: 'Guide Forward',
        description: 'Plan how to move the team from analysis to solution generation.',
        prompt:
          'Describe how you would transition this team from Step 2 to Step 3. What specific actions would you take in the next meeting? How would you ensure the quiet team member participates? Would you use brainstorming or brainwriting, and why?',
      },
    ],
  },

  'certification-full-scenario': {
    slug: 'certification-full-scenario',
    title: 'Employee Turnover Crisis — Certification Assessment',
    description:
      'Demonstrate your facilitator skills by guiding a team through all six PIPS steps on an employee turnover problem.',
    context:
      'You are the lead facilitator for a cross-functional PIPS team at a regional healthcare network. The shipping/receiving department has 35% annual turnover compared to 12% company-wide. The department has 40 employees, meaning about 14 people leave each year. Replacement cost is estimated at $8,500 per position. The department manager believes the solution is higher wages, but no data has been collected to verify this assumption. Your team includes: the department manager, two frontline employees, an HR representative, a finance analyst, and you as facilitator.',
    estimatedMinutes: 60,
    steps: [
      {
        step: 1,
        title: 'Facilitate Problem Identification',
        description: 'Guide the team to write a proper problem statement.',
        prompt:
          'The department manager opens by saying "We need to pay people more — that is the problem." As facilitator, how do you redirect this to a proper problem statement? Write the problem statement you would guide the team to create. Explain your facilitation choices.',
      },
      {
        step: 2,
        title: 'Lead the Analysis',
        description: 'Facilitate root cause analysis with a diverse team.',
        prompt:
          'Design a fishbone analysis session for this team. What categories would you use? How would you ensure the frontline employees feel safe contributing? What data collection plan would you propose? Include at least 5 potential root causes across different categories.',
      },
      {
        step: 3,
        title: 'Facilitate Solution Generation',
        description: 'Choose and run the right brainstorming technique.',
        prompt:
          'Would you use traditional brainstorming, round-robin, or brainwriting for this team? Justify your choice based on the team composition. Then list 10 potential solutions you would expect the team to generate.',
      },
      {
        step: 4,
        title: 'Guide Solution Selection',
        description: 'Help the team evaluate and select the best solution.',
        prompt:
          'Design a criteria matrix for this team. What criteria would you propose (cost, time, impact, etc.) and how would you facilitate the weighting discussion? When the department manager pushes for the highest-weight on cost, how do you handle that as facilitator?',
      },
      {
        step: 5,
        title: 'Plan Implementation',
        description: 'Create an implementation plan with the team.',
        prompt:
          'Draft a 3-milestone implementation plan. Assign RACI roles using the actual team members (manager, frontline employees, HR, finance). How do you handle resistance from the department manager if the selected solution is not "more money"?',
      },
      {
        step: 6,
        title: 'Design the Evaluation',
        description: 'Set up the evaluation framework.',
        prompt:
          'What metrics will you track to evaluate success? At what interval (30, 60, 90 days)? What are the three possible outcome paths, and what triggers each one? How do you ensure the team stays engaged through the evaluation period?',
      },
    ],
  },
}
