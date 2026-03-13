/**
 * Project Templates — Pre-filled project data for various industries/use cases.
 * Each template creates a project at a specific step with pre-filled forms.
 *
 * Templates overview:
 * 1. parking-lot-safety         — Facilities / Safety       — Completed (6/6)
 * 2. customer-onboarding        — Customer Success          — Completed (6/6)
 * 3. manufacturing-defect       — Production / QA           — Step 5 Implement (4/6)
 * 4. employee-turnover          — Human Resources           — Step 4 Select & Plan (3/6)
 * 5. it-helpdesk-response       — IT Operations             — Step 3 Generate (2/6)
 * 6. warehouse-inventory        — Logistics                 — Step 2 Analyze (1/6)
 * 7. patient-wait-time          — Healthcare                — Step 1 Identify (0/6)
 * 8. software-release-cycle     — Engineering               — Completed (6/6)
 * 9. energy-consumption         — Sustainability            — Step 4 Select & Plan (3/6)
 * 10. invoice-processing        — Finance / AP              — Step 3 Generate (2/6)
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

export type ProjectTemplateTicket = {
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'critical' | 'high' | 'medium' | 'low'
  type: 'task' | 'bug' | 'improvement' | 'investigation'
}

export type ProjectTemplate = {
  id: string
  name: string
  description: string
  industry: string
  currentStep: string
  steps: ProjectTemplateStep[]
  forms: ProjectTemplateForm[]
  tickets: ProjectTemplateTicket[]
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
   Template 1: Parking Lot Safety (COMPLETED — all 6 steps)
   ============================================================ */

const parkingLotSafety: ProjectTemplate = {
  id: 'parking-lot-safety',
  name: 'Parking Lot Safety Improvement',
  description:
    'The company parking lot has 3x more safety incidents than the industry average. Fully completed PIPS project demonstrating all 6 steps.',
  industry: 'Facilities / Safety',
  currentStep: 'evaluate',
  steps: makeSteps(6),
  forms: [
    // Step 1 — Identify
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
    // Step 2 — Analyze
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
    // Step 3 — Generate
    {
      step: 'generate',
      form_type: 'brainstorming',
      title: 'Parking Lot Safety — Brainstorming',
      data: {
        ideas: [
          {
            id: '00000001-0001-0001-0001-000000000001',
            text: 'Replace all burned-out parking lot lights with LED fixtures on a quarterly maintenance schedule',
            author: 'Facilities Manager',
            votes: 5,
            category: 'Infrastructure',
          },
          {
            id: '00000001-0001-0001-0001-000000000002',
            text: 'Repaint lane markings, stop bars, and add high-visibility pedestrian crosswalks',
            author: 'Safety Officer',
            votes: 5,
            category: 'Infrastructure',
          },
          {
            id: '00000001-0001-0001-0001-000000000003',
            text: 'Install speed bumps at lot entrance and near building entrances',
            author: 'HR Director',
            votes: 4,
            category: 'Traffic Control',
          },
          {
            id: '00000001-0001-0001-0001-000000000004',
            text: 'Add dedicated pedestrian walkway with bollards separating it from vehicle lanes',
            author: 'Facilities Manager',
            votes: 5,
            category: 'Infrastructure',
          },
          {
            id: '00000001-0001-0001-0001-000000000005',
            text: 'Install parking lot safety signage (speed limit, pedestrian crossing, caution zones)',
            author: 'Safety Officer',
            votes: 3,
            category: 'Signage',
          },
          {
            id: '00000001-0001-0001-0001-000000000006',
            text: 'Add parking lot safety orientation to new hire onboarding checklist',
            author: 'HR Director',
            votes: 3,
            category: 'Training',
          },
          {
            id: '00000001-0001-0001-0001-000000000007',
            text: 'Repair potholes and resurface damaged pavement sections',
            author: 'Facilities Manager',
            votes: 4,
            category: 'Infrastructure',
          },
          {
            id: '00000001-0001-0001-0001-000000000008',
            text: 'Install drainage improvements to prevent winter ice accumulation',
            author: 'Facilities Manager',
            votes: 3,
            category: 'Infrastructure',
          },
        ],
        selectedIdeas: [
          '00000001-0001-0001-0001-000000000001',
          '00000001-0001-0001-0001-000000000002',
          '00000001-0001-0001-0001-000000000003',
          '00000001-0001-0001-0001-000000000004',
          '00000001-0001-0001-0001-000000000006',
        ],
        eliminatedIdeas: [],
      },
    },
    // Step 4 — Select & Plan
    {
      step: 'select_plan',
      form_type: 'criteria_matrix',
      title: 'Parking Lot Safety — Criteria Matrix',
      data: {
        criteria: [
          { name: 'Cost', weight: 8, description: 'Total implementation cost within budget' },
          { name: 'Speed', weight: 7, description: 'How quickly can this be implemented?' },
          {
            name: 'Impact',
            weight: 10,
            description: 'Expected reduction in incident rate',
          },
          {
            name: 'Sustainability',
            weight: 6,
            description: 'Long-term maintenance burden',
          },
        ],
        solutions: [
          {
            name: 'Full Infrastructure Overhaul',
            scores: { Cost: 2, Speed: 2, Impact: 5, Sustainability: 5 },
          },
          {
            name: 'Lighting + Markings + Walkway (Recommended)',
            scores: { Cost: 4, Speed: 4, Impact: 5, Sustainability: 4 },
          },
          {
            name: 'Signage + Training Only',
            scores: { Cost: 5, Speed: 5, Impact: 2, Sustainability: 3 },
          },
        ],
      },
    },
    {
      step: 'select_plan',
      form_type: 'implementation_plan',
      title: 'Parking Lot Safety — Implementation Plan',
      data: {
        selectedSolution: 'Lighting + Markings + Walkway (Recommended)',
        tasks: [
          {
            id: '00000001-0002-0001-0001-000000000001',
            title: 'Audit and replace all burned-out lighting fixtures with LED',
            assignee: 'Facilities Manager',
            dueDate: '2024-02-15',
            status: 'completed',
            notes: 'Phase 1: Replace 40% non-functional lights. Budget approved.',
          },
          {
            id: '00000001-0002-0001-0001-000000000002',
            title: 'Repaint all lane markings, stop bars, and pedestrian crossings',
            assignee: 'Facilities Manager',
            dueDate: '2024-02-28',
            status: 'completed',
            notes: 'Contracted with RoadMark Pro. Weather window: Feb 20-25.',
          },
          {
            id: '00000001-0002-0001-0001-000000000003',
            title: 'Install speed bumps at lot entrance and building entrances',
            assignee: 'Facilities Manager',
            dueDate: '2024-03-10',
            status: 'completed',
            notes: '3 speed bumps installed. Painted yellow with signage.',
          },
          {
            id: '00000001-0002-0001-0001-000000000004',
            title: 'Install bollard-protected pedestrian walkway',
            assignee: 'Facilities Manager',
            dueDate: '2024-03-20',
            status: 'completed',
            notes: 'Main walkway from overflow lot to building entrance.',
          },
          {
            id: '00000001-0002-0001-0001-000000000005',
            title: 'Add parking safety to new hire orientation checklist',
            assignee: 'HR Director',
            dueDate: '2024-03-01',
            status: 'completed',
            notes: 'Updated onboarding checklist and safety video.',
          },
        ],
        timeline: '10 weeks (January 15 – March 31, 2024)',
        resources: 'Facilities team, contracted paving crew, HR for training updates',
        budget: '$28,500 total — lighting $12K, markings $6K, walkway $8K, misc $2.5K',
        risks: [
          {
            risk: 'Winter weather delays outdoor work',
            mitigation: 'Scheduled painting for February weather window; have contingency date',
          },
          {
            risk: 'Budget overrun from unexpected pavement repairs',
            mitigation: 'Reserved 10% contingency in budget',
          },
        ],
      },
    },
    // Step 5 — Implement
    {
      step: 'implement',
      form_type: 'milestone_tracker',
      title: 'Parking Lot Safety — Milestone Tracker',
      data: {
        milestones: [
          {
            id: '00000001-0003-0001-0001-000000000001',
            title: 'Lighting Replacement Complete',
            targetDate: '2024-02-15',
            completedDate: '2024-02-13',
            status: 'completed',
            description: 'All 40% non-functional lights replaced with LED fixtures',
            deliverables: [
              'LED retrofit complete for all 22 pole lights',
              'Maintenance schedule established (quarterly bulb check)',
              'Electrical inspection passed',
            ],
          },
          {
            id: '00000001-0003-0001-0001-000000000002',
            title: 'Pavement Markings Repainted',
            targetDate: '2024-02-28',
            completedDate: '2024-02-26',
            status: 'completed',
            description: 'All lane markings, stop bars, and pedestrian crossings repainted',
            deliverables: [
              'All lane lines repainted in high-visibility white/yellow',
              '3 pedestrian crosswalks added with zebra striping',
              'Curbs painted reflective yellow',
            ],
          },
          {
            id: '00000001-0003-0001-0001-000000000003',
            title: 'Speed Control Installed',
            targetDate: '2024-03-10',
            completedDate: '2024-03-08',
            status: 'completed',
            description: 'Speed bumps installed at key locations',
            deliverables: [
              '3 speed bumps installed (entrance, side entrance, near main door)',
              'Speed limit signs posted',
              'Email to all staff about changes',
            ],
          },
          {
            id: '00000001-0003-0001-0001-000000000004',
            title: 'Pedestrian Walkway Installed',
            targetDate: '2024-03-20',
            completedDate: '2024-03-19',
            status: 'completed',
            description: 'Dedicated pedestrian path with bollard protection from overflow lot',
            deliverables: [
              'Bollards installed along 180ft walkway',
              'Non-slip surface applied',
              'Walkway lighting added',
            ],
          },
          {
            id: '00000001-0003-0001-0001-000000000005',
            title: 'Training & Communication Complete',
            targetDate: '2024-03-01',
            completedDate: '2024-02-28',
            status: 'completed',
            description: 'Staff notified and new hire materials updated',
            deliverables: [
              'All-staff email sent with parking safety reminders',
              'Parking safety added to new hire orientation checklist',
              'Safety video created and embedded in onboarding portal',
            ],
          },
        ],
        overallProgress: 100,
      },
    },
    // Step 6 — Evaluate
    {
      step: 'evaluate',
      form_type: 'before_after',
      title: 'Parking Lot Safety — Before & After',
      data: {
        metrics: [
          {
            name: 'Safety Incidents per Quarter',
            before: 4.5,
            after: 0.8,
            unit: 'incidents',
            improvement: '-82% (from 4.5 to 0.8 — below 1.5 industry average)',
          },
          {
            name: '% Employees Feeling Safe in Lot',
            before: 32,
            after: 91,
            unit: '%',
            improvement: '+59 percentage points',
          },
          {
            name: 'Insurance Premium (Annual)',
            before: 28000,
            after: 21000,
            unit: 'USD',
            improvement: '-$7,000/year (25% reduction)',
          },
          {
            name: 'Management Hours on Incident Investigations',
            before: 15,
            after: 2,
            unit: 'hrs/quarter',
            improvement: '-87% time savings',
          },
        ],
        summary:
          'All four key metrics improved substantially. Incident rate dropped from 4.5 to 0.8 per quarter — now 47% below industry average. Employee safety sentiment jumped from 32% to 91%. Total ROI estimated at 3.2x over 3 years.',
      },
    },
    {
      step: 'evaluate',
      form_type: 'evaluation',
      title: 'Parking Lot Safety — Evaluation',
      data: {
        goalsAchieved: true,
        goalDetails:
          'The primary goal of reducing incidents to industry average (1.5/quarter) was exceeded — current rate is 0.8/quarter. All 5 implementation tasks were completed on time and within budget.',
        effectivenessRating: 5,
        sustainabilityRating: 4,
        teamSatisfactionRating: 5,
        unexpectedOutcomes:
          'The pedestrian walkway became a popular feature — employees now use it year-round and it has improved morale beyond the safety benefit. Two neighboring tenants asked about the contractor we used.',
        recommendations:
          'Add the parking lot to the annual safety audit scope permanently. Consider similar lighting and marking improvements to the loading dock area, which has similar risk factors.',
        nextSteps:
          'Schedule quarterly lighting inspection (April, July, October, January). Annual repainting of lane markings. Include parking safety metrics in monthly safety dashboard.',
      },
    },
    {
      step: 'evaluate',
      form_type: 'lessons_learned',
      title: 'Parking Lot Safety — Lessons Learned',
      data: {
        wentWell: [
          'Early stakeholder buy-in from HR and Safety Officer made budget approval fast',
          'Scheduling the painting contractor during the February weather window avoided delays',
          'Staff communication email created visible accountability and awareness',
          'All work completed on time and 4% under budget',
        ],
        improvements: [
          'Should have done a before-survey of employee safety sentiment at project kickoff',
          'Pavement repairs to potholes were scoped too late and almost delayed the painting',
          'New hire onboarding update could have been done in week 1 rather than week 6',
        ],
        actionItems: [
          {
            description: 'Schedule quarterly parking lot lighting inspection',
            owner: 'Facilities Manager',
            dueDate: '2024-04-01',
          },
          {
            description: 'Add parking lot safety to annual audit scope',
            owner: 'Safety Officer',
            dueDate: '2024-06-01',
          },
          {
            description: 'Review loading dock for similar risk factors',
            owner: 'Facilities Manager',
            dueDate: '2024-05-01',
          },
        ],
        keyTakeaways:
          'Infrastructure investments with clear safety ROI are easy to fund when backed by incident data. The PIPS methodology helped the team prioritize the right combination of solutions rather than just replacing lights.',
      },
    },
  ],
  tickets: [
    {
      title: 'Replace burned-out parking lot lights with LED fixtures',
      description:
        'Audit all 22 pole lights and replace non-functional units with energy-efficient LED fixtures. Establish quarterly maintenance schedule.',
      status: 'done',
      priority: 'critical',
      type: 'task',
    },
    {
      title: 'Repaint lane markings and add pedestrian crosswalks',
      description:
        'Contract paving crew to repaint all lane lines, stop bars, and add three high-visibility zebra-striped pedestrian crossings.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Install speed bumps at lot entrance and building doors',
      description:
        'Install three speed bumps at key locations and post speed limit signage to reduce vehicle speed through the lot.',
      status: 'done',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Construct bollard-protected pedestrian walkway from overflow lot',
      description:
        'Install 180-foot dedicated pedestrian path with bollard separation from vehicle lanes and non-slip surface coating.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Add parking safety to new hire onboarding checklist',
      description:
        'Update onboarding materials to include parking lot safety rules and embed the new safety video in the onboarding portal.',
      status: 'done',
      priority: 'medium',
      type: 'task',
    },
    {
      title: 'Investigate drainage improvements to prevent winter ice',
      description:
        'Assess current drainage capacity in the overflow lot and recommend improvements to eliminate recurring icy patches during winter months.',
      status: 'done',
      priority: 'medium',
      type: 'investigation',
    },
    {
      title: 'Add parking lot to annual facilities safety audit scope',
      description:
        'Update the annual safety audit charter to formally include the parking lot, ensuring ongoing oversight as company headcount grows.',
      status: 'in_review',
      priority: 'medium',
      type: 'improvement',
    },
  ],
}

