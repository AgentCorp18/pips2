/**
 * Project Templates — Pre-filled project data for various industries/use cases.
 * Each template creates a project at a specific step with pre-filled forms.
 */

export type ProjectTemplateForm = {
  step: string
  form_type: string
  title: string
  data: Record<string, unknown>
}

export type ProjectTemplateStep = {
  step: string
  status: 'completed' | 'in_progress' | 'not_started'
}

export type ProjectTemplate = {
  id: string
  name: string
  description: string
  industry: string
  currentStep: string
  steps: ProjectTemplateStep[]
  forms: ProjectTemplateForm[]
}

const STEP_LIST: ProjectTemplateStep[] = [
  { step: 'identify', status: 'not_started' },
  { step: 'analyze', status: 'not_started' },
  { step: 'generate', status: 'not_started' },
  { step: 'select_plan', status: 'not_started' },
  { step: 'implement', status: 'not_started' },
  { step: 'evaluate', status: 'not_started' },
]

const makeSteps = (completedThrough: number): ProjectTemplateStep[] =>
  STEP_LIST.map((s, i) => ({
    ...s,
    status:
      i < completedThrough ? 'completed' : i === completedThrough ? 'in_progress' : 'not_started',
  }))

/* ============================================================
   Template 1: Parking Lot Safety (existing)
   ============================================================ */

const parkingLotSafety: ProjectTemplate = {
  id: 'parking-lot-safety',
  name: 'Parking Lot Safety Improvement',
  description:
    'The company parking lot has 3x more safety incidents than the industry average. Pre-filled through Steps 1-2.',
  industry: 'Facilities / Safety',
  currentStep: 'generate',
  steps: makeSteps(2),
  forms: [
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Parking Lot Safety — Problem Statement',
      data: {
        asIs: 'The company parking lot averages 4.5 safety incidents per quarter, compared to the industry average of 1.5 incidents per quarter.',
        desired:
          'Reduce parking lot incidents to match or beat the industry average of 1.5 per quarter within 6 months.',
        gap: 'Current incident rate is 3x the industry average, driven by poor lighting, unclear lane markings, and lack of pedestrian walkways.',
        problemStatement:
          'Parking lot has 3x more incidents than industry average, resulting in employee injuries, liability costs, and reduced workplace satisfaction.',
        teamMembers: ['Facilities Manager', 'Safety Officer', 'HR Director'],
        problemArea: 'Workplace Safety',
        dataSources: [
          'Incident reports (last 12 months)',
          'Insurance claims',
          'Employee safety survey',
          'Industry benchmark data',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Parking Lot Safety — Impact Assessment',
      data: {
        financialImpact:
          '$50,000/year in insurance premiums, medical costs, and lost productivity from incidents.',
        customerImpact:
          'High — Visitors and clients have expressed concern about lot safety during site visits.',
        employeeImpact:
          'Critical — 68% of employees report feeling unsafe in the parking lot, especially during early morning and evening hours.',
        processImpact:
          'Moderate — Incident investigations consume 15+ hours of management time per quarter.',
        severityRating: 4,
        frequencyRating: 4,
        detectionRating: 2,
        riskPriorityNumber: 32,
      },
    },
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Parking Lot Safety — Fishbone Diagram',
      data: {
        problemStatement: 'Parking lot has 3x more safety incidents than industry average',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'Drivers exceeding speed limits in lot',
                subCauses: ['No speed enforcement', 'Late arrivals rushing'],
              },
              {
                text: 'Pedestrians not using designated walkways',
                subCauses: ['Walkways are unclear or missing'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'No incident reporting process until after injury',
                subCauses: [],
              },
              {
                text: 'Parking rules not communicated to new hires',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: '40% of lot lights are burned out or dim',
                subCauses: ['No maintenance schedule'],
              },
              {
                text: 'Faded lane markings and stop signs',
                subCauses: ['Last repainted 5 years ago'],
              },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: 'Pothole-damaged pavement creates hazards',
                subCauses: [],
              },
              { text: 'No reflective paint on curbs', subCauses: [] },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Poor drainage causes icy patches in winter',
                subCauses: [],
              },
              {
                text: 'No covered walkway from overflow lot',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No dedicated safety budget for parking areas',
                subCauses: [],
              },
              {
                text: 'Parking lot excluded from annual safety audits',
                subCauses: [],
              },
            ],
          },
        ],
      },
    },
    {
      step: 'analyze',
      form_type: 'five_why',
      title: 'Parking Lot Safety — Five Why Analysis',
      data: {
        problemStatement: 'Parking lot has 3x more safety incidents than industry average',
        whys: [
          {
            question: 'Why do incidents occur so frequently?',
            answer:
              'Drivers and pedestrians share the same poorly lit, unmarked paths through the lot.',
          },
          {
            question: 'Why are paths poorly lit and unmarked?',
            answer:
              '40% of lights are burned out and lane markings have not been repainted in 5 years.',
          },
          {
            question: 'Why has maintenance been neglected?',
            answer: 'The parking lot has no dedicated maintenance budget or schedule.',
          },
          {
            question: 'Why is there no maintenance budget?',
            answer:
              'Parking lot safety was never included in the annual facilities safety audit scope.',
          },
          {
            question: 'Why was it excluded from the safety audit?',
            answer:
              'The audit scope was set when the lot was small. As the company grew 3x, the lot was expanded but never added to the safety program.',
          },
        ],
        rootCause:
          'Parking lot infrastructure and safety protocols were never updated to match company growth, leaving maintenance and safety oversight gaps.',
      },
    },
  ],
}

