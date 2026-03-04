import type { WorkshopModule } from '@/app/(app)/knowledge/workshop/actions'

export type WorkshopTemplate = {
  id: string
  name: string
  description: string
  duration: string
  modules: WorkshopModule[]
}

export const WORKSHOP_TEMPLATES: WorkshopTemplate[] = [
  {
    id: 'problem-solving-sprint',
    name: '2-Hour Problem Solving Sprint',
    description: 'Fast-paced session covering Steps 1-3: Identify, Analyze, and Generate solutions',
    duration: '2 hours',
    modules: [
      {
        title: 'Welcome & Problem Overview',
        duration: '10 min',
        notes: 'Set context and ground rules',
      },
      {
        title: 'Step 1: Problem Statement Writing',
        duration: '25 min',
        notes: 'As-Is / Desired State / Gap format',
      },
      {
        title: 'Step 2: Quick Root Cause Analysis',
        duration: '30 min',
        notes: 'Fishbone diagram + 5-Why on top cause',
      },
      { title: 'Break', duration: '5 min', notes: '' },
      { title: 'Step 3: Brainstorming', duration: '25 min', notes: 'Brainwriting 6-3-5 technique' },
      {
        title: 'Cluster & Prioritize Ideas',
        duration: '15 min',
        notes: 'Dot voting on solution themes',
      },
      { title: 'Wrap-up & Next Steps', duration: '10 min', notes: 'Assign owners for top 3 ideas' },
    ],
  },
  {
    id: 'full-day-training',
    name: 'Full-Day PIPS Training',
    description: 'Comprehensive training covering all 6 PIPS steps with hands-on exercises',
    duration: '6 hours',
    modules: [
      {
        title: 'Introduction to PIPS',
        duration: '30 min',
        notes: 'Methodology overview and team roles',
      },
      {
        title: 'Step 1: Identify',
        duration: '45 min',
        notes: 'Problem statement workshop with real examples',
      },
      {
        title: 'Step 2: Analyze',
        duration: '45 min',
        notes: 'Fishbone, 5-Why, force field analysis',
      },
      { title: 'Morning Break', duration: '15 min', notes: '' },
      {
        title: 'Step 3: Generate',
        duration: '40 min',
        notes: 'Brainwriting and brainstorming exercises',
      },
      {
        title: 'Step 4: Select & Plan',
        duration: '50 min',
        notes: 'Criteria matrix, RACI, implementation plan',
      },
      { title: 'Lunch Break', duration: '45 min', notes: '' },
      {
        title: 'Step 5: Implement',
        duration: '40 min',
        notes: 'Milestone tracking and checklist creation',
      },
      {
        title: 'Step 6: Evaluate',
        duration: '40 min',
        notes: 'Before/after comparison, lessons learned',
      },
      {
        title: 'Full Cycle Practice',
        duration: '30 min',
        notes: 'Mini PIPS cycle on a practice scenario',
      },
      {
        title: 'Q&A and Wrap-up',
        duration: '20 min',
        notes: 'Action items and certification next steps',
      },
    ],
  },
  {
    id: 'quick-fishbone',
    name: 'Quick Fishbone Session',
    description: 'Focused 45-minute root cause analysis using fishbone diagrams',
    duration: '45 min',
    modules: [
      { title: 'Problem Review', duration: '5 min', notes: 'Read the problem statement aloud' },
      {
        title: 'Silent Brainstorm',
        duration: '8 min',
        notes: 'Write causes on sticky notes (6M categories)',
      },
      {
        title: 'Build the Fishbone',
        duration: '12 min',
        notes: 'Place and discuss causes on the diagram',
      },
      { title: 'Dot Voting', duration: '5 min', notes: '3 dots per person on most likely causes' },
      { title: '5-Why Drill', duration: '10 min', notes: 'Deep dive on top 2 voted causes' },
      { title: 'Document Findings', duration: '5 min', notes: 'Summarize validated root causes' },
    ],
  },
  {
    id: 'brainstorming-workshop',
    name: 'Brainstorming Workshop',
    description: 'One-hour ideation session using brainwriting 6-3-5 and rapid clustering',
    duration: '1 hour',
    modules: [
      {
        title: 'Ground Rules',
        duration: '5 min',
        notes: 'No criticism, quantity over quality, build on ideas',
      },
      {
        title: 'Brainwriting 6-3-5',
        duration: '30 min',
        notes: '5 rounds: write 3 ideas, pass sheet, repeat',
      },
      { title: 'Read & Cluster', duration: '15 min', notes: 'Group similar ideas into themes' },
      {
        title: 'Bonus Round & Wrap-up',
        duration: '10 min',
        notes: 'One more idea per person, then summary',
      },
    ],
  },
]
