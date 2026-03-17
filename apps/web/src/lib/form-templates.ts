/**
 * Form Template Library — System templates with pre-filled starter form data.
 * These are lightweight project starters, distinct from PROJECT_TEMPLATES (full sample projects
 * with tickets). Form templates seed a new blank project with realistic starter data
 * that users can immediately customize.
 */

export type PipsStep = 'identify' | 'analyze' | 'generate' | 'select_plan' | 'implement' | 'evaluate'

export type FormTemplateEntry = {
  step: PipsStep
  formType: string
  title: string
  data: Record<string, unknown>
}

export type FormTemplate = {
  id: string
  name: string
  description: string
  vertical: 'manufacturing' | 'customer_service' | 'it' | 'hr' | 'quality'
  icon: string // Lucide icon name
  forms: FormTemplateEntry[]
}

export type VerticalConfig = {
  label: string
  color: string
}

export const VERTICALS: Record<FormTemplate['vertical'], VerticalConfig> = {
  manufacturing: { label: 'Manufacturing', color: '#D97706' },
  customer_service: { label: 'Customer Service', color: '#059669' },
  it: { label: 'IT / Technology', color: '#2563EB' },
  hr: { label: 'HR / People', color: '#7C3AED' },
  quality: { label: 'Quality', color: '#DC2626' },
}