/* ============================================================
   Template 2: Customer Onboarding Speed
   ============================================================ */

const customerOnboarding: ProjectTemplate = {
  id: 'customer-onboarding',
  name: 'Customer Onboarding Speed',
  description:
    'New customer onboarding takes 14 days average vs. 5-day industry benchmark. Pre-filled through Step 1.',
  industry: 'Customer Success',
  currentStep: 'analyze',
  steps: makeSteps(1),
  forms: [
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Customer Onboarding — Problem Statement',
      data: {
        asIs: 'New customer onboarding takes an average of 14 business days from contract signing to first productive use of the platform.',
        desired:
          'Reduce onboarding time to 5 business days or less, matching the top-quartile industry benchmark.',
        gap: 'Onboarding is 2.8x slower than the benchmark due to manual data migration, sequential (not parallel) setup tasks, and waiting on customer IT approval.',
        problemStatement:
          'Customer onboarding averages 14 days vs. 5-day benchmark, causing delayed time-to-value, increased churn risk during onboarding, and support ticket overload.',
        teamMembers: [
          'Customer Success Manager',
          'Solutions Engineer',
          'Product Manager',
          'Support Team Lead',
        ],
        problemArea: 'Customer Experience',
        dataSources: [
          'CRM onboarding duration reports (last 6 months)',
          'Customer satisfaction surveys (onboarding NPS)',
          'Support ticket volume during onboarding',
          'Churn analysis — onboarding stage drop-offs',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Customer Onboarding — Impact Assessment',
      data: {
        financialImpact:
          '$180,000/year in delayed revenue recognition and estimated $95,000 in avoidable churn from customers who disengage during long onboarding.',
        customerImpact:
          'Critical — Onboarding NPS is 32 (vs. 65 post-onboarding). 23% of churned customers cite onboarding experience.',
        employeeImpact:
          'High — CS team spends 60% of time on manual onboarding tasks, limiting proactive account management.',
        processImpact:
          'High — Sequential handoffs between Sales, CS, and Engineering create 3-4 days of idle wait time per customer.',
        severityRating: 4,
        frequencyRating: 5,
        detectionRating: 3,
        riskPriorityNumber: 60,
      },
    },
  ],
}

/* ============================================================
   Template 3: Employee Turnover Reduction
   ============================================================ */

const employeeTurnover: ProjectTemplate = {
  id: 'employee-turnover',
  name: 'Employee Turnover Reduction',
  description:
    'Annual voluntary turnover at 28% vs. 15% industry average, concentrated in the first 12 months. Pre-filled through Step 1.',
  industry: 'Human Resources',
  currentStep: 'analyze',
  steps: makeSteps(1),
  forms: [
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Employee Turnover — Problem Statement',
      data: {
        asIs: 'Annual voluntary turnover rate is 28%, with 65% of departures occurring within the first 12 months of employment.',
        desired:
          'Reduce overall voluntary turnover to 15% (industry average) and first-year turnover to under 20% within 12 months.',
        gap: 'Turnover is nearly double the industry average. Exit interviews reveal themes: unclear career paths, inadequate onboarding, and manager relationship issues.',
        problemStatement:
          'Voluntary turnover at 28% (vs. 15% benchmark) costs an estimated $1.2M annually in recruiting, training, and lost productivity, with the majority leaving in their first year.',
        teamMembers: [
          'VP of People',
          'Recruiting Manager',
          'L&D Lead',
          'Department Managers (Engineering, Sales)',
        ],
        problemArea: 'Employee Retention',
        dataSources: [
          'HRIS turnover reports (24-month trend)',
          'Exit interview summaries',
          'Employee engagement survey results',
          'Glassdoor reviews and sentiment analysis',
          'Industry benchmark data (SHRM)',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Employee Turnover — Impact Assessment',
      data: {
        financialImpact:
          '$1.2M/year — average cost-per-hire of $8,500 plus 3-month ramp time valued at $15,000 per new employee.',
        customerImpact:
          'Moderate — Customer-facing roles (Sales, Support) experience knowledge loss. Account handoffs during turnover correlate with 12% drop in renewal rates.',
        employeeImpact:
          'Critical — Remaining employees report burnout and increased workload. Team morale scores dropped 18% year-over-year.',
        processImpact:
          'High — Each departure triggers 40+ hours of recruiting, interviewing, and onboarding. Institutional knowledge loss impacts project continuity.',
        severityRating: 5,
        frequencyRating: 4,
        detectionRating: 2,
        riskPriorityNumber: 40,
      },
    },
  ],
}

/* ============================================================
   Exports
   ============================================================ */

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  parkingLotSafety,
  customerOnboarding,
  employeeTurnover,
]

export const getProjectTemplate = (id: string): ProjectTemplate | undefined =>
  PROJECT_TEMPLATES.find((t) => t.id === id)