/* ============================================================
   Template 2: Customer Onboarding Speed (COMPLETED — all 6 steps)
   ============================================================ */

const customerOnboarding: ProjectTemplate = {
  id: 'customer-onboarding',
  name: 'Customer Onboarding Speed',
  description:
    'New customer onboarding takes 14 days average vs. 5-day industry benchmark. Fully completed PIPS project demonstrating the methodology for Customer Success teams.',
  industry: 'Customer Success',
  currentStep: 'evaluate',
  steps: makeSteps(6),
  forms: [
    // Step 1 — Identify
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
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Customer Onboarding — Fishbone Diagram',
      data: {
        problemStatement: 'Customer onboarding averages 14 days vs. 5-day benchmark',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'CS team lacks technical skills to self-serve data migration',
                subCauses: ['No training program', 'Eng team gatekeeps migrations'],
              },
              {
                text: 'Customer contacts slow to respond to setup requests',
                subCauses: ['No urgency communicated at sale', 'Wrong stakeholder engaged'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'Setup tasks are sequential instead of parallel',
                subCauses: ['No workflow management tool', 'Handoffs are ad hoc via email'],
              },
              {
                text: 'No standardized onboarding playbook or checklist',
                subCauses: ['Each CSM does it differently'],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'No self-service data import tool for customers',
                subCauses: ['Engineering backlog item for 18 months'],
              },
              {
                text: 'CRM does not track onboarding task completion',
                subCauses: ['Using email and spreadsheets'],
              },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: 'Customer-facing onboarding guide is outdated',
                subCauses: ['Last updated 2 years ago'],
              },
              {
                text: 'Integration documentation incomplete for top 5 integrations',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Customer IT security reviews add 3-5 day delay',
                subCauses: ['No pre-approved security questionnaire'],
              },
              {
                text: 'Time zone misalignment with international customers',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No SLA or accountability for onboarding completion time',
                subCauses: ['No onboarding time tracked in any dashboard'],
              },
              {
                text: 'Engineering deprioritizes onboarding tooling vs. product features',
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
      title: 'Customer Onboarding — Five Why Analysis',
      data: {
        problemStatement: 'Customer onboarding averages 14 days vs. 5-day benchmark',
        whys: [
          {
            question: 'Why does onboarding take 14 days?',
            answer:
              'Multiple handoffs between Sales, CS, and Engineering happen sequentially with 1-2 day gaps between each.',
          },
          {
            question: 'Why are handoffs sequential and slow?',
            answer:
              'There is no shared onboarding task system — each team uses their own tool and notifies the next via email.',
          },
          {
            question: 'Why is there no shared onboarding task system?',
            answer:
              'The CRM was never configured for onboarding workflows, and no one owns the tool configuration.',
          },
          {
            question: 'Why does no one own the onboarding tool configuration?',
            answer:
              'Onboarding process is treated as a CS responsibility but the tooling is owned by RevOps, and neither team has dedicated onboarding project ownership.',
          },
          {
            question: 'Why is there no dedicated onboarding ownership?',
            answer:
              'The company scaled from 10 to 80 customers without a formal customer success function — onboarding evolved organically with no single owner.',
          },
        ],
        rootCause:
          'Absence of a dedicated onboarding owner and standardized tooling causes each customer to experience a different, ad-hoc onboarding journey with compounding delays.',
      },
    },
    // Step 3 — Generate
    {
      step: 'generate',
      form_type: 'brainstorming',
      title: 'Customer Onboarding — Brainstorming',
      data: {
        ideas: [
          {
            id: '00000002-0001-0001-0001-000000000001',
            text: 'Build a self-service customer onboarding portal with guided setup checklist',
            author: 'Product Manager',
            votes: 5,
            category: 'Product',
          },
          {
            id: '00000002-0001-0001-0001-000000000002',
            text: 'Create a standardized onboarding playbook with day-by-day task assignments',
            author: 'Customer Success Manager',
            votes: 5,
            category: 'Process',
          },
          {
            id: '00000002-0001-0001-0001-000000000003',
            text: 'Configure CRM with onboarding pipeline stages and automated task reminders',
            author: 'Solutions Engineer',
            votes: 4,
            category: 'Tooling',
          },
          {
            id: '00000002-0001-0001-0001-000000000004',
            text: 'Create pre-approved IT security questionnaire to share with customers pre-sale',
            author: 'Solutions Engineer',
            votes: 4,
            category: 'Process',
          },
          {
            id: '00000002-0001-0001-0001-000000000005',
            text: 'Run Day 1 kickoff call as a structured 45-min session with all stakeholders',
            author: 'Customer Success Manager',
            votes: 3,
            category: 'Process',
          },
          {
            id: '00000002-0001-0001-0001-000000000006',
            text: 'Assign an Onboarding Success Manager role dedicated to first 30 days',
            author: 'Support Team Lead',
            votes: 3,
            category: 'Staffing',
          },
          {
            id: '00000002-0001-0001-0001-000000000007',
            text: 'Build a self-service CSV data import tool so customers can migrate their own data',
            author: 'Product Manager',
            votes: 4,
            category: 'Product',
          },
        ],
        selectedIdeas: [
          '00000002-0001-0001-0001-000000000001',
          '00000002-0001-0001-0001-000000000002',
          '00000002-0001-0001-0001-000000000003',
          '00000002-0001-0001-0001-000000000004',
        ],
        eliminatedIdeas: ['00000002-0001-0001-0001-000000000006'],
      },
    },
    // Step 4 — Select & Plan
    {
      step: 'select_plan',
      form_type: 'criteria_matrix',
      title: 'Customer Onboarding — Criteria Matrix',
      data: {
        criteria: [
          {
            name: 'Time to Impact',
            weight: 9,
            description: 'How quickly will this reduce onboarding time?',
          },
          { name: 'Engineering Cost', weight: 7, description: 'Engineering effort required' },
          {
            name: 'Customer Experience',
            weight: 10,
            description: 'Improvement to customer onboarding NPS',
          },
          {
            name: 'Scalability',
            weight: 8,
            description: 'Works for 10x more customers without proportional effort',
          },
        ],
        solutions: [
          {
            name: 'Process + Tooling (Playbook + CRM config)',
            scores: {
              'Time to Impact': 5,
              'Engineering Cost': 5,
              'Customer Experience': 3,
              Scalability: 3,
            },
          },
          {
            name: 'Self-Service Portal + Playbook (Recommended)',
            scores: {
              'Time to Impact': 4,
              'Engineering Cost': 3,
              'Customer Experience': 5,
              Scalability: 5,
            },
          },
          {
            name: 'Onboarding Manager Hire',
            scores: {
              'Time to Impact': 3,
              'Engineering Cost': 5,
              'Customer Experience': 4,
              Scalability: 2,
            },
          },
        ],
      },
    },
    {
      step: 'select_plan',
      form_type: 'implementation_plan',
      title: 'Customer Onboarding — Implementation Plan',
      data: {
        selectedSolution: 'Self-Service Portal + Playbook (Recommended)',
        tasks: [
          {
            id: '00000002-0002-0001-0001-000000000001',
            title: 'Write standardized onboarding playbook with day-by-day task guide',
            assignee: 'Customer Success Manager',
            dueDate: '2024-03-15',
            status: 'completed',
            notes: 'Includes day 1 kickoff agenda, IT security package, and integration guides.',
          },
          {
            id: '00000002-0002-0001-0001-000000000002',
            title: 'Configure CRM onboarding pipeline with automated task reminders',
            assignee: 'Solutions Engineer',
            dueDate: '2024-03-22',
            status: 'completed',
            notes: 'HubSpot workflow automation for each onboarding stage.',
          },
          {
            id: '00000002-0002-0001-0001-000000000003',
            title: 'Build self-service onboarding portal (guided setup + CSV import)',
            assignee: 'Product Manager',
            dueDate: '2024-04-30',
            status: 'completed',
            notes: 'Engineering scoped: 6 weeks. Launch with beta customers first.',
          },
          {
            id: '00000002-0002-0001-0001-000000000004',
            title: 'Create pre-approved IT security questionnaire package',
            assignee: 'Solutions Engineer',
            dueDate: '2024-03-10',
            status: 'completed',
            notes: 'SOC 2 summary + standard security questionnaire pre-filled.',
          },
        ],
        timeline: '8 weeks (March 1 – April 30, 2024)',
        resources: 'CS team, Solutions Engineer, 1 Product Manager, 2 Engineering sprints',
        budget: '$45,000 — engineering time for portal ($35K) + CRM configuration ($10K)',
        risks: [
          {
            risk: 'Engineering sprint capacity pulled to product features',
            mitigation:
              'Portal work locked into Q1 engineering roadmap with VP Engineering sign-off',
          },
          {
            risk: 'Customer adoption of self-service portal may be low initially',
            mitigation: 'CS team to demo portal in kickoff call for first 90 days',
          },
        ],
      },
    },
    // Step 5 — Implement
    {
      step: 'implement',
      form_type: 'milestone_tracker',
      title: 'Customer Onboarding — Milestone Tracker',
      data: {
        milestones: [
          {
            id: '00000002-0003-0001-0001-000000000001',
            title: 'Security Package & Playbook Complete',
            targetDate: '2024-03-15',
            completedDate: '2024-03-12',
            status: 'completed',
            description: 'Pre-approved security questionnaire and onboarding playbook ready',
            deliverables: [
              'Security questionnaire package (PDF + editable)',
              'Onboarding playbook v1.0 published to Notion',
              'Day 1 kickoff call agenda template created',
            ],
          },
          {
            id: '00000002-0003-0001-0001-000000000002',
            title: 'CRM Onboarding Workflow Live',
            targetDate: '2024-03-22',
            completedDate: '2024-03-21',
            status: 'completed',
            description: 'HubSpot configured with onboarding pipeline and automated tasks',
            deliverables: [
              'HubSpot onboarding pipeline with 8 stages configured',
              'Automated task reminders to CS and customer',
              'Onboarding time tracking dashboard live',
            ],
          },
          {
            id: '00000002-0003-0001-0001-000000000003',
            title: 'Self-Service Portal Beta Launch',
            targetDate: '2024-04-15',
            completedDate: '2024-04-17',
            status: 'completed',
            description: 'Onboarding portal launched to 5 beta customers',
            deliverables: [
              'Portal launched with guided setup wizard',
              'CSV data import tool live',
              '5 beta customers onboarded through portal',
            ],
          },
          {
            id: '00000002-0003-0001-0001-000000000004',
            title: 'Full Rollout & Process Active',
            targetDate: '2024-04-30',
            completedDate: '2024-04-29',
            status: 'completed',
            description: 'All new customers using new onboarding process',
            deliverables: [
              'Portal available to all new customers',
              'CS team trained on new playbook',
              'First cohort of 12 customers onboarded via new process',
            ],
          },
        ],
        overallProgress: 100,
      },
    },
    // Step 6 — Evaluate
    {
      step: 'evaluate',
      form_type: 'before_after',
      title: 'Customer Onboarding — Before & After',
      data: {
        metrics: [
          {
            name: 'Average Onboarding Duration',
            before: 14,
            after: 4.5,
            unit: 'business days',
            improvement: '-68% (below 5-day benchmark)',
          },
          {
            name: 'Onboarding NPS',
            before: 32,
            after: 71,
            unit: 'NPS score',
            improvement: '+39 points',
          },
          {
            name: 'CS Team Hours per Onboarding',
            before: 22,
            after: 8,
            unit: 'hours',
            improvement: '-64% time savings',
          },
          {
            name: 'Onboarding-Stage Churn Rate',
            before: 8,
            after: 2,
            unit: '%',
            improvement: '-75% churn reduction',
          },
        ],
        summary:
          'The new onboarding process reduced average duration from 14 to 4.5 days — exceeding the 5-day goal. NPS jumped from 32 to 71. CS team capacity freed up by 64%, allowing the team to grow ARR from proactive account management rather than reactive setup work.',
      },
    },
    {
      step: 'evaluate',
      form_type: 'evaluation',
      title: 'Customer Onboarding — Evaluation',
      data: {
        goalsAchieved: true,
        goalDetails:
          'Goal of ≤5 business days achieved — current average is 4.5 days. Onboarding NPS exceeded target of 60, reaching 71. All implementation tasks completed within budget.',
        effectivenessRating: 5,
        sustainabilityRating: 5,
        teamSatisfactionRating: 4,
        unexpectedOutcomes:
          'The self-service portal is now being used as a sales differentiator. Prospects are requesting portal demos during the sales process, contributing to a 12% increase in sales win rate for competitive deals.',
        recommendations:
          'Expand the portal with a live integration health dashboard so customers can self-diagnose connectivity issues. Consider applying the same playbook approach to the renewal process.',
        nextSteps:
          'Monthly review of onboarding time metrics in CS dashboard. Quarterly playbook review to keep content current. Engineering to add integration health monitoring to portal in Q3.',
      },
    },
  ],
  tickets: [
    {
      title: 'Write standardized onboarding playbook with day-by-day task guide',
      description:
        'Document the end-to-end onboarding journey with day-by-day responsibilities for the CS team, including the day-1 kickoff agenda and integration setup steps.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Create pre-approved IT security questionnaire package',
      description:
        'Prepare a pre-filled SOC 2 summary and standard security questionnaire that Sales can share with customer IT teams before contract signing to eliminate security review delays.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Configure HubSpot onboarding pipeline with automated task reminders',
      description:
        'Set up 8-stage onboarding pipeline in HubSpot with automated email reminders to both the CS team and customer contacts at each stage transition.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Build self-service customer onboarding portal with guided setup wizard',
      description:
        'Develop a self-service portal where customers can complete account setup, configure integrations, and import their data without waiting on the CS team.',
      status: 'done',
      priority: 'critical',
      type: 'improvement',
    },
    {
      title: 'Add CSV data import tool to onboarding portal',
      description:
        'Implement a self-service CSV import tool so customers can migrate their existing data without requiring Engineering involvement for each migration.',
      status: 'done',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Investigate onboarding NPS drop for enterprise customers',
      description:
        'Enterprise customers with complex integrations still show lower onboarding NPS (54) versus SMB (76). Investigate whether the portal wizard handles enterprise edge cases adequately.',
      status: 'done',
      priority: 'medium',
      type: 'investigation',
    },
    {
      title: 'Expand portal to include live integration health monitoring',
      description:
        'Add an integration health dashboard to the portal so customers can self-diagnose connectivity issues without opening a support ticket.',
      status: 'in_review',
      priority: 'medium',
      type: 'improvement',
    },
  ],
}

