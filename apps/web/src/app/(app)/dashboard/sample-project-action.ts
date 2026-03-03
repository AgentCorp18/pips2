'use server'

import { createClient } from '@/lib/supabase/server'

type SampleProjectResult = {
  projectId?: string
  error?: string
}

/** Create a pre-populated sample PIPS project for new users to explore */
export const createSampleProject = async (): Promise<SampleProjectResult> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in' }
  }

  // Get user's org
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: 'You must belong to an organization' }
  }

  // Create the sample project at Step 3 (Steps 1-2 completed)
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      org_id: membership.org_id,
      title: 'Parking Lot Safety Improvement',
      description:
        'Sample project: The company parking lot has 3x more safety incidents than the industry average. This pre-filled project demonstrates the PIPS methodology with completed Steps 1 and 2.',
      owner_id: user.id,
      current_step: 'generate',
      status: 'active',
    })
    .select('id')
    .single()

  if (projectError || !project) {
    return { error: 'Failed to create sample project. Please try again.' }
  }

  const projectId = project.id
  const now = new Date().toISOString()

  // Create 6 project steps (1-2 completed, 3 in progress, 4-6 not started)
  const steps = [
    {
      project_id: projectId,
      step: 'identify',
      status: 'completed',
      started_at: now,
      completed_at: now,
      completed_by: user.id,
    },
    {
      project_id: projectId,
      step: 'analyze',
      status: 'completed',
      started_at: now,
      completed_at: now,
      completed_by: user.id,
    },
    {
      project_id: projectId,
      step: 'generate',
      status: 'in_progress',
      started_at: now,
      completed_at: null,
      completed_by: null,
    },
    {
      project_id: projectId,
      step: 'select_plan',
      status: 'not_started',
      started_at: null,
      completed_at: null,
      completed_by: null,
    },
    {
      project_id: projectId,
      step: 'implement',
      status: 'not_started',
      started_at: null,
      completed_at: null,
      completed_by: null,
    },
    {
      project_id: projectId,
      step: 'evaluate',
      status: 'not_started',
      started_at: null,
      completed_at: null,
      completed_by: null,
    },
  ]

  const { error: stepsError } = await supabase.from('project_steps').insert(steps)

  if (stepsError) {
    await supabase.from('projects').delete().eq('id', projectId)
    return { error: 'Failed to create project steps. Please try again.' }
  }

  // Add creator as project member
  await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: user.id,
    role: 'lead',
  })

  // Insert pre-filled forms for Steps 1 and 2
  const forms = [
    // Step 1: Problem Statement
    {
      project_id: projectId,
      step: 'identify',
      form_type: 'problem_statement',
      title: 'Parking Lot Safety — Problem Statement',
      created_by: user.id,
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
    // Step 1: Impact Assessment
    {
      project_id: projectId,
      step: 'identify',
      form_type: 'impact_assessment',
      title: 'Parking Lot Safety — Impact Assessment',
      created_by: user.id,
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
    // Step 2: Fishbone Diagram
    {
      project_id: projectId,
      step: 'analyze',
      form_type: 'fishbone',
      title: 'Parking Lot Safety — Fishbone Diagram',
      created_by: user.id,
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
              { text: 'No incident reporting process until after injury', subCauses: [] },
              { text: 'Parking rules not communicated to new hires', subCauses: [] },
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
              { text: 'Pothole-damaged pavement creates hazards', subCauses: [] },
              { text: 'No reflective paint on curbs', subCauses: [] },
            ],
          },
          {
            name: 'Environment',
            causes: [
              { text: 'Poor drainage causes icy patches in winter', subCauses: [] },
              { text: 'No covered walkway from overflow lot', subCauses: [] },
            ],
          },
          {
            name: 'Management',
            causes: [
              { text: 'No dedicated safety budget for parking areas', subCauses: [] },
              { text: 'Parking lot excluded from annual safety audits', subCauses: [] },
            ],
          },
        ],
      },
    },
    // Step 2: Five Why Analysis
    {
      project_id: projectId,
      step: 'analyze',
      form_type: 'five_why',
      title: 'Parking Lot Safety — Five Why Analysis',
      created_by: user.id,
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
  ]

  const { error: formsError } = await supabase.from('project_forms').insert(forms)

  if (formsError) {
    return { error: 'Failed to create sample forms. Please try again.' }
  }

  return { projectId }
}