export const SYSTEM_TEMPLATES: FormTemplate[] = [
  /* ──────────────────────────────────────────────────
     1. Manufacturing Defect Reduction
  ────────────────────────────────────────────────── */
  {
    id: 'manufacturing-defect-reduction',
    name: 'Manufacturing Defect Reduction',
    description:
      'Identify and eliminate root causes of product defects using 6M analysis and criteria-based solution selection.',
    vertical: 'manufacturing',
    icon: 'Factory',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'Current defect rate is 4.2% across Assembly Line B, generating an average of 840 defective units per week out of 20,000 produced.',
          desired: 'Reduce defect rate to below 1.0% (200 units/week) within 90 days, eliminating the top 3 defect categories.',
          gap: 'A 3.2 percentage point gap in defect rate results in approximately $126,000 in monthly rework and scrap costs.',
          problemStatement:
            'Assembly Line B is producing defective units at 4.2% — 4x the target rate of 1.0% — costing approximately $126,000 per month in rework and scrap, and causing downstream delivery delays.',
          teamMembers: ['Line Supervisor', 'Quality Engineer', 'Maintenance Technician', 'Process Engineer'],
          problemArea: 'Assembly Line B — Final Assembly Station',
          dataSources: ['Quality Control Reports', 'Scrap Log', 'Operator Shift Notes', 'Maintenance Records'],
        },
      },
      {
        step: 'analyze',
        formType: 'fishbone',
        title: 'Fishbone Analysis',
        data: {
          problemStatement:
            'Assembly Line B defect rate of 4.2% exceeds the 1.0% target.',
          categories: [
            {
              name: 'Man (People)',
              causes: [
                { text: 'Operator training inconsistency', subCauses: ['New hires lack structured onboarding', 'Training materials out of date'] },
                { text: 'Fatigue from 12-hour shifts', subCauses: ['Break schedule not enforced', 'Overtime volume too high'] },
              ],
            },
            {
              name: 'Machine (Equipment)',
              causes: [
                { text: 'Calibration drift on torque wrenches', subCauses: ['Calibration interval too long (90 days)', 'No in-process calibration checks'] },
                { text: 'Conveyor belt speed inconsistency', subCauses: ['Worn motor bearings', 'Outdated PLC software'] },
              ],
            },
            {
              name: 'Method (Process)',
              causes: [
                { text: 'No standard work instruction for rework station', subCauses: ['Work instructions last updated 3 years ago'] },
                { text: 'Inspection checkpoints insufficient', subCauses: ['In-process checks only at end of line'] },
              ],
            },
            {
              name: 'Material (Inputs)',
              causes: [
                { text: 'Incoming component quality variance', subCauses: ['Supplier A tolerance spec wider than required', 'Incoming inspection pass rate 96%'] },
                { text: 'Adhesive batch inconsistency', subCauses: ['Storage temperature fluctuation', 'Batch-to-batch viscosity variation'] },
              ],
            },
            {
              name: 'Measurement (Metrics)',
              causes: [
                { text: 'Defect codes too broad', subCauses: ['Cannot distinguish cosmetic vs. functional defects'] },
                { text: 'Delayed defect reporting', subCauses: ['End-of-shift reporting misses real-time correction'] },
              ],
            },
            {
              name: 'Mother Nature (Environment)',
              causes: [
                { text: 'Humidity affecting adhesive cure time', subCauses: ['No humidity control in Assembly Zone C'] },
              ],
            },
          ],
        },
      },
      {
        step: 'select_plan',
        formType: 'criteria_matrix',
        title: 'Solution Criteria Matrix',
        data: {
          criteria: [
            { name: 'Implementation Cost', weight: 8, description: 'Total upfront and ongoing cost to implement' },
            { name: 'Time to Impact', weight: 9, description: 'How quickly the solution reduces defects' },
            { name: 'Sustainability', weight: 7, description: 'Likelihood the improvement will hold long-term' },
            { name: 'Operator Acceptance', weight: 6, description: 'Ease of adoption by line operators' },
          ],
          solutions: [
            {
              name: 'Increase Inspection Frequency',
              scores: { 'Implementation Cost': 4, 'Time to Impact': 5, Sustainability: 3, 'Operator Acceptance': 4 },
            },
            {
              name: 'Retrain All Operators + Update SWIs',
              scores: { 'Implementation Cost': 3, 'Time to Impact': 3, Sustainability: 5, 'Operator Acceptance': 5 },
            },
            {
              name: 'Automated Vision Inspection System',
              scores: { 'Implementation Cost': 2, 'Time to Impact': 4, Sustainability: 5, 'Operator Acceptance': 3 },
            },
          ],
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     2. Customer Service Response Time
  ────────────────────────────────────────────────── */
  {
    id: 'customer-service-response-time',
    name: 'Customer Service Response Time',
    description:
      'Reduce average ticket response time using 5-Why analysis and focused brainstorming of process improvements.',
    vertical: 'customer_service',
    icon: 'Headphones',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'Average first response time is 6.4 hours across all inbound support channels. 38% of tickets breach the 4-hour SLA.',
          desired: 'Achieve average first response time of 2 hours or less, with fewer than 10% of tickets breaching SLA within 60 days.',
          gap: 'A 4.4-hour gap between current (6.4h) and target (2h) response time is causing customer satisfaction scores to decline (NPS dropped 12 points in Q3).',
          problemStatement:
            'Customer support tickets have an average first response time of 6.4 hours — 3.2x above our 2-hour target — resulting in 38% SLA breach rate and a 12-point NPS decline in the past quarter.',
          teamMembers: ['Support Manager', 'Senior Support Agent', 'Tier 1 Lead', 'CX Analyst'],
          problemArea: 'Inbound Support Queue — Tier 1 Response',
          dataSources: ['Zendesk Reports', 'SLA Dashboard', 'NPS Survey Data', 'Agent Utilization Report'],
        },
      },
      {
        step: 'analyze',
        formType: 'five_why',
        title: '5-Why Analysis',
        data: {
          problemStatement:
            'Average first response time is 6.4 hours, missing 2-hour SLA target.',
          whys: [
            { question: 'Why are response times exceeding 6 hours?', answer: 'Agents are spending too long resolving Tier 1 tickets before triaging new inbound tickets.' },
            { question: 'Why are agents resolving before triaging?', answer: 'There is no defined triage window — agents work tickets start-to-finish in queue order.' },
            { question: 'Why is there no triage window?', answer: 'The current workflow was set up 4 years ago for a team half the current size; it was never updated.' },
            { question: 'Why was the workflow not updated as the team grew?', answer: 'Support managers did not have visibility into response time SLA trends until Q3 dashboards were added.' },
            { question: 'Why was dashboard visibility added only in Q3?', answer: 'The analytics platform was not connected to the support tool until the Q2 integration project.' },
          ],
          rootCause:
            'The legacy queue-order workflow has no triage protocol, and there was no SLA visibility to prompt a workflow review until Q3.',
        },
      },
      {
        step: 'generate',
        formType: 'brainstorming',
        title: 'Solution Brainstorming',
        data: {
          ideas: [
            { id: '1', text: 'Implement a 15-minute triage window at the start of every hour where agents only send first responses', author: 'Support Manager', votes: 5, category: 'Process' },
            { id: '2', text: 'Auto-assign inbound tickets to dedicated triage agents during peak hours (9am–12pm)', author: 'Tier 1 Lead', votes: 4, category: 'Staffing' },
            { id: '3', text: 'Create canned first-response templates for top 10 ticket categories to cut compose time', author: 'Senior Agent', votes: 5, category: 'Tools' },
            { id: '4', text: 'Add SLA countdown timer visible to all agents in queue view', author: 'CX Analyst', votes: 3, category: 'Tools' },
            { id: '5', text: 'Shift 2 agents from Tier 2 escalations to Tier 1 response during AM peak', author: 'Support Manager', votes: 2, category: 'Staffing' },
            { id: '6', text: 'Auto-acknowledge inbound tickets within 5 minutes via automation rule', author: 'CX Analyst', votes: 4, category: 'Automation' },
          ],
          selectedIdeas: ['1', '3', '4', '6'],
          eliminatedIdeas: [],
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     3. IT Incident Reduction
  ────────────────────────────────────────────────── */
  {
    id: 'it-incident-reduction',
    name: 'IT Incident Reduction',
    description:
      'Reduce recurring IT incidents by analyzing root causes and building a phased implementation plan.',
    vertical: 'it',
    icon: 'ServerCrash',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'The organization experiences an average of 47 P1/P2 IT incidents per month, with mean time to resolution (MTTR) of 3.8 hours. 62% of incidents are recurring — caused by the same underlying issues.',
          desired: 'Reduce total monthly incidents to below 20, eliminate the top 5 recurring incident patterns, and bring MTTR below 1.5 hours within 4 months.',
          gap: 'A 27-incident-per-month gap and 2.3-hour MTTR gap cost approximately $340,000 per year in productivity loss based on 500 affected users and $25/hour average fully-loaded cost.',
          problemStatement:
            'IT is responding to 47 P1/P2 incidents per month — 2.35x the target of 20 — with 62% being recurring incidents that could be prevented, costing an estimated $340K/year in productivity.',
          teamMembers: ['IT Operations Manager', 'Senior SysAdmin', 'Network Engineer', 'Service Desk Lead'],
          problemArea: 'Production Infrastructure — Network & Server Layer',
          dataSources: ['ServiceNow Incident Reports', 'Monitoring Dashboards', 'Post-Incident Review Notes', 'Change Management Log'],
        },
      },
      {
        step: 'analyze',
        formType: 'fishbone',
        title: 'Fishbone Analysis',
        data: {
          problemStatement:
            '47 P1/P2 incidents per month with 62% recurrence rate and 3.8h MTTR.',
          categories: [
            {
              name: 'People',
              causes: [
                { text: 'On-call engineers lack runbooks for recurring issues', subCauses: ['Runbooks never written', 'Tribal knowledge only with senior staff'] },
                { text: 'Change approvals missing from non-IT stakeholders', subCauses: ['CAB meeting attendance inconsistent'] },
              ],
            },
            {
              name: 'Process',
              causes: [
                { text: 'No post-incident review (PIR) process', subCauses: ['Resolved incidents closed without root cause', 'No tracking of recurring patterns'] },
                { text: 'Change management bypassed during emergencies', subCauses: ['Emergency change process not defined', 'Fear of slow CAB process causes workarounds'] },
              ],
            },
            {
              name: 'Technology',
              causes: [
                { text: 'Alert fatigue from non-actionable monitoring alerts', subCauses: ['Alert thresholds set too low', '200+ alerts/day — 80% noise'] },
                { text: 'End-of-life hardware (3 servers past EoL)', subCauses: ['Budget approval delayed 18 months', 'No hardware lifecycle tracking'] },
              ],
            },
            {
              name: 'Environment',
              causes: [
                { text: 'Data center cooling intermittent in summer', subCauses: ['HVAC unit serviced only annually'] },
              ],
            },
            {
              name: 'Measurement',
              causes: [
                { text: 'Incident severity classification inconsistent', subCauses: ['P1 vs P2 criteria not documented', 'Different teams apply criteria differently'] },
              ],
            },
            {
              name: 'Materials / Tools',
              causes: [
                { text: 'No CMDB (Configuration Management Database)', subCauses: ['Dependencies between services unknown', 'Impact analysis during incidents is manual'] },
              ],
            },
          ],
        },
      },
      {
        step: 'select_plan',
        formType: 'implementation_plan',
        title: 'IT Incident Reduction Implementation Plan',
        data: {
          selectedSolution:
            'Implement Post-Incident Review (PIR) process + Runbook library + Alert tuning to break the recurrence cycle',
          tasks: [
            { id: '1', title: 'Document PIR process and launch for all P1 incidents', assignee: 'IT Ops Manager', dueDate: '', status: 'not_started', notes: 'Use ITIL PIR template as starting point' },
            { id: '2', title: 'Write runbooks for top 10 recurring incident types', assignee: 'Senior SysAdmin', dueDate: '', status: 'not_started', notes: 'Prioritize network flap, disk full, and certificate expiry' },
            { id: '3', title: 'Audit and tune monitoring alert thresholds', assignee: 'Network Engineer', dueDate: '', status: 'not_started', notes: 'Target: reduce alert volume by 60%' },
            { id: '4', title: 'Define P1/P2 severity classification criteria', assignee: 'Service Desk Lead', dueDate: '', status: 'not_started', notes: 'Align with business impact framework' },
            { id: '5', title: 'Build incident trend dashboard (recurring pattern tracking)', assignee: 'IT Ops Manager', dueDate: '', status: 'not_started', notes: '' },
          ],
          timeline: '4 months — PIR and runbooks in Month 1-2, alert tuning Month 2-3, measurement Month 4',
          resources: 'IT Ops team (existing headcount), monitoring tool license upgrade (~$2,400/yr)',
          budget: '$4,000 estimated (tooling + external PIR workshop facilitation)',
          risks: [
            { risk: 'Team resistant to PIR process (perceived as blame)', mitigation: 'Frame PIRs as blameless; focus on systems not individuals' },
            { risk: 'Alert tuning may miss real alerts initially', mitigation: 'Parallel run old and new thresholds for 2 weeks before cutover' },
          ],
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     4. Employee Onboarding Improvement
  ────────────────────────────────────────────────── */
  {
    id: 'employee-onboarding-improvement',
    name: 'Employee Onboarding Improvement',
    description:
      'Shorten time-to-productivity for new hires using force field analysis and a clear accountability framework.',
    vertical: 'hr',
    icon: 'UserCheck',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'New employees reach full productivity at an average of 14 weeks post-hire. Exit surveys show 22% of Year 1 departures cite poor onboarding as a contributing factor.',
          desired: 'Reduce time-to-full-productivity to 8 weeks or less, and reduce onboarding-related Year 1 attrition by 50% within 6 months.',
          gap: 'A 6-week time-to-productivity gap affects approximately 80 new hires per year. At an estimated $4,000/week fully-loaded cost per new hire, the gap represents $1.9M annually in delayed productivity.',
          problemStatement:
            'New hires take 14 weeks to reach full productivity — 75% longer than the 8-week target — contributing to $1.9M/year in delayed output and 22% of Year 1 voluntary turnover.',
          teamMembers: ['HR Director', 'L&D Manager', 'Hiring Managers (3)', 'IT Provisioning Lead'],
          problemArea: 'New Hire Onboarding — Weeks 1–14',
          dataSources: ['HRIS Time-to-Productivity Reports', 'New Hire 30/60/90-day Survey', 'Exit Interview Data', 'Manager Feedback Forms'],
        },
      },
      {
        step: 'analyze',
        formType: 'force_field',
        title: 'Force Field Analysis',
        data: {
          problemStatement:
            'New hire time-to-productivity is 14 weeks vs. 8-week target.',
          drivingForces: [
            { text: 'Strong leadership commitment to improving employee experience', strength: 4 },
            { text: 'Budget approved for LMS system upgrade', strength: 3 },
            { text: 'HR team has onboarding redesign as Q2 OKR', strength: 5 },
            { text: 'Peer buddy program already partially in place', strength: 3 },
          ],
          restrainingForces: [
            { text: 'Hiring managers deprioritize onboarding vs. team deliverables', strength: 4 },
            { text: 'IT provisioning takes 5-7 days — new hires idle in first week', strength: 5 },
            { text: 'No standardized 30/60/90 day plan templates by role', strength: 4 },
            { text: 'Onboarding content is outdated (last updated 2021)', strength: 3 },
            { text: 'Cross-department coordination is ad-hoc (no onboarding checklist owner)', strength: 4 },
          ],
          strategy:
            'Focus on removing the top 3 restraining forces: IT pre-provisioning, standardized role-based 30/60/90 plans, and a dedicated onboarding coordinator role.',
        },
      },
      {
        step: 'select_plan',
        formType: 'raci',
        title: 'Onboarding RACI Matrix',
        data: {
          activities: [
            'IT equipment pre-provisioning (Day -5)',
            'Create personalized 30/60/90 day plan',
            'Assign peer buddy',
            'Week 1 orientation program',
            'Role-specific training (Weeks 2-4)',
            'Manager 1:1 check-ins (Weeks 1-8)',
            '30-day new hire survey',
            '90-day productivity assessment',
          ],
          people: ['HR Director', 'Hiring Manager', 'IT Lead', 'L&D Manager', 'Peer Buddy'],
          matrix: {
            'IT equipment pre-provisioning (Day -5)': {
              'HR Director': 'A',
              'Hiring Manager': 'C',
              'IT Lead': 'R',
              'L&D Manager': 'I',
              'Peer Buddy': 'I',
            },
            'Create personalized 30/60/90 day plan': {
              'HR Director': 'C',
              'Hiring Manager': 'R',
              'IT Lead': 'I',
              'L&D Manager': 'C',
              'Peer Buddy': 'I',
            },
            'Assign peer buddy': {
              'HR Director': 'R',
              'Hiring Manager': 'C',
              'IT Lead': 'I',
              'L&D Manager': 'I',
              'Peer Buddy': '',
            },
            'Week 1 orientation program': {
              'HR Director': 'A',
              'Hiring Manager': 'C',
              'IT Lead': 'C',
              'L&D Manager': 'R',
              'Peer Buddy': 'C',
            },
            'Role-specific training (Weeks 2-4)': {
              'HR Director': 'I',
              'Hiring Manager': 'A',
              'IT Lead': 'I',
              'L&D Manager': 'R',
              'Peer Buddy': 'C',
            },
            'Manager 1:1 check-ins (Weeks 1-8)': {
              'HR Director': 'I',
              'Hiring Manager': 'R',
              'IT Lead': 'I',
              'L&D Manager': 'I',
              'Peer Buddy': 'C',
            },
            '30-day new hire survey': {
              'HR Director': 'R',
              'Hiring Manager': 'C',
              'IT Lead': 'I',
              'L&D Manager': 'C',
              'Peer Buddy': 'I',
            },
            '90-day productivity assessment': {
              'HR Director': 'A',
              'Hiring Manager': 'R',
              'IT Lead': 'I',
              'L&D Manager': 'C',
              'Peer Buddy': 'I',
            },
          },
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     5. Quality Audit Remediation
  ────────────────────────────────────────────────── */
  {
    id: 'quality-audit-remediation',
    name: 'Quality Audit Remediation',
    description:
      'Address findings from a quality audit systematically with a structured checksheet and implementation checklist.',
    vertical: 'quality',
    icon: 'ClipboardCheck',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'The annual ISO 9001 audit identified 2 major nonconformances and 11 minor nonconformances across Quality Management System documentation, process controls, and calibration records.',
          desired: 'Close all 13 nonconformances within 90 days and achieve zero major findings in the next surveillance audit (6 months).',
          gap: 'The 2 major nonconformances risk ISO 9001 certification suspension within 30 days if not corrected with a documented corrective action plan.',
          problemStatement:
            'The Q4 ISO 9001 audit identified 2 major and 11 minor nonconformances, placing certification at risk. All findings must be closed within 90 days to maintain certification.',
          teamMembers: ['Quality Manager', 'Document Control Specialist', 'Production Supervisor', 'Calibration Technician'],
          problemArea: 'Quality Management System — Documentation, Process Controls, Calibration',
          dataSources: ['ISO 9001 Audit Report', 'Audit Finding Detail Sheets', 'Corrective Action Register', 'Previous Surveillance Audit Report'],
        },
      },
      {
        step: 'analyze',
        formType: 'checksheet',
        title: 'Nonconformance Tracking Checksheet',
        data: {
          title: 'ISO 9001 Nonconformance Tracking — Q4 Audit',
          categories: [
            { id: 'major', label: 'Major Nonconformances' },
            { id: 'minor', label: 'Minor Nonconformances' },
            { id: 'opportunity', label: 'Opportunities for Improvement' },
          ],
          timePeriods: [
            { id: 'clause-4', label: 'Clause 4 (Context)' },
            { id: 'clause-6', label: 'Clause 6 (Planning)' },
            { id: 'clause-7', label: 'Clause 7 (Support)' },
            { id: 'clause-8', label: 'Clause 8 (Operations)' },
            { id: 'clause-9', label: 'Clause 9 (Performance)' },
            { id: 'clause-10', label: 'Clause 10 (Improvement)' },
          ],
          tallies: {
            'major-clause-7': 1,
            'major-clause-8': 1,
            'minor-clause-4': 1,
            'minor-clause-6': 2,
            'minor-clause-7': 3,
            'minor-clause-8': 3,
            'minor-clause-9': 1,
            'minor-clause-10': 1,
            'opportunity-clause-7': 2,
            'opportunity-clause-9': 1,
          },
          notes:
            'Major NC #1 (Clause 7): Calibration records for 14 instruments are missing or expired. Major NC #2 (Clause 8): Documented procedures for 3 critical processes have not been reviewed in >3 years.',
        },
      },
      {
        step: 'implement',
        formType: 'implementation_checklist',
        title: 'Corrective Action Checklist',
        data: {
          items: [
            { id: '1', text: 'Create corrective action plan (CAP) document for auditor submission', completed: false, assignee: 'Quality Manager', notes: 'Must be submitted within 10 business days', category: 'Documentation' },
            { id: '2', text: 'Audit all calibration records and identify expired/missing instruments', completed: false, assignee: 'Calibration Technician', notes: 'Major NC #1 — priority', category: 'Calibration' },
            { id: '3', text: 'Recalibrate or replace 14 instruments with lapsed calibration', completed: false, assignee: 'Calibration Technician', notes: 'External calibration lab lead time: 5 days', category: 'Calibration' },
            { id: '4', text: 'Implement calibration reminder system (calendar alerts)', completed: false, assignee: 'Quality Manager', notes: 'Preventive action for NC #1', category: 'Calibration' },
            { id: '5', text: 'Review and update 3 critical process procedure documents', completed: false, assignee: 'Document Control Specialist', notes: 'Major NC #2 — need sign-off from Production Supervisor', category: 'Documentation' },
            { id: '6', text: 'Implement annual document review schedule in QMS', completed: false, assignee: 'Document Control Specialist', notes: 'Preventive action — update document control procedure', category: 'Documentation' },
            { id: '7', text: 'Close out 11 minor nonconformances with documented root cause and correction', completed: false, assignee: 'Quality Manager', notes: 'Assign each minor NC to a department owner', category: 'Nonconformances' },
            { id: '8', text: 'Conduct internal pre-audit (mock audit) before surveillance audit', completed: false, assignee: 'Quality Manager', notes: 'Schedule 4 weeks before surveillance audit date', category: 'Audit Prep' },
          ],
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     6. Process Cycle Time Reduction
  ────────────────────────────────────────────────── */
  {
    id: 'process-cycle-time-reduction',
    name: 'Process Cycle Time Reduction',
    description:
      'Identify the vital few causes of cycle time delays using Pareto analysis and milestone-based tracking.',
    vertical: 'manufacturing',
    icon: 'Timer',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'The order-to-ship cycle time averages 11.2 days. Customer contractual target is 5 days. 34% of orders miss the 5-day commitment, generating penalty credits averaging $8,200/month.',
          desired: 'Reduce average order-to-ship cycle time to 5 days or less, eliminating 90% of SLA breach penalties within 3 months.',
          gap: 'A 6.2-day average cycle time gap costs approximately $98,400 per year in penalty credits plus estimated $220,000 in lost renewal business from dissatisfied customers.',
          problemStatement:
            'Order-to-ship cycle time of 11.2 days is 2.24x the 5-day target, causing $98,400/year in SLA penalties and contributing to customer churn.',
          teamMembers: ['Operations Manager', 'Order Entry Supervisor', 'Warehouse Manager', 'Shipping Coordinator'],
          problemArea: 'Order Processing → Fulfillment → Shipping',
          dataSources: ['ERP Cycle Time Report', 'Order Delay Log', 'Customer Penalty Invoice Register', 'Process Mapping Workshop Output'],
        },
      },
      {
        step: 'analyze',
        formType: 'pareto',
        title: 'Cycle Time Delay Pareto Analysis',
        data: {
          title: 'Root Causes of Order-to-Ship Delays (Last 90 Days)',
          categories: [
            { id: '1', name: 'Inventory stockout — item not available at pick', count: 142, percentage: 38.4, cumulative: 38.4 },
            { id: '2', name: 'Order entry error requiring correction', count: 89, percentage: 24.1, cumulative: 62.5 },
            { id: '3', name: 'Approval bottleneck for orders >$10K', count: 64, percentage: 17.3, cumulative: 79.8 },
            { id: '4', name: 'Carrier pickup missed — scheduling failure', count: 31, percentage: 8.4, cumulative: 88.2 },
            { id: '5', name: 'Packing materials out of stock', count: 22, percentage: 5.9, cumulative: 94.1 },
            { id: '6', name: 'System downtime / ERP issue', count: 14, percentage: 3.8, cumulative: 97.9 },
            { id: '7', name: 'Other / miscellaneous', count: 8, percentage: 2.1, cumulative: 100.0 },
          ],
          eightyTwentyLine:
            'Top 3 causes (inventory stockout, order entry errors, approval bottleneck) account for 79.8% of all delay incidents.',
          notes:
            'Data collected from 370 delayed orders over Q3-Q4. Focus corrective action on causes 1-3 to capture ~80% of improvement opportunity.',
        },
      },
      {
        step: 'implement',
        formType: 'milestone_tracker',
        title: 'Cycle Time Reduction Milestones',
        data: {
          milestones: [
            { id: '1', title: 'Implement reorder point alerts for top 50 SKUs', targetDate: '', completedDate: null, status: 'pending', description: 'Address root cause #1 (inventory stockout)', deliverables: ['Reorder point calculations complete', 'ERP min/max settings updated', 'Buyer alerts activated'] },
            { id: '2', title: 'Launch order entry validation checklist + training', targetDate: '', completedDate: null, status: 'pending', description: 'Address root cause #2 (order entry errors)', deliverables: ['Validation checklist created', 'All order entry staff trained', 'Error rate baseline measured'] },
            { id: '3', title: 'Redesign approval workflow — raise threshold to $25K, add delegation rules', targetDate: '', completedDate: null, status: 'pending', description: 'Address root cause #3 (approval bottleneck)', deliverables: ['New approval policy drafted', 'Policy approved by Finance', 'Workflow updated in ERP'] },
            { id: '4', title: 'Measure 30-day post-implementation cycle time', targetDate: '', completedDate: null, status: 'pending', description: 'Verify improvement vs. baseline of 11.2 days', deliverables: ['30-day cycle time report', 'SLA breach rate comparison', 'Penalty credit comparison'] },
          ],
          overallProgress: 0,
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     7. Cost Reduction Initiative
  ────────────────────────────────────────────────── */
  {
    id: 'cost-reduction-initiative',
    name: 'Cost Reduction Initiative',
    description:
      'Systematically evaluate cost reduction opportunities with a cost-benefit analysis and balance sheet.',
    vertical: 'quality',
    icon: 'TrendingDown',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'Operating expenses in the Facilities department are $2.1M annually. Department budget was set at $1.8M, creating a $300,000 overage. The three largest overages are energy ($95K), contract maintenance ($87K), and office supplies/consumables ($62K).',
          desired: 'Reduce Facilities OpEx to $1.8M or below within the current fiscal year, eliminating the $300K budget overage without impacting service levels.',
          gap: 'A $300,000 annual budget overage (14% above budget) is reducing net operating margin and has triggered a mandatory cost review from Finance.',
          problemStatement:
            'Facilities department is operating $300,000 over budget (14% overage) driven primarily by energy, contract maintenance, and consumables costs, requiring a reduction plan to reach the $1.8M target.',
          teamMembers: ['Facilities Manager', 'Finance Business Partner', 'Energy Manager', 'Procurement Lead'],
          problemArea: 'Facilities Operations — Energy, Maintenance Contracts, Consumables',
          dataSources: ['GL Expense Report', 'Utility Bills (12 months)', 'Vendor Contract Register', 'Purchase Order History'],
        },
      },
      {
        step: 'select_plan',
        formType: 'cost_benefit',
        title: 'Cost Reduction Cost-Benefit Analysis',
        data: {
          solutionName: 'Facilities Cost Reduction — Combined Initiative (Energy + Contracts + Consumables)',
          costs: [
            { id: '1', description: 'LED lighting retrofit — 3 buildings', amount: 28000, frequency: 'one_time', category: 'Capital' },
            { id: '2', description: 'Energy management software license', amount: 4800, frequency: 'annual', category: 'Software' },
            { id: '3', description: 'Contract renegotiation — external consultant', amount: 6000, frequency: 'one_time', category: 'Professional Services' },
            { id: '4', description: 'Consumables tracking system (barcodes + scanner)', amount: 1200, frequency: 'one_time', category: 'Technology' },
          ],
          benefits: [
            { id: '1', description: 'Energy savings from LED retrofit + HVAC scheduling', amount: 62000, frequency: 'annual', category: 'Energy' },
            { id: '2', description: 'Contract renegotiation savings (maintenance)', amount: 45000, frequency: 'annual', category: 'Contracts' },
            { id: '3', description: 'Consumables reduction from usage tracking + bulk buying', amount: 28000, frequency: 'annual', category: 'Consumables' },
          ],
          netBenefit: 94000,
          paybackPeriod: '4.7 months on capital investment',
          recommendation:
            'Proceed with all three workstreams simultaneously. The $135K annual recurring savings exceeds the $300K overage reduction target by $35K, providing budget buffer.',
        },
      },
      {
        step: 'evaluate',
        formType: 'balance_sheet',
        title: 'Initiative Balance Sheet',
        data: {
          gains: [
            { id: '1', description: '$62K/year energy cost reduction from LED + HVAC optimization', impact: 'high', evidence: 'Based on utility bill analysis and vendor ROI calculator' },
            { id: '2', description: '$45K/year maintenance contract savings via competitive rebid', impact: 'high', evidence: 'Preliminary quotes from 2 alternative vendors are 22% lower' },
            { id: '3', description: '$28K/year consumables savings from usage visibility and bulk purchasing', impact: 'medium', evidence: 'Similar organizations report 15-25% reduction with usage tracking' },
            { id: '4', description: 'Improved budget predictability and Finance relationship', impact: 'medium', evidence: 'Qualitative — Finance Director committed to budget restoration if target achieved' },
          ],
          losses: [
            { id: '1', description: '$40K upfront capital investment required', impact: 'medium', mitigation: 'Payback in under 5 months; approved within existing CapEx authority' },
            { id: '2', description: '2-3 month disruption during LED installation', impact: 'low', mitigation: 'Phased installation during weekends; temporary lighting provided' },
            { id: '3', description: 'Staff time for contract renegotiation process', impact: 'low', mitigation: 'External consultant handles negotiations; Facilities Manager limited to 4 hours/week' },
          ],
          observations: [
            { id: '1', description: 'Energy savings depend on consistent HVAC schedule adherence', category: 'Risk' },
            { id: '2', description: 'Contract renegotiation may affect vendor relationships', category: 'Relationship' },
          ],
          summary:
            'The combined initiative delivers $135K/year in recurring savings against $40K upfront investment. All three workstreams are viable and achievable within the fiscal year.',
          recommendation: 'sustain',
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     8. Workplace Safety Improvement
  ────────────────────────────────────────────────── */
  {
    id: 'workplace-safety-improvement',
    name: 'Workplace Safety Improvement',
    description:
      'Reduce workplace safety incidents through root cause analysis and structured evaluation of prevention measures.',
    vertical: 'manufacturing',
    icon: 'ShieldAlert',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'The facility has recorded 18 recordable safety incidents in the past 12 months (OSHA 300 log), resulting in a Total Recordable Incident Rate (TRIR) of 3.6 — above the industry average of 2.1 and above the company target of 1.5.',
          desired: 'Reduce TRIR to 1.5 or below within 12 months by eliminating the top 3 incident categories (slips/trips, struck-by, and ergonomic strains).',
          gap: 'A TRIR of 3.6 vs. a 1.5 target represents 8 preventable incidents per year. Each recordable incident costs an estimated $38,000 in direct and indirect costs.',
          problemStatement:
            'Facility TRIR of 3.6 is 2.4x the company target of 1.5, representing approximately 8 preventable incidents per year costing ~$304,000 in direct and indirect costs annually.',
          teamMembers: ['EHS Manager', 'Operations Supervisor', 'Safety Committee Chair', 'HR Manager'],
          problemArea: 'Warehouse Floor and Loading Dock Operations',
          dataSources: ['OSHA 300 Log', 'Incident Investigation Reports', 'Near-Miss Reports', 'TRIR Benchmarking Data'],
        },
      },
      {
        step: 'analyze',
        formType: 'fishbone',
        title: 'Safety Incident Fishbone',
        data: {
          problemStatement:
            'TRIR of 3.6 — 2.4x above the 1.5 target — with slips/trips, struck-by, and ergonomic strains as top 3 categories.',
          categories: [
            {
              name: 'People',
              causes: [
                { text: 'Rushing behaviors during shift end', subCauses: ['Production pressure to meet end-of-shift targets', 'Safety shortcuts normalized over time'] },
                { text: 'New hire safety training gaps', subCauses: ['On-the-job training ad-hoc, no formal sign-off', 'New hires paired with less safety-aware veterans'] },
              ],
            },
            {
              name: 'Environment',
              causes: [
                { text: 'Wet floor surfaces in Dock 3', subCauses: ['Drainage grate installed incorrectly in 2022', 'No non-slip matting at dock entry'] },
                { text: 'Poor lighting in Aisle 7 and Aisle 9', subCauses: ['3 of 8 overhead lights burned out', 'Replacement delayed due to height access requirement'] },
              ],
            },
            {
              name: 'Equipment',
              causes: [
                { text: 'Forklift path conflicts with pedestrian zones', subCauses: ['Pedestrian lanes not marked', 'No physical barrier between forklift and foot traffic areas'] },
                { text: 'Manual lifting of heavy boxes at low ergonomic height', subCauses: ['Conveyor height fixed — cannot be adjusted', 'No mechanical assist available for heavy SKUs'] },
              ],
            },
            {
              name: 'Methods',
              causes: [
                { text: 'No formal near-miss reporting culture', subCauses: ['Near misses seen as "nothing happened" — not reported', 'No feedback loop when near misses are reported'] },
                { text: 'Housekeeping standards not enforced', subCauses: ['5S audit not conducted in 8 months', 'No accountability assigned for aisle clearing'] },
              ],
            },
            {
              name: 'Measurement',
              causes: [
                { text: 'TRIR only reviewed monthly — lagging indicator', subCauses: ['No leading indicator tracking (near misses, unsafe conditions)', 'Safety KPIs only visible to EHS team, not operators'] },
              ],
            },
            {
              name: 'Management',
              causes: [
                { text: 'Safety not included in supervisor performance reviews', subCauses: ['Supervisors optimized on productivity metrics only'] },
              ],
            },
          ],
        },
      },
      {
        step: 'evaluate',
        formType: 'evaluation',
        title: 'Safety Program Evaluation',
        data: {
          goalsAchieved: false,
          goalDetails:
            'Use this template field to document actual results after completing the improvement program. Update with measured TRIR, incident counts by category, and comparison to baseline.',
          effectivenessRating: 3,
          sustainabilityRating: 3,
          teamSatisfactionRating: 3,
          unexpectedOutcomes:
            'Document any unexpected outcomes, positive or negative, that emerged during the improvement program.',
          recommendations:
            'Document recommendations for maintaining improvements and next steps for continuing the safety program.',
          nextSteps:
            'Define next steps for sustaining the improvement, including scheduled reviews, ongoing training, and future targets.',
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     9. Compliance Gap Remediation
  ────────────────────────────────────────────────── */
  {
    id: 'compliance-gap-remediation',
    name: 'Compliance Gap Remediation',
    description:
      'Close compliance gaps identified in a regulatory review using structured tracking and an implementation plan.',
    vertical: 'quality',
    icon: 'Scale',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'A regulatory readiness review identified 4 critical gaps, 9 significant gaps, and 14 minor gaps across data privacy, access controls, and documentation requirements. Current compliance posture is assessed at 61% ready vs. 90% minimum required.',
          desired: 'Achieve 90% compliance readiness score within 120 days, closing all 4 critical gaps within 30 days and all significant gaps within 90 days.',
          gap: 'A 29-percentage-point compliance gap (61% actual vs. 90% required) exposes the organization to regulatory fines estimated at $500K–$2M and potential loss of operating license.',
          problemStatement:
            'Regulatory readiness is at 61% — 29 points below the 90% minimum — with 4 critical gaps posing immediate fine and license risk if not addressed within 30 days.',
          teamMembers: ['Compliance Manager', 'IT Security Lead', 'Legal Counsel', 'Operations Director'],
          problemArea: 'Data Privacy, Access Controls, and Process Documentation',
          dataSources: ['Regulatory Readiness Assessment Report', 'Gap Analysis Matrix', 'Prior Audit Findings', 'Regulatory Guidance Documents'],
        },
      },
      {
        step: 'analyze',
        formType: 'checksheet',
        title: 'Compliance Gap Tracking Checksheet',
        data: {
          title: 'Regulatory Gap Status — Current Assessment',
          categories: [
            { id: 'critical', label: 'Critical Gaps (30-day remediation required)' },
            { id: 'significant', label: 'Significant Gaps (90-day target)' },
            { id: 'minor', label: 'Minor Gaps (120-day target)' },
          ],
          timePeriods: [
            { id: 'data-privacy', label: 'Data Privacy' },
            { id: 'access-controls', label: 'Access Controls' },
            { id: 'documentation', label: 'Documentation' },
            { id: 'incident-response', label: 'Incident Response' },
            { id: 'vendor-mgmt', label: 'Vendor Management' },
          ],
          tallies: {
            'critical-data-privacy': 2,
            'critical-access-controls': 1,
            'critical-incident-response': 1,
            'significant-data-privacy': 3,
            'significant-access-controls': 2,
            'significant-documentation': 2,
            'significant-vendor-mgmt': 2,
            'minor-documentation': 6,
            'minor-vendor-mgmt': 4,
            'minor-incident-response': 4,
          },
          notes:
            'Critical gaps: (1) No data subject access request (DSAR) process, (2) PII data map outdated >18 months, (3) Privileged access review not completed in 12 months, (4) No documented incident response playbook.',
        },
      },
      {
        step: 'select_plan',
        formType: 'implementation_plan',
        title: 'Compliance Remediation Plan',
        data: {
          selectedSolution:
            'Phased remediation: Critical gaps first (30 days), then significant gaps (Days 31-90), then minor gaps (Days 91-120)',
          tasks: [
            { id: '1', title: 'Create and document DSAR process + intake form', assignee: 'Compliance Manager', dueDate: '', status: 'not_started', notes: 'Critical gap #1 — legal counsel review required' },
            { id: '2', title: 'Complete PII data mapping exercise', assignee: 'IT Security Lead', dueDate: '', status: 'not_started', notes: 'Critical gap #2 — use data mapping tool, update annually' },
            { id: '3', title: 'Complete privileged access review + revoke unnecessary access', assignee: 'IT Security Lead', dueDate: '', status: 'not_started', notes: 'Critical gap #3 — document results and schedule quarterly review' },
            { id: '4', title: 'Write and test incident response playbook', assignee: 'Compliance Manager', dueDate: '', status: 'not_started', notes: 'Critical gap #4 — tabletop exercise required within 30 days of completion' },
            { id: '5', title: 'Close 9 significant gaps per gap analysis matrix', assignee: 'Operations Director', dueDate: '', status: 'not_started', notes: 'Assign each gap to a department owner with 2-week check-ins' },
            { id: '6', title: 'Conduct internal compliance readiness assessment (pre-audit)', assignee: 'Compliance Manager', dueDate: '', status: 'not_started', notes: 'Target 90%+ score before external assessment' },
          ],
          timeline: '120 days — Critical (Day 1-30), Significant (Day 31-90), Minor (Day 91-120), Final Assessment (Day 120)',
          resources: 'Internal team + external compliance consultant for playbook review ($8,000)',
          budget: '$15,000 estimated (consultant + tooling + training)',
          risks: [
            { risk: 'Critical gaps take longer than 30 days to close', mitigation: 'Escalate to executive sponsor immediately if milestone is at risk; request regulatory extension if needed' },
            { risk: 'IT access review uncovers significant unauthorized access', mitigation: 'Have legal counsel on standby; follow incident response protocol if data breach is discovered' },
          ],
        },
      },
    ],
  },

  /* ──────────────────────────────────────────────────
     10. Customer Satisfaction (NPS) Improvement
  ────────────────────────────────────────────────── */
  {
    id: 'customer-satisfaction-nps-improvement',
    name: 'Customer Satisfaction (NPS) Improvement',
    description:
      'Improve Net Promoter Score by understanding customer pain points through surveying and targeted brainstorming.',
    vertical: 'customer_service',
    icon: 'Star',
    forms: [
      {
        step: 'identify',
        formType: 'problem_statement',
        title: 'Problem Statement',
        data: {
          asIs: 'Current NPS score is 28, measured from 847 respondents in the Q3 survey. Industry benchmark is 45. Detractors (score 0-6) represent 31% of respondents, with the top verbatim themes being: slow support, difficulty finding help content, and billing confusion.',
          desired: 'Increase NPS to 45 or above (matching industry benchmark) within 2 survey cycles (6 months). Reduce detractor percentage from 31% to below 20%.',
          gap: 'A 17-point NPS gap (28 actual vs. 45 target) correlates with higher churn — analysis shows customers with NPS ≤6 churn at 2.8x the rate of promoters, representing ~$420,000 in incremental annual revenue risk.',
          problemStatement:
            'NPS of 28 is 17 points below the industry benchmark of 45. Detractors (31% of respondents) churn at 2.8x the rate of promoters, placing $420,000 in annual revenue at risk.',
          teamMembers: ['VP Customer Experience', 'Support Manager', 'Product Manager', 'Billing Operations Lead'],
          problemArea: 'Post-purchase customer experience — Support, Self-Service, and Billing',
          dataSources: ['Q3 NPS Survey Results', 'Verbatim Comment Analysis', 'Churn Analysis Report', 'Support Ticket Categorization Report'],
        },
      },
      {
        step: 'generate',
        formType: 'surveying',
        title: 'Customer Pain Point Survey',
        data: {
          title: 'Customer Experience Deep-Dive Survey — Detractor Segment',
          targetAudience: 'Detractors (NPS 0-6) from Q3 survey — estimated 263 customers',
          questions: [
            {
              id: '1',
              text: 'What was the primary reason you gave us a score of [X] out of 10?',
              type: 'open_ended',
              options: [],
            },
            {
              id: '2',
              text: 'Which area of your experience was most frustrating?',
              type: 'multiple_choice',
              options: ['Getting support when I needed it', 'Finding answers in self-service resources', 'Understanding my bill or pricing', 'Product features or reliability', 'Onboarding and setup', 'Other'],
            },
            {
              id: '3',
              text: 'How satisfied are you with the time it takes to resolve your support issues?',
              type: 'rating',
              options: [],
            },
            {
              id: '4',
              text: 'How easy is it to find answers to your questions without contacting support?',
              type: 'rating',
              options: [],
            },
            {
              id: '5',
              text: 'What single change would most improve your experience with us?',
              type: 'open_ended',
              options: [],
            },
          ],
          respondents: [],
          summary:
            'Survey to be conducted via email to Q3 detractor segment. Target 60+ responses (23% response rate). Results will inform Step 3 brainstorming and Step 4 prioritization.',
        },
      },
      {
        step: 'generate',
        formType: 'brainstorming',
        title: 'NPS Improvement Ideas',
        data: {
          ideas: [
            { id: '1', text: 'Launch proactive outreach to detractors within 24 hours of NPS response with personal follow-up call', author: 'VP CX', votes: 5, category: 'Retention' },
            { id: '2', text: 'Rebuild help center with AI-powered search and top-10 issue quick-links', author: 'Product Manager', votes: 4, category: 'Self-Service' },
            { id: '3', text: 'Redesign billing statement to show plain-language breakdown of charges', author: 'Billing Ops Lead', votes: 5, category: 'Billing' },
            { id: '4', text: 'Implement dedicated support queue for high-value accounts (>$500/month)', author: 'Support Manager', votes: 4, category: 'Support' },
            { id: '5', text: 'Create in-product feedback widget that captures satisfaction at key moments (not just annual survey)', author: 'Product Manager', votes: 3, category: 'Measurement' },
            { id: '6', text: 'Close-the-loop program: send summary of changes made based on customer feedback quarterly', author: 'VP CX', votes: 4, category: 'Communication' },
            { id: '7', text: 'Streamline support ticket routing to reduce average number of handoffs per ticket', author: 'Support Manager', votes: 3, category: 'Support' },
          ],
          selectedIdeas: ['1', '3', '2', '4'],
          eliminatedIdeas: [],
        },
      },
    ],
  },
]