/* ============================================================
   Template 3: Manufacturing Defect Reduction
   Step 5 Implement (4 steps completed: identify, analyze, generate, select_plan)
   ============================================================ */

const manufacturingDefect: ProjectTemplate = {
  id: 'manufacturing-defect',
  name: 'Manufacturing Defect Reduction',
  description:
    'Circuit board defect rate of 3.8% far exceeds the 0.5% quality target, driving $420K/year in rework and scrap costs. Currently in the implementation phase.',
  industry: 'Production / Quality Assurance',
  currentStep: 'implement',
  steps: makeSteps(4),
  forms: [
    // Step 1 — Identify
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Manufacturing Defect — Problem Statement',
      data: {
        asIs: 'Circuit board defect rate is averaging 3.8% across the SMT assembly line, measured over the last 6 months.',
        desired:
          'Achieve a defect rate of 0.5% or below within 9 months, matching the process capability target set by the quality team.',
        gap: 'Current defect rate is 7.6x the target. Primary defect types: solder bridging (42%), component misalignment (31%), and cold solder joints (27%).',
        problemStatement:
          'SMT assembly line defect rate of 3.8% vs. 0.5% target generates $420K/year in rework and scrap, delays shipping, and risks customer returns.',
        teamMembers: [
          'Quality Manager',
          'SMT Line Supervisor',
          'Process Engineer',
          'Supply Chain Manager',
        ],
        problemArea: 'Manufacturing Quality',
        dataSources: [
          'AOI (Automated Optical Inspection) failure logs (6 months)',
          'Rework labor tracking system',
          'Scrap cost reports',
          'Customer return (RMA) data',
          'Solder paste inspection records',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Manufacturing Defect — Impact Assessment',
      data: {
        financialImpact:
          '$420,000/year — rework labor ($180K), scrap material ($140K), expedited re-shipments ($60K), and customer credit notes ($40K).',
        customerImpact:
          'High — 2.1% field return rate generating customer complaints. Two key accounts placed quality holds.',
        employeeImpact:
          'Moderate — Rework technicians report repetitive strain concerns. Line supervisors spend 40% of shift managing defect escapes.',
        processImpact:
          'Critical — Defects identified late in process require full board tear-down. Line throughput reduced by 18% due to inspection bottleneck.',
        severityRating: 5,
        frequencyRating: 5,
        detectionRating: 3,
        riskPriorityNumber: 75,
      },
    },
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Manufacturing Defect — Fishbone Diagram',
      data: {
        problemStatement: 'SMT circuit board defect rate is 3.8% vs. 0.5% target',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'Operator paste print setup varies between shifts',
                subCauses: ['No standardized setup verification checklist'],
              },
              {
                text: 'Inspection criteria inconsistently applied across auditors',
                subCauses: ['Last calibration training 18 months ago'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'Reflow oven temperature profile not validated for new board types',
                subCauses: ['Profile library not updated when new products introduced'],
              },
              {
                text: 'Stencil cleaning interval exceeds 500-print recommendation',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'Solder paste printer squeegee pressure inconsistent (worn blades)',
                subCauses: ['Blade replacement schedule overdue'],
              },
              {
                text: 'Pick-and-place nozzles worn — causing 0.3mm component offset',
                subCauses: ['Nozzle PM schedule not enforced'],
              },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: 'Solder paste from new supplier has different rheology',
                subCauses: ['Qualification testing not done before line use'],
              },
              {
                text: 'PCB moisture from incorrect storage causes delamination',
                subCauses: ['Bake-out procedure not consistently followed'],
              },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Humidity variation in assembly area causes paste slump',
                subCauses: ['HVAC thermostat setpoint changed during summer'],
              },
              { text: 'ESD grounding checks not performed daily', subCauses: [] },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No real-time defect rate dashboard visible to floor supervisors',
                subCauses: ['Quality data in MES requires manual report pull'],
              },
              {
                text: 'Engineering change notice (ECN) process bypassed under delivery pressure',
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
      title: 'Manufacturing Defect — Five Why Analysis',
      data: {
        problemStatement: 'Solder bridging accounts for 42% of defects on SMT line',
        whys: [
          {
            question: 'Why is solder bridging occurring?',
            answer:
              'Excess solder paste volume is being deposited through the stencil, causing bridges during reflow.',
          },
          {
            question: 'Why is excess solder paste being deposited?',
            answer:
              'Stencil apertures are partially blocked by hardened paste residue, causing uneven print and compensatory over-printing.',
          },
          {
            question: 'Why is the stencil not being cleaned to remove residue?',
            answer:
              'Stencil cleaning is scheduled every 1,000 prints, but the recommended interval for this paste type is every 500 prints.',
          },
          {
            question: 'Why was the cleaning interval set to 1,000 prints?',
            answer:
              'The interval was copied from the previous paste supplier spec and was never updated when the new supplier paste was qualified.',
          },
          {
            question: 'Why was the spec not updated during the paste qualification?',
            answer:
              'The new paste was introduced during a rush production period and bypassed the formal ECN process — so process parameters were never formally reviewed.',
          },
        ],
        rootCause:
          'New solder paste was introduced without a formal engineering change process, leaving the stencil cleaning interval wrong for the new paste rheology. This root cause connects to Management and Process gaps identified in the fishbone.',
      },
    },
    // Step 3 — Generate
    {
      step: 'generate',
      form_type: 'brainstorming',
      title: 'Manufacturing Defect — Brainstorming',
      data: {
        ideas: [
          {
            id: '00000003-0001-0001-0001-000000000001',
            text: 'Implement SPC (Statistical Process Control) charts on paste print volume in real time',
            author: 'Process Engineer',
            votes: 5,
            category: 'Process Control',
          },
          {
            id: '00000003-0001-0001-0001-000000000002',
            text: 'Reduce stencil cleaning interval to every 500 prints and add automated cleaning station',
            author: 'SMT Line Supervisor',
            votes: 5,
            category: 'Maintenance',
          },
          {
            id: '00000003-0001-0001-0001-000000000003',
            text: 'Create a real-time defect rate dashboard visible on the shop floor',
            author: 'Quality Manager',
            votes: 4,
            category: 'Visibility',
          },
          {
            id: '00000003-0001-0001-0001-000000000004',
            text: 'Validate and document reflow oven profiles for all active product families',
            author: 'Process Engineer',
            votes: 4,
            category: 'Process Documentation',
          },
          {
            id: '00000003-0001-0001-0001-000000000005',
            text: 'Enforce ECN process gate for all material substitutions — no bypass under delivery pressure',
            author: 'Quality Manager',
            votes: 5,
            category: 'Process Governance',
          },
          {
            id: '00000003-0001-0001-0001-000000000006',
            text: 'Schedule pick-and-place nozzle PM every 200K placements instead of 500K',
            author: 'SMT Line Supervisor',
            votes: 3,
            category: 'Maintenance',
          },
        ],
        selectedIdeas: [
          '00000003-0001-0001-0001-000000000001',
          '00000003-0001-0001-0001-000000000002',
          '00000003-0001-0001-0001-000000000003',
          '00000003-0001-0001-0001-000000000005',
        ],
        eliminatedIdeas: [],
      },
    },
    // Step 4 — Select & Plan
    {
      step: 'select_plan',
      form_type: 'criteria_matrix',
      title: 'Manufacturing Defect — Criteria Matrix',
      data: {
        criteria: [
          {
            name: 'Defect Reduction',
            weight: 10,
            description: 'Expected reduction in defect rate',
          },
          { name: 'Implementation Speed', weight: 7, description: 'Time to implement' },
          {
            name: 'Capital Cost',
            weight: 6,
            description: 'Equipment or tooling investment required',
          },
          {
            name: 'Sustainability',
            weight: 8,
            description: 'Will this hold over time without constant oversight?',
          },
        ],
        solutions: [
          {
            name: 'SPC + Cleaning + ECN Governance (Recommended)',
            scores: {
              'Defect Reduction': 5,
              'Implementation Speed': 4,
              'Capital Cost': 4,
              Sustainability: 5,
            },
          },
          {
            name: 'Full Line Equipment Upgrade',
            scores: {
              'Defect Reduction': 5,
              'Implementation Speed': 1,
              'Capital Cost': 1,
              Sustainability: 5,
            },
          },
          {
            name: 'Increased Final Inspection Only',
            scores: {
              'Defect Reduction': 2,
              'Implementation Speed': 5,
              'Capital Cost': 5,
              Sustainability: 2,
            },
          },
        ],
      },
    },
    {
      step: 'select_plan',
      form_type: 'implementation_plan',
      title: 'Manufacturing Defect — Implementation Plan',
      data: {
        selectedSolution: 'SPC + Cleaning + ECN Governance (Recommended)',
        tasks: [
          {
            id: '00000003-0002-0001-0001-000000000001',
            title:
              'Install automated stencil cleaning station and update cleaning interval to 500 prints',
            assignee: 'SMT Line Supervisor',
            dueDate: '2024-04-15',
            status: 'completed',
            notes: 'DEK auto-wash unit installed. SOPs updated.',
          },
          {
            id: '00000003-0002-0001-0001-000000000002',
            title: 'Deploy SPC control charts on MES for paste volume, offset, and AOI pass rate',
            assignee: 'Process Engineer',
            dueDate: '2024-04-30',
            status: 'in_progress',
            notes: 'MES vendor engaged. Paste print SPC live; AOI integration in progress.',
          },
          {
            id: '00000003-0002-0001-0001-000000000003',
            title: 'Build and install real-time defect rate dashboard on shop floor TVs',
            assignee: 'Quality Manager',
            dueDate: '2024-05-15',
            status: 'not_started',
            notes: 'IT resource needed for dashboard display setup.',
          },
          {
            id: '00000003-0002-0001-0001-000000000004',
            title: 'Enforce ECN gate for all material changes — update approval workflow',
            assignee: 'Quality Manager',
            dueDate: '2024-04-20',
            status: 'completed',
            notes: 'ECN workflow updated in MES. All material changes now require QE sign-off.',
          },
        ],
        timeline: '12 weeks (April 1 – June 15, 2024)',
        resources: 'SMT Supervisor, Process Engineer, Quality Manager, MES vendor, IT support',
        budget:
          '$38,000 — stencil cleaning station ($18K), MES integration ($12K), dashboard hardware ($8K)',
        risks: [
          {
            risk: 'MES SPC integration delayed by vendor availability',
            mitigation:
              'Manual SPC charting as interim solution while MES integration is in progress',
          },
          {
            risk: 'Operators resistant to tighter cleaning interval (disrupts production pace)',
            mitigation:
              'Supervisor briefing on defect cost impact; tracked as quality KPI in shift review',
          },
        ],
      },
    },
  ],
  tickets: [
    {
      title: 'Install automated stencil cleaning station and update interval to 500 prints',
      description:
        'Procure and install the DEK auto-wash unit on the SMT line and update SOPs to enforce the 500-print cleaning interval for the current solder paste supplier.',
      status: 'done',
      priority: 'critical',
      type: 'task',
    },
    {
      title: 'Enforce ECN gate for all material changes in MES workflow',
      description:
        'Update the MES engineering change notice workflow to require Quality Engineer sign-off before any material substitution is approved for production use.',
      status: 'done',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Deploy SPC control charts for paste volume and AOI pass rate',
      description:
        'Work with MES vendor to implement real-time Statistical Process Control charts for solder paste volume, component offset, and AOI pass rate on the shop floor.',
      status: 'in_progress',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Investigate reflow oven profile validation for all active product families',
      description:
        'Audit reflow oven temperature profiles across all active board types and validate that profiles are correctly matched to current paste and component specifications.',
      status: 'in_progress',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Build and install real-time defect rate dashboard on shop floor displays',
      description:
        'Configure shop floor TV dashboard showing live defect rate, SPC control chart status, and daily rework cost to give supervisors real-time visibility.',
      status: 'todo',
      priority: 'medium',
      type: 'task',
    },
    {
      title: 'Schedule pick-and-place nozzle PM at 200K placements',
      description:
        'Update the preventive maintenance schedule to replace pick-and-place nozzles every 200K placements instead of 500K to eliminate component offset defects.',
      status: 'todo',
      priority: 'medium',
      type: 'improvement',
    },
  ],
}

/* ============================================================
   Template 4: Employee Turnover Reduction
   Step 4 Select & Plan (3 steps completed: identify, analyze, generate)
   ============================================================ */

const employeeTurnover: ProjectTemplate = {
  id: 'employee-turnover',
  name: 'Employee Turnover Reduction',
  description:
    'Annual voluntary turnover at 28% vs. 15% industry average, concentrated in the first 12 months. Currently generating solution options before selecting a plan.',
  industry: 'Human Resources',
  currentStep: 'select_plan',
  steps: makeSteps(3),
  forms: [
    // Step 1 — Identify
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
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Employee Turnover — Fishbone Diagram',
      data: {
        problemStatement: 'Voluntary turnover at 28% vs. 15% industry benchmark',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'Managers lack coaching and people management skills',
                subCauses: ['No manager training program', 'Promoted for technical skills only'],
              },
              {
                text: 'Employees feel unseen — no regular 1:1s or feedback',
                subCauses: ['60% of managers hold fewer than 2 1:1s per month'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'Onboarding program ends at 2 weeks — no 30/60/90-day check-ins',
                subCauses: ['No structured onboarding beyond Day 1 orientation'],
              },
              {
                text: 'Performance review process is annual only — no mid-year check-ins',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'No career development platform or IDP tools',
                subCauses: ['HRIS does not support career pathing'],
              },
              { text: 'Engagement survey tool not connected to action workflow', subCauses: [] },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: 'Career path documentation does not exist for most roles',
                subCauses: ['Only Engineering has formal leveling rubrics'],
              },
              {
                text: 'Compensation bands outdated — 18 months since market survey',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Remote-first culture reduces team cohesion for new hires',
                subCauses: ['No structured virtual social events'],
              },
              {
                text: 'High external job market competition in Engineering and Sales',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No retention risk tracking or early warning system',
                subCauses: ['HR does not monitor flight risk signals until resignation'],
              },
              {
                text: 'Director-level review of turnover data happens only annually',
                subCauses: [],
              },
            ],
          },
        ],
      },
    },
    // Step 3 — Generate
    {
      step: 'generate',
      form_type: 'brainstorming',
      title: 'Employee Turnover — Brainstorming',
      data: {
        ideas: [
          {
            id: '00000004-0001-0001-0001-000000000001',
            text: 'Build structured 30/60/90 day onboarding with manager check-in milestones',
            author: 'VP of People',
            votes: 5,
            category: 'Onboarding',
          },
          {
            id: '00000004-0001-0001-0001-000000000002',
            text: 'Launch manager effectiveness training program — coaching, feedback, and 1:1 skills',
            author: 'L&D Lead',
            votes: 5,
            category: 'Manager Development',
          },
          {
            id: '00000004-0001-0001-0001-000000000003',
            text: 'Create career path frameworks for all roles with clear progression criteria',
            author: 'VP of People',
            votes: 4,
            category: 'Career Development',
          },
          {
            id: '00000004-0001-0001-0001-000000000004',
            text: 'Implement quarterly engagement pulse surveys with manager action requirements',
            author: 'VP of People',
            votes: 4,
            category: 'Engagement',
          },
          {
            id: '00000004-0001-0001-0001-000000000005',
            text: 'Introduce stay interviews at 6-month and 12-month marks',
            author: 'Recruiting Manager',
            votes: 4,
            category: 'Retention',
          },
          {
            id: '00000004-0001-0001-0001-000000000006',
            text: 'Conduct compensation market survey and close largest pay gaps',
            author: 'VP of People',
            votes: 3,
            category: 'Compensation',
          },
          {
            id: '00000004-0001-0001-0001-000000000007',
            text: 'Build retention risk dashboard in HRIS using early warning signals (missed 1:1s, low eNPS)',
            author: 'Recruiting Manager',
            votes: 3,
            category: 'Analytics',
          },
        ],
        selectedIdeas: [
          '00000004-0001-0001-0001-000000000001',
          '00000004-0001-0001-0001-000000000002',
          '00000004-0001-0001-0001-000000000003',
          '00000004-0001-0001-0001-000000000004',
          '00000004-0001-0001-0001-000000000005',
        ],
        eliminatedIdeas: [],
      },
    },
  ],
  tickets: [
    {
      title: 'Analyze exit interview data to validate top turnover drivers',
      description:
        'Review the last 24 months of exit interview summaries and categorize departure reasons to confirm that manager relationships and career path gaps are the primary drivers.',
      status: 'done',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Benchmark compensation bands against current market data',
      description:
        'Conduct a market compensation survey across Engineering, Sales, and Operations to identify roles where pay is more than 10% below market median.',
      status: 'done',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Design 30/60/90-day onboarding program with manager check-ins',
      description:
        'Create a structured new hire onboarding program with scheduled milestone check-ins at 30, 60, and 90 days to catch early disengagement signals.',
      status: 'in_progress',
      priority: 'critical',
      type: 'improvement',
    },
    {
      title: 'Develop manager effectiveness training curriculum',
      description:
        'Design and pilot a manager training program covering coaching skills, delivering feedback, and conducting effective 1:1s targeting the 60% of managers who hold fewer than two 1:1s per month.',
      status: 'in_progress',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Create career path frameworks for all departments',
      description:
        'Document clear career progression criteria and leveling rubrics for all roles beyond Engineering, giving employees a visible growth roadmap.',
      status: 'todo',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Implement quarterly engagement pulse survey with manager action requirements',
      description:
        'Launch a quarterly pulse survey tool and establish a process requiring managers to present action plans for teams scoring below threshold within 30 days.',
      status: 'todo',
      priority: 'medium',
      type: 'improvement',
    },
  ],
}

/* ============================================================
   Template 5: IT Help Desk Response Time
   Step 3 Generate (2 steps completed: identify, analyze)
   ============================================================ */

const itHelpdeskResponse: ProjectTemplate = {
  id: 'it-helpdesk-response',
  name: 'IT Help Desk Response Time',
  description:
    'IT help desk first-response time averages 4.2 hours vs. the 1-hour SLA target, with ticket backlog growing 23% month-over-month. Root causes identified; generating solutions.',
  industry: 'IT Operations',
  currentStep: 'generate',
  steps: makeSteps(2),
  forms: [
    // Step 1 — Identify
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'IT Help Desk — Problem Statement',
      data: {
        asIs: 'IT help desk average first-response time is 4.2 hours. The ticket backlog has grown 23% over the last 3 months. 18% of tickets are escalated to Tier 2 due to Tier 1 not having resolution authority.',
        desired:
          'Achieve average first-response time of ≤1 hour and reduce ticket-to-resolution time by 40% within 6 months.',
        gap: 'First-response time is 4.2x over SLA. Backlog growth suggests capacity issue. High escalation rate points to a skill/authority gap at Tier 1.',
        problemStatement:
          'IT help desk fails to meet 1-hour response SLA 74% of the time, leading to employee productivity loss, business disruption, and growing frustration with IT services.',
        teamMembers: [
          'IT Manager',
          'Help Desk Team Lead',
          'Systems Administrator',
          'HR Business Partner',
        ],
        problemArea: 'Internal IT Service Delivery',
        dataSources: [
          'ITSM ticketing system reports (ServiceNow)',
          'Employee satisfaction survey — IT section',
          'SLA compliance dashboard',
          'Escalation rate reports',
          'Ticket category analysis',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'IT Help Desk — Impact Assessment',
      data: {
        financialImpact:
          '$215,000/year in estimated lost productivity (average 2.8 hours per ticket x 450 tickets/month x avg. employee cost). Plus 1.5 FTE equivalent in escalation rework costs.',
        customerImpact:
          'High — IT is an internal service; 62% of employees rate IT support as "poor" or "fair" in annual satisfaction survey.',
        employeeImpact:
          'High — Help desk staff report burnout from backlog pressure. Tier 1 agents frustrated by lack of resolution authority.',
        processImpact:
          'Critical — 18% escalation rate means Tier 2 (senior engineers) spend 25% of their time on tasks that could be resolved at Tier 1.',
        severityRating: 4,
        frequencyRating: 5,
        detectionRating: 4,
        riskPriorityNumber: 80,
      },
    },
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'IT Help Desk — Fishbone Diagram',
      data: {
        problemStatement: 'IT help desk first-response time averages 4.2 hours vs. 1-hour SLA',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'Tier 1 agents lack training for top 15 ticket categories',
                subCauses: [
                  'Training last updated 2 years ago',
                  'High Tier 1 turnover means lost knowledge',
                ],
              },
              {
                text: 'Only 2 agents working during peak 9-11am ticket volume',
                subCauses: ['Scheduling based on historical pattern, not current volume'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'No ticket triage or priority routing — all tickets enter same queue',
                subCauses: ['ITSM configured with single queue since 2019'],
              },
              {
                text: 'No knowledge base — agents research every ticket from scratch',
                subCauses: ['Knowledge articles never created'],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'ITSM tool lacks automation for common ticket types',
                subCauses: ['ServiceNow automation module not configured'],
              },
              {
                text: 'Remote access tool (RDP) times out frequently, adding 20 min per session',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: 'No documented resolution playbooks for common issues',
                subCauses: [],
              },
              { text: 'IT policy docs are outdated — agents create workarounds', subCauses: [] },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: '23% month-over-month ticket volume growth from company headcount increase',
                subCauses: ['No capacity planning model'],
              },
              {
                text: 'Work-from-home increases VPN and connectivity ticket volume',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'Tier 1 resolution authority limited — cannot reset MFA or provision access',
                subCauses: ['Security policy written in 2020 not revisited'],
              },
              {
                text: 'SLA compliance reported monthly — no real-time visibility',
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
      title: 'IT Help Desk — Five Why Analysis',
      data: {
        problemStatement: '74% of tickets receive first response after 1-hour SLA',
        whys: [
          {
            question: 'Why are most tickets receiving a response after the 1-hour SLA?',
            answer:
              'Agents are spending 35+ minutes on each ticket researching solutions because there is no knowledge base.',
          },
          {
            question: 'Why is there no knowledge base for common resolutions?',
            answer:
              'Knowledge articles were never created — there was no requirement to document resolutions after closing a ticket.',
          },
          {
            question: 'Why was there no requirement to document resolutions?',
            answer:
              'IT was a small team (2 people) when the ITSM was set up and documentation felt unnecessary. The team grew to 8 but the process never changed.',
          },
          {
            question: 'Why did the process not change as the team grew?',
            answer:
              'The IT Manager role was vacant for 9 months in 2022-2023. During that time no process improvements were made and the backlog began growing.',
          },
          {
            question: 'Why did the vacancy result in no process improvement?',
            answer:
              'There was no deputy or succession plan — the team had no empowered leader to drive process changes during the vacancy.',
          },
        ],
        rootCause:
          'Absence of a knowledge base combined with insufficient triage and scheduling means agents handle every ticket from scratch at the same slow pace regardless of complexity. This structural gap was never addressed during a leadership vacancy period.',
      },
    },
  ],
  tickets: [
    {
      title: 'Audit top 30 ticket categories and resolution time by type',
      description:
        'Pull ServiceNow data to identify the 30 most common ticket categories and measure average resolution time for each, to prioritize knowledge base content and triage rules.',
      status: 'done',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Build knowledge base articles for top 15 ticket categories',
      description:
        'Create step-by-step resolution guides in ServiceNow Knowledge for the 15 most frequent ticket types, starting with password resets, VPN issues, and MFA problems.',
      status: 'todo',
      priority: 'critical',
      type: 'task',
    },
    {
      title: 'Configure ServiceNow priority routing and ticket triage queues',
      description:
        'Set up multi-tier ticket queues in ServiceNow with automated routing rules that separate P1/P2 incidents from standard requests and assign to the appropriate agent group.',
      status: 'todo',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Revise Tier 1 resolution authority to include MFA resets and access provisioning',
      description:
        'Update the IT security policy to allow Tier 1 agents to resolve MFA resets and standard access provisioning requests without Tier 2 escalation.',
      status: 'backlog',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Investigate ServiceNow automation module for common ticket auto-resolution',
      description:
        'Evaluate the ServiceNow automation module to identify which ticket types (e.g., password resets, software installs) could be fully automated without agent involvement.',
      status: 'backlog',
      priority: 'medium',
      type: 'investigation',
    },
  ],
}

/* ============================================================
   Template 6: Warehouse Inventory Accuracy
   Step 2 Analyze (1 step completed: identify)
   ============================================================ */

const warehouseInventory: ProjectTemplate = {
  id: 'warehouse-inventory',
  name: 'Warehouse Inventory Accuracy',
  description:
    'Inventory accuracy rate is 91.3% vs. 99% target, causing $280K in annual write-offs and stockout-related lost sales. Root cause analysis in progress.',
  industry: 'Logistics / Warehouse Operations',
  currentStep: 'analyze',
  steps: makeSteps(1),
  forms: [
    // Step 1 — Identify
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Warehouse Inventory — Problem Statement',
      data: {
        asIs: 'Current inventory accuracy rate is 91.3% based on the last 3 quarterly cycle counts. 8.7% of inventory records have discrepancies between system and physical counts.',
        desired:
          'Achieve and sustain inventory accuracy of 99% or above within 8 months, meeting the industry best-practice standard for warehouse operations.',
        gap: '7.7 percentage points below target. Errors split between: phantom inventory (items in system but missing in warehouse, 52%) and unrecorded inventory (physical items with no system record, 48%).',
        problemStatement:
          'Inventory accuracy at 91.3% vs. 99% target causes $280K/year in write-offs, 14% increase in emergency purchase orders to cover stockouts, and 3.2% unfulfilled order rate.',
        teamMembers: [
          'Warehouse Manager',
          'Inventory Control Specialist',
          'Receiving Supervisor',
          'ERP Administrator',
        ],
        problemArea: 'Warehouse / Supply Chain Operations',
        dataSources: [
          'Quarterly cycle count reports (last 4 cycles)',
          'ERP inventory adjustment logs',
          'Receiving discrepancy reports',
          'Stockout and backorder reports',
          'Customer order fill rate data',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Warehouse Inventory — Impact Assessment',
      data: {
        financialImpact:
          '$280,000/year in write-offs. Additional $65K in premium freight for emergency POs to cover stockouts. Lost revenue from unfulfilled orders estimated at $180K.',
        customerImpact:
          'High — 3.2% unfulfilled order rate. Top 3 customers have flagged stockout frequency in quarterly reviews. One account moved 15% of volume to a competitor.',
        employeeImpact:
          'Moderate — Warehouse staff spend 8 hours/week on manual reconciliation. Frustration with ERP data quality reduces system trust and compliance.',
        processImpact:
          'High — Procurement makes safety stock decisions on inaccurate data, causing both overstock and stockout simultaneously in different SKUs.',
        severityRating: 4,
        frequencyRating: 5,
        detectionRating: 2,
        riskPriorityNumber: 40,
      },
    },
  ],
  tickets: [
    {
      title: 'Perform full cycle count and categorize discrepancy types',
      description:
        'Complete a comprehensive cycle count across all warehouse zones and classify each discrepancy as phantom inventory or unrecorded stock to quantify the split by location.',
      status: 'done',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Identify top 5 root causes of receiving discrepancies',
      description:
        'Interview receiving staff and review the last 6 months of receiving discrepancy reports to identify whether errors originate at inbound scanning, put-away, or system entry.',
      status: 'todo',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Investigate ERP inventory adjustment logs for unauthorized changes',
      description:
        'Audit the ERP adjustment log to identify users, frequencies, and justification codes for manual inventory adjustments over the past 12 months.',
      status: 'todo',
      priority: 'medium',
      type: 'investigation',
    },
    {
      title: 'Evaluate barcode scanning hardware in receiving dock',
      description:
        'Assess whether current barcode scanners in the receiving area are causing scan errors or skips that contribute to inbound inventory discrepancies.',
      status: 'backlog',
      priority: 'medium',
      type: 'investigation',
    },
  ],
}

/* ============================================================
   Template 7: Patient Wait Time Reduction
   Step 1 Identify (0 steps completed — just starting)
   ============================================================ */

const patientWaitTime: ProjectTemplate = {
  id: 'patient-wait-time',
  name: 'Patient Wait Time Reduction',
  description:
    'Emergency department average door-to-physician time is 87 minutes vs. 30-minute benchmark, impacting patient experience scores and LWBS (left without being seen) rate.',
  industry: 'Healthcare / Emergency Medicine',
  currentStep: 'identify',
  steps: makeSteps(0),
  forms: [],
  tickets: [
    {
      title: 'Collect 6-month ED throughput data by time of day and day of week',
      description:
        'Pull door-to-triage, triage-to-physician, and door-to-discharge times from the EMR system segmented by shift to identify peak congestion windows.',
      status: 'backlog',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Define problem statement and assemble improvement team',
      description:
        'Formally document the door-to-physician time gap, identify team members from nursing, physician staff, and registration, and schedule the project kickoff meeting.',
      status: 'backlog',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Benchmark peer ED wait times and identify best-practice facilities',
      description:
        'Research national ED benchmarks from CMS and ACEP and identify two to three peer facilities with door-to-physician times under 30 minutes for site learning.',
      status: 'backlog',
      priority: 'medium',
      type: 'investigation',
    },
    {
      title: 'Review LWBS (left without being seen) incident reports',
      description:
        'Analyze the last 12 months of LWBS events to understand timing patterns and whether patients who left correlate with specific shift staffing levels.',
      status: 'backlog',
      priority: 'medium',
      type: 'investigation',
    },
  ],
}

/* ============================================================
   Template 8: Software Release Cycle Speed (COMPLETED — all 6 steps)
   ============================================================ */

const softwareReleaseCycle: ProjectTemplate = {
  id: 'software-release-cycle',
  name: 'Software Release Cycle Speed',
  description:
    'Release cycle reduced from 6 weeks to 1.5 weeks by automating CI/CD pipeline and eliminating manual QA bottlenecks. Fully completed PIPS project for Engineering teams.',
  industry: 'Software Engineering',
  currentStep: 'evaluate',
  steps: makeSteps(6),
  forms: [
    // Step 1 — Identify
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Release Cycle — Problem Statement',
      data: {
        asIs: 'The software release cycle averages 6 weeks from feature-complete to production deployment. Deployment failures requiring rollback occur 28% of the time.',
        desired:
          'Reduce release cycle to 2 weeks or less and reduce rollback rate to under 5% within 6 months.',
        gap: 'Release cycle is 3x longer than target. Manual regression testing consumes 2.5 weeks. Rollback rate of 28% indicates quality escapes from inadequate automated testing.',
        problemStatement:
          'Engineering ships features slowly (6-week cycles vs. 2-week target) with high instability (28% rollback rate), delaying customer value delivery and eroding team velocity.',
        teamMembers: ['Engineering Manager', 'Lead DevOps Engineer', 'QA Lead', 'Product Manager'],
        problemArea: 'Engineering Velocity / DevOps',
        dataSources: [
          'GitHub release history (12 months)',
          'Jira sprint velocity reports',
          'Incident management system (rollback/hotfix logs)',
          'CI pipeline build time reports',
          'QA testing time logs',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Release Cycle — Impact Assessment',
      data: {
        financialImpact:
          '$320,000/year in delayed feature revenue. Each week of release delay costs ~$12K in deferred contract expansions plus $25K/incident for major rollbacks (avg. 2.3/quarter).',
        customerImpact:
          'High — Customers report feature requests taking too long. Rollbacks cause 4-hour average downtime impacting SLAs. 3 enterprise customers cited slow release cadence in churn surveys.',
        employeeImpact:
          'High — Engineering morale low due to manual QA burden. Developers spend 30% of sprint time on release overhead instead of building.',
        processImpact:
          'Critical — Manual regression suite takes 18 days. Deployment gated on 3 sign-offs. Hotfix process bypasses testing, creating instability cycle.',
        severityRating: 4,
        frequencyRating: 5,
        detectionRating: 3,
        riskPriorityNumber: 60,
      },
    },
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Release Cycle — Fishbone Diagram',
      data: {
        problemStatement: 'Release cycle averages 6 weeks with 28% rollback rate',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'QA team manually runs 1,200+ regression tests for every release',
                subCauses: ['No automated regression suite', 'Test automation never prioritized'],
              },
              {
                text: '3 executive sign-offs required before deployment',
                subCauses: ['Legacy process from 2019 security incident'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'No feature flags — all features deploy together in big-bang releases',
                subCauses: ['Feature flag tooling evaluated but never implemented'],
              },
              {
                text: 'Hotfixes bypass CI pipeline and go directly to production',
                subCauses: ['Hotfix process is undocumented and inconsistent'],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'CI pipeline builds take 48 minutes due to no parallelization',
                subCauses: ['Single-agent CI runner', 'Tests run sequentially'],
              },
              {
                text: 'Staging environment differs from production (different DB version)',
                subCauses: ['Infrastructure drift over 18 months'],
              },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: 'Test coverage at 34% — critical paths not covered by automated tests',
                subCauses: ['No coverage gate in CI pipeline'],
              },
              {
                text: 'Deployment runbooks are incomplete and inconsistently followed',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Staging environment frequently unavailable due to test data issues',
                subCauses: ['No test data management strategy'],
              },
              { text: 'Third-party dependencies change without notification', subCauses: [] },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No deployment frequency or rollback rate tracked as engineering KPIs',
                subCauses: ['DORA metrics not measured'],
              },
              {
                text: 'Release schedule driven by sales commitments, not engineering capacity',
                subCauses: [],
              },
            ],
          },
        ],
      },
    },
    // Step 3 — Generate
    {
      step: 'generate',
      form_type: 'brainstorming',
      title: 'Release Cycle — Brainstorming',
      data: {
        ideas: [
          {
            id: '00000008-0001-0001-0001-000000000001',
            text: 'Build automated regression suite covering top 200 critical user paths',
            author: 'QA Lead',
            votes: 5,
            category: 'Test Automation',
          },
          {
            id: '00000008-0001-0001-0001-000000000002',
            text: 'Parallelize CI pipeline builds across 8 agents to reduce build time from 48 to 8 minutes',
            author: 'Lead DevOps Engineer',
            votes: 5,
            category: 'CI/CD',
          },
          {
            id: '00000008-0001-0001-0001-000000000003',
            text: 'Implement LaunchDarkly feature flags for incremental rollout and instant rollback',
            author: 'Engineering Manager',
            votes: 5,
            category: 'Release Management',
          },
          {
            id: '00000008-0001-0001-0001-000000000004',
            text: 'Align staging and production environments using Terraform infrastructure-as-code',
            author: 'Lead DevOps Engineer',
            votes: 4,
            category: 'Infrastructure',
          },
          {
            id: '00000008-0001-0001-0001-000000000005',
            text: 'Replace 3 executive sign-offs with automated quality gate (coverage + test pass + security scan)',
            author: 'Engineering Manager',
            votes: 4,
            category: 'Process',
          },
          {
            id: '00000008-0001-0001-0001-000000000006',
            text: 'Instrument DORA metrics dashboard (deployment frequency, MTTR, change failure rate)',
            author: 'Engineering Manager',
            votes: 3,
            category: 'Visibility',
          },
        ],
        selectedIdeas: [
          '00000008-0001-0001-0001-000000000001',
          '00000008-0001-0001-0001-000000000002',
          '00000008-0001-0001-0001-000000000003',
          '00000008-0001-0001-0001-000000000005',
        ],
        eliminatedIdeas: [],
      },
    },
    // Step 4 — Select & Plan
    {
      step: 'select_plan',
      form_type: 'criteria_matrix',
      title: 'Release Cycle — Criteria Matrix',
      data: {
        criteria: [
          {
            name: 'Cycle Time Reduction',
            weight: 10,
            description: 'Expected reduction in release cycle length',
          },
          {
            name: 'Rollback Risk Reduction',
            weight: 9,
            description: 'Impact on reducing rollback rate',
          },
          {
            name: 'Engineering Effort',
            weight: 6,
            description: 'Engineering sprints required to implement',
          },
          { name: 'Long-term Value', weight: 8, description: 'Compound improvement over time' },
        ],
        solutions: [
          {
            name: 'Test Automation + CI Parallelization + Feature Flags (Recommended)',
            scores: {
              'Cycle Time Reduction': 5,
              'Rollback Risk Reduction': 5,
              'Engineering Effort': 3,
              'Long-term Value': 5,
            },
          },
          {
            name: 'Hire 2 More QA Engineers',
            scores: {
              'Cycle Time Reduction': 2,
              'Rollback Risk Reduction': 3,
              'Engineering Effort': 5,
              'Long-term Value': 2,
            },
          },
          {
            name: 'Process Changes Only (reduce sign-offs, fix hotfix process)',
            scores: {
              'Cycle Time Reduction': 3,
              'Rollback Risk Reduction': 2,
              'Engineering Effort': 5,
              'Long-term Value': 2,
            },
          },
        ],
      },
    },
    {
      step: 'select_plan',
      form_type: 'implementation_plan',
      title: 'Release Cycle — Implementation Plan',
      data: {
        selectedSolution: 'Test Automation + CI Parallelization + Feature Flags (Recommended)',
        tasks: [
          {
            id: '00000008-0002-0001-0001-000000000001',
            title: 'Parallelize CI pipeline — 8 agents, sharded test runs',
            assignee: 'Lead DevOps Engineer',
            dueDate: '2024-02-15',
            status: 'completed',
            notes: 'GitHub Actions matrix strategy. Build time reduced 48m → 9m.',
          },
          {
            id: '00000008-0002-0001-0001-000000000002',
            title: 'Integrate LaunchDarkly feature flags into codebase',
            assignee: 'Engineering Manager',
            dueDate: '2024-02-28',
            status: 'completed',
            notes: 'SDK integrated. First 3 features shipped behind flags.',
          },
          {
            id: '00000008-0002-0001-0001-000000000003',
            title: 'Write automated regression suite — 200 critical paths in Playwright',
            assignee: 'QA Lead',
            dueDate: '2024-04-15',
            status: 'completed',
            notes: '218 tests written. Coverage of checkout, auth, and core workflows.',
          },
          {
            id: '00000008-0002-0001-0001-000000000004',
            title: 'Replace manual sign-offs with automated quality gate in CI',
            assignee: 'Lead DevOps Engineer',
            dueDate: '2024-03-10',
            status: 'completed',
            notes: 'Gate checks: test coverage ≥70%, all tests pass, Snyk scan clean.',
          },
        ],
        timeline: '10 weeks (February 1 – April 15, 2024)',
        resources: 'DevOps Engineer (0.8 FTE), QA Lead (1.0 FTE), Engineering Manager (0.2 FTE)',
        budget:
          '$28,000 — LaunchDarkly license ($12K/year), CI infrastructure ($8K), QA tooling ($8K)',
        risks: [
          {
            risk: 'Test automation scope creep — QA team writes too broadly',
            mitigation: 'Constrain to top 200 critical paths identified in incident analysis',
          },
          {
            risk: 'Feature flag adoption inconsistent across teams',
            mitigation: 'Mandatory for all new features in Q2 sprint planning template',
          },
        ],
      },
    },
    // Step 5 — Implement
    {
      step: 'implement',
      form_type: 'milestone_tracker',
      title: 'Release Cycle — Milestone Tracker',
      data: {
        milestones: [
          {
            id: '00000008-0003-0001-0001-000000000001',
            title: 'CI Pipeline Parallelized',
            targetDate: '2024-02-15',
            completedDate: '2024-02-13',
            status: 'completed',
            description: 'CI build time reduced from 48 minutes to 9 minutes',
            deliverables: [
              '8-agent GitHub Actions matrix configured',
              'Build time: 48m → 9m (81% reduction)',
              'No new test failures from parallelization',
            ],
          },
          {
            id: '00000008-0003-0001-0001-000000000002',
            title: 'Feature Flags Live',
            targetDate: '2024-02-28',
            completedDate: '2024-02-27',
            status: 'completed',
            description: 'LaunchDarkly integrated, first features behind flags',
            deliverables: [
              'LaunchDarkly SDK in all services',
              '3 features shipped behind flags in first release',
              'Rollback demonstrated in staging with 0-downtime',
            ],
          },
          {
            id: '00000008-0003-0001-0001-000000000003',
            title: 'Automated Quality Gate Active',
            targetDate: '2024-03-10',
            completedDate: '2024-03-09',
            status: 'completed',
            description: 'Manual sign-offs replaced with automated CI quality gate',
            deliverables: [
              'Coverage gate (≥70%) enforced in CI',
              'Snyk security scan blocking on high-severity findings',
              'First deployment approved by gate with no manual sign-off',
            ],
          },
          {
            id: '00000008-0003-0001-0001-000000000004',
            title: 'Regression Suite Complete',
            targetDate: '2024-04-15',
            completedDate: '2024-04-14',
            status: 'completed',
            description: '218 automated Playwright tests covering critical paths',
            deliverables: [
              '218 E2E tests written and passing',
              'Test coverage of auth, checkout, and core user workflows',
              'Tests run in CI in under 12 minutes',
            ],
          },
        ],
        overallProgress: 100,
      },
    },
    // Step 6 — Evaluate
    {
      step: 'evaluate',
      form_type: 'before_after',
      title: 'Release Cycle — Before & After',
      data: {
        metrics: [
          {
            name: 'Release Cycle Duration',
            before: 6,
            after: 1.5,
            unit: 'weeks',
            improvement: '-75% (from 6 weeks to 1.5 weeks)',
          },
          {
            name: 'Rollback Rate',
            before: 28,
            after: 3,
            unit: '%',
            improvement: '-89% rollback rate',
          },
          {
            name: 'CI Build Time',
            before: 48,
            after: 9,
            unit: 'minutes',
            improvement: '-81% build time',
          },
          {
            name: 'Deployment Frequency',
            before: 2,
            after: 11,
            unit: 'deploys/month',
            improvement: '+450% deployment frequency',
          },
        ],
        summary:
          'All four engineering velocity targets exceeded. Release cycle dropped from 6 weeks to 1.5 weeks. Rollback rate fell from 28% to 3%. Deployment frequency increased from 2 to 11 times per month. Team velocity up 35% as engineers spend less time on release overhead.',
      },
    },
    {
      step: 'evaluate',
      form_type: 'evaluation',
      title: 'Release Cycle — Evaluation',
      data: {
        goalsAchieved: true,
        goalDetails:
          'Both primary goals exceeded: cycle time target of ≤2 weeks achieved at 1.5 weeks. Rollback rate target of <5% achieved at 3%. Quality gate replaced 3 manual approvals without any rollback incidents in first 8 weeks.',
        effectivenessRating: 5,
        sustainabilityRating: 5,
        teamSatisfactionRating: 5,
        unexpectedOutcomes:
          'Feature flags created a new product capability — the team is now using flags for A/B testing and gradual rollouts to specific customer segments, which was not part of the original scope but is delivering additional value.',
        recommendations:
          'Expand test automation to cover integration API tests (currently only E2E). Implement chaos engineering practice to proactively test resilience. Share DORA metrics in monthly engineering all-hands.',
        nextSteps:
          'Establish DORA metrics review in monthly engineering retrospective. Q3 goal: achieve Elite DORA classification (daily deployments). Expand feature flag usage to 100% of new features.',
      },
    },
  ],
  tickets: [
    {
      title: 'Parallelize CI pipeline across 8 GitHub Actions agents',
      description:
        'Refactor the CI configuration to use a matrix strategy across 8 agents with sharded test runs, targeting a reduction in build time from 48 minutes to under 10 minutes.',
      status: 'done',
      priority: 'critical',
      type: 'improvement',
    },
    {
      title: 'Integrate LaunchDarkly feature flags into all services',
      description:
        'Add the LaunchDarkly SDK to the codebase and migrate the first three features behind feature flags to enable zero-downtime rollouts and instant rollback capability.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Replace 3 manual release sign-offs with automated quality gate',
      description:
        'Configure CI to block deployments automatically unless test coverage is at or above 70%, all tests pass, and the Snyk security scan returns no high-severity findings.',
      status: 'done',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Write automated Playwright regression suite for 200 critical paths',
      description:
        'Create 200+ end-to-end tests covering authentication, checkout, and core user workflows, targeting full suite execution in under 12 minutes within the CI pipeline.',
      status: 'done',
      priority: 'critical',
      type: 'task',
    },
    {
      title: 'Align staging and production environments using Terraform IaC',
      description:
        'Define infrastructure-as-code for both staging and production environments to eliminate the database version drift that was causing staging-to-production failures.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Instrument DORA metrics dashboard in engineering reporting',
      description:
        'Add deployment frequency, lead time for changes, MTTR, and change failure rate to the monthly engineering retrospective dashboard.',
      status: 'done',
      priority: 'medium',
      type: 'improvement',
    },
    {
      title: 'Investigate expanding feature flag usage to A/B testing and gradual rollouts',
      description:
        'Evaluate using LaunchDarkly for customer-segment-specific feature rollouts and A/B experiments now that the SDK is embedded across all services.',
      status: 'in_review',
      priority: 'medium',
      type: 'investigation',
    },
  ],
}

/* ============================================================
   Template 9: Energy Consumption Reduction
   Step 4 Select & Plan (3 steps completed: identify, analyze, generate)
   ============================================================ */

const energyConsumption: ProjectTemplate = {
  id: 'energy-consumption',
  name: 'Energy Consumption Reduction',
  description:
    'Corporate campus energy consumption is 42% above the industry benchmark for similar facilities, costing $380K/year above target. Analyzing root causes and generating solutions.',
  industry: 'Sustainability / Facilities',
  currentStep: 'select_plan',
  steps: makeSteps(3),
  forms: [
    // Step 1 — Identify
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Energy Consumption — Problem Statement',
      data: {
        asIs: 'Annual energy consumption at the 180,000 sq ft corporate campus is 22.4 kWh/sq ft, compared to the industry benchmark of 15.8 kWh/sq ft for similar office facilities.',
        desired:
          'Reduce energy consumption intensity to 16 kWh/sq ft or below within 18 months, achieving a 20% reduction from current levels and meeting the corporate carbon reduction commitment.',
        gap: '6.6 kWh/sq ft above benchmark (42% higher). Primary drivers: HVAC over-conditioning, lighting in unoccupied zones, and aging server room cooling infrastructure.',
        problemStatement:
          'Campus energy intensity is 42% above industry benchmark, costing $380K/year above target spend and contributing 1,850 tons of excess CO2 equivalent annually.',
        teamMembers: [
          'Facilities Director',
          'Energy Manager',
          'VP of Sustainability',
          'IT Infrastructure Manager',
        ],
        problemArea: 'Corporate Sustainability / Operational Efficiency',
        dataSources: [
          'Utility bills (24-month trend by building zone)',
          'Building management system (BMS) data',
          'ENERGY STAR Portfolio Manager benchmarking',
          'Occupancy sensors and access card data',
          'HVAC equipment performance logs',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Energy Consumption — Impact Assessment',
      data: {
        financialImpact:
          '$380,000/year above target energy spend. At projected utility rate increases of 8%/year, this gap widens to $520K within 3 years without action.',
        customerImpact:
          'Moderate — B2B customers increasingly evaluate supplier sustainability in procurement. Two enterprise RFPs in Q3 included carbon footprint scoring.',
        employeeImpact:
          'Low direct impact. Employee surveys show strong support for sustainability initiatives — 78% say it influences employer satisfaction.',
        processImpact:
          'Moderate — Aging HVAC equipment creates reliability risk. Server room cooling inefficiency adds risk to system uptime.',
        severityRating: 3,
        frequencyRating: 5,
        detectionRating: 4,
        riskPriorityNumber: 60,
      },
    },
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Energy Consumption — Fishbone Diagram',
      data: {
        problemStatement: 'Campus energy intensity is 42% above industry benchmark',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'Employees leave workstations, monitors, and lights on overnight',
                subCauses: ['No shutdown reminder policy', 'Energy awareness not in onboarding'],
              },
              {
                text: 'Facilities staff manually control HVAC by zone without occupancy data',
                subCauses: ['No integration between occupancy sensors and BMS'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: 'HVAC operates on fixed schedule regardless of occupancy',
                subCauses: ['Schedule was set in 2018 and never revised'],
              },
              {
                text: 'No energy review in monthly facilities meeting',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'HVAC units in east wing are 14+ years old with degraded efficiency',
                subCauses: ['Capital replacement deferred 3 years'],
              },
              {
                text: 'Server room uses direct expansion cooling (PUE 2.1 vs. 1.4 target)',
                subCauses: ['Equipment predates current efficiency standards'],
              },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: '35% of lighting is T8 fluorescent, not LED',
                subCauses: ['LED retrofit budget was cut in 2022'],
              },
              { text: 'Building insulation in 1990s wing below current standard', subCauses: [] },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Building faces south/west — solar gain increases cooling load in summer',
                subCauses: ['No window film or external shading'],
              },
              {
                text: 'Data center density increased 40% in 3 years without cooling upgrade',
                subCauses: [],
              },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No energy KPI tracked at department level',
                subCauses: ['Energy cost pooled in facilities budget — no chargeback'],
              },
              {
                text: 'Sustainability commitments not connected to operational budgets',
                subCauses: [],
              },
            ],
          },
        ],
      },
    },
    // Step 3 — Generate
    {
      step: 'generate',
      form_type: 'brainstorming',
      title: 'Energy Consumption — Brainstorming',
      data: {
        ideas: [
          {
            id: '00000009-0001-0001-0001-000000000001',
            text: 'Integrate occupancy sensors with BMS to auto-adjust HVAC and lighting by zone',
            author: 'Energy Manager',
            votes: 5,
            category: 'Smart Controls',
          },
          {
            id: '00000009-0001-0001-0001-000000000002',
            text: 'Complete LED lighting retrofit across all remaining T8 fluorescent areas',
            author: 'Facilities Director',
            votes: 5,
            category: 'Lighting',
          },
          {
            id: '00000009-0001-0001-0001-000000000003',
            text: 'Replace east wing HVAC units with high-efficiency variable refrigerant flow (VRF) system',
            author: 'Facilities Director',
            votes: 4,
            category: 'HVAC',
          },
          {
            id: '00000009-0001-0001-0001-000000000004',
            text: 'Upgrade server room to hot aisle/cold aisle containment with precision cooling',
            author: 'IT Infrastructure Manager',
            votes: 4,
            category: 'Data Center',
          },
          {
            id: '00000009-0001-0001-0001-000000000005',
            text: 'Launch employee energy awareness campaign with floor-level consumption dashboards',
            author: 'VP of Sustainability',
            votes: 3,
            category: 'Behavior Change',
          },
          {
            id: '00000009-0001-0001-0001-000000000006',
            text: 'Install 300kW rooftop solar to offset 15% of campus consumption',
            author: 'VP of Sustainability',
            votes: 3,
            category: 'Renewable Energy',
          },
          {
            id: '00000009-0001-0001-0001-000000000007',
            text: 'Apply window film on south and west facades to reduce solar heat gain',
            author: 'Facilities Director',
            votes: 3,
            category: 'Building Envelope',
          },
        ],
        selectedIdeas: [
          '00000009-0001-0001-0001-000000000001',
          '00000009-0001-0001-0001-000000000002',
          '00000009-0001-0001-0001-000000000004',
          '00000009-0001-0001-0001-000000000005',
        ],
        eliminatedIdeas: ['00000009-0001-0001-0001-000000000006'],
      },
    },
  ],
  tickets: [
    {
      title: 'Audit utility bills and BMS data to quantify energy use by building zone',
      description:
        'Analyze 24 months of utility bills alongside building management system logs to identify which zones and equipment categories account for the largest share of excess consumption.',
      status: 'done',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Complete LED lighting retrofit across all remaining T8 fluorescent areas',
      description:
        'Replace the remaining 35% of T8 fluorescent fixtures with LED across all affected zones, targeting a 40% reduction in lighting energy draw.',
      status: 'done',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Integrate occupancy sensors with BMS for automatic HVAC and lighting control',
      description:
        'Connect existing occupancy sensor data to the building management system to automatically reduce HVAC and lighting levels in unoccupied zones.',
      status: 'in_progress',
      priority: 'critical',
      type: 'improvement',
    },
    {
      title: 'Upgrade server room to hot aisle/cold aisle containment cooling',
      description:
        'Install hot aisle containment in the data center to reduce power usage effectiveness from the current 2.1 to the target of 1.4 or below.',
      status: 'in_progress',
      priority: 'high',
      type: 'task',
    },
    {
      title: 'Launch employee energy awareness campaign with floor-level dashboards',
      description:
        'Install energy consumption display screens on each floor and run a 90-day awareness campaign to reduce after-hours equipment usage by at least 20%.',
      status: 'todo',
      priority: 'medium',
      type: 'task',
    },
    {
      title: 'Evaluate east wing HVAC replacement with variable refrigerant flow system',
      description:
        'Obtain quotes for replacing the 14-year-old east wing HVAC units with high-efficiency VRF systems and build a capital ROI case for the next budget cycle.',
      status: 'todo',
      priority: 'medium',
      type: 'investigation',
    },
  ],
}

/* ============================================================
   Template 10: Invoice Processing Automation
   Step 3 Generate (2 steps completed: identify, analyze)
   ============================================================ */

const invoiceProcessing: ProjectTemplate = {
  id: 'invoice-processing',
  name: 'Invoice Processing Automation',
  description:
    'Accounts payable team manually processes 1,200 invoices/month, averaging 4.5 days per invoice and costing $38/invoice vs. $4 benchmark. Root causes identified; generating automation solutions.',
  industry: 'Finance / Accounts Payable',
  currentStep: 'generate',
  steps: makeSteps(2),
  forms: [
    // Step 1 — Identify
    {
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Invoice Processing — Problem Statement',
      data: {
        asIs: 'The AP team manually processes an average of 1,200 invoices per month. Average processing time is 4.5 days per invoice at a cost of $38 per invoice.',
        desired:
          'Reduce invoice processing cost to $8 per invoice and processing time to same-day (under 24 hours) for 80% of invoices within 12 months.',
        gap: 'Processing cost is 9.5x the target benchmark ($38 vs. $4). Processing time is 4.5 days vs. best practice of same-day for standard invoices. 100% manual processing vs. industry average of 60% automated.',
        problemStatement:
          'Manual invoice processing costs $456K/year in AP labor, causes late payment penalties ($85K/year), and cannot scale with 40% projected vendor count growth.',
        teamMembers: ['Controller', 'AP Manager', 'ERP Administrator', 'Procurement Manager'],
        problemArea: 'Finance / Accounts Payable Operations',
        dataSources: [
          'AP processing time reports from ERP',
          'Late payment penalty reports (12-month)',
          'Invoice volume by vendor and category',
          'Staff time tracking — AP team',
          'Industry benchmark: Hackett Group AP study',
        ],
      },
    },
    {
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Invoice Processing — Impact Assessment',
      data: {
        financialImpact:
          '$456,000/year in AP processing labor + $85,000/year in late payment penalties + $32,000 in lost early payment discounts = $573,000 total annual cost.',
        customerImpact:
          'Moderate — Vendors (external) experience slow payment causing relationship friction. 4 strategic suppliers escalated payment concerns in last 6 months.',
        employeeImpact:
          'High — AP team of 4 FTEs spends 90% of time on manual data entry. High error rate (6.2%) causes frustration and rework.',
        processImpact:
          'High — Manual process cannot scale. Adding 40% more vendors would require 2 additional FTEs. Invoice errors delay month-end close by 2-3 days each month.',
        severityRating: 4,
        frequencyRating: 5,
        detectionRating: 3,
        riskPriorityNumber: 60,
      },
    },
    // Step 2 — Analyze
    {
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Invoice Processing — Fishbone Diagram',
      data: {
        problemStatement:
          'Invoice processing costs $38/invoice vs. $4 benchmark; averages 4.5 days',
        categories: [
          {
            name: 'People',
            causes: [
              {
                text: 'AP staff manually key invoice data from PDF or paper into ERP',
                subCauses: ['No OCR or data capture automation', '6.2% manual entry error rate'],
              },
              {
                text: 'Manager approval required for all invoices, creating bottleneck',
                subCauses: ['Policy not updated — blanket approval for all amounts'],
              },
            ],
          },
          {
            name: 'Process',
            causes: [
              {
                text: '3-way match done manually by comparing PO, receipt, and invoice on paper',
                subCauses: ['ERP 3-way match module not activated'],
              },
              {
                text: 'No vendor portal — invoices arrive via email, paper, and fax',
                subCauses: ['Multiple inbound channels require different handling'],
              },
            ],
          },
          {
            name: 'Equipment',
            causes: [
              {
                text: 'ERP (SAP) AP automation modules purchased but not configured',
                subCauses: [
                  'Configuration project started in 2022, stalled',
                  'No dedicated ERP resource',
                ],
              },
              { text: 'No e-invoicing or EDI connections with top 20 vendors', subCauses: [] },
            ],
          },
          {
            name: 'Materials',
            causes: [
              {
                text: '42% of invoices arrive without a valid PO number',
                subCauses: ['Procurement does not enforce PO-first policy'],
              },
              {
                text: 'Vendor master data has 18% duplicate or outdated records',
                subCauses: ['No data quality process since ERP migration 4 years ago'],
              },
            ],
          },
          {
            name: 'Environment',
            causes: [
              {
                text: 'Month-end invoice surge (40% of monthly volume in last 3 days)',
                subCauses: ['Vendors incentivized to batch invoices for month-end'],
              },
              { text: 'Remote AP team lacks access to physical mail', subCauses: [] },
            ],
          },
          {
            name: 'Management',
            causes: [
              {
                text: 'No AP automation KPIs tracked — cost per invoice not measured',
                subCauses: ['AP metrics not in finance dashboard'],
              },
              {
                text: 'ERP automation configuration deprioritized vs. revenue-generating systems',
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
      title: 'Invoice Processing — Five Why Analysis',
      data: {
        problemStatement: 'AP team manually keys data for 1,200 invoices/month at $38/invoice',
        whys: [
          {
            question: 'Why is invoice data being keyed manually?',
            answer:
              'There is no automated data capture in place — staff receive PDFs and paper invoices and re-type each field into the ERP.',
          },
          {
            question: 'Why is there no automated data capture?',
            answer:
              'The SAP AP automation modules (including OCR capture) were purchased with the ERP license but the configuration project was never completed.',
          },
          {
            question: 'Why was the configuration project not completed?',
            answer:
              'The ERP administrator who started the project left the company 18 months ago and no one was assigned to pick up the work.',
          },
          {
            question: 'Why was the project not reassigned when the ERP admin left?',
            answer:
              'The project was not formally tracked — it existed as an informal initiative. When the admin left, there was no project record to reassign.',
          },
          {
            question: 'Why are IT improvement projects not formally tracked?',
            answer:
              'The company lacks a centralized IT project tracking process. Improvements to internal tools are managed informally and often lost during staff transitions.',
          },
        ],
        rootCause:
          'The SAP AP automation modules are already licensed but were never implemented due to an untracked configuration project that stalled after a key employee departure. This represents an addressable gap — not a tooling gap.',
      },
    },
  ],
  tickets: [
    {
      title: 'Quantify cost-per-invoice and identify top error sources',
      description:
        'Pull AP processing time logs and error reports from the ERP to calculate the exact cost per invoice and identify whether the highest error rates are in data entry, 3-way match failures, or approval routing.',
      status: 'done',
      priority: 'high',
      type: 'investigation',
    },
    {
      title: 'Assess current state of SAP AP automation module configuration',
      description:
        'Review the SAP system to determine exactly which automation modules are licensed, what was configured before the project stalled, and what remains to be completed.',
      status: 'done',
      priority: 'critical',
      type: 'investigation',
    },
    {
      title: 'Enforce PO-first procurement policy to reduce no-PO invoices',
      description:
        'Work with the Procurement Manager to mandate purchase orders before any goods or services are received, targeting a reduction of no-PO invoices from 42% to under 10%.',
      status: 'todo',
      priority: 'high',
      type: 'improvement',
    },
    {
      title: 'Complete SAP AP automation module configuration and OCR setup',
      description:
        'Re-engage the ERP administrator to resume and complete the SAP AP automation module configuration, including OCR invoice capture and automated 3-way match.',
      status: 'backlog',
      priority: 'critical',
      type: 'task',
    },
    {
      title: 'Clean vendor master data and remove duplicate or outdated records',
      description:
        'Audit the vendor master file to identify and merge the 18% of duplicate or outdated vendor records that are causing matching failures and manual intervention.',
      status: 'backlog',
      priority: 'medium',
      type: 'task',
    },
  ],
}

/* ============================================================
   Exports
   ============================================================ */

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  parkingLotSafety,
  customerOnboarding,
  manufacturingDefect,
  employeeTurnover,
  itHelpdeskResponse,
  warehouseInventory,
  patientWaitTime,
  softwareReleaseCycle,
  energyConsumption,
  invoiceProcessing,
]

export const getProjectTemplate = (id: string): ProjectTemplate | undefined =>
  PROJECT_TEMPLATES.find((t) => t.id === id)
