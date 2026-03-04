import { describe, it, expect } from 'vitest'
import { WORKSHOP_TEMPLATES } from '../workshop-templates'

describe('WORKSHOP_TEMPLATES', () => {
  it('exports at least 3 templates', () => {
    expect(WORKSHOP_TEMPLATES.length).toBeGreaterThanOrEqual(3)
  })

  it('each template has required fields', () => {
    for (const template of WORKSHOP_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.name).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(template.duration).toBeTruthy()
      expect(Array.isArray(template.modules)).toBe(true)
      expect(template.modules.length).toBeGreaterThan(0)
    }
  })

  it('each module has title, duration, and notes', () => {
    for (const template of WORKSHOP_TEMPLATES) {
      for (const mod of template.modules) {
        expect(mod.title).toBeTruthy()
        expect(mod.duration).toBeTruthy()
        expect(typeof mod.notes).toBe('string')
      }
    }
  })

  it('template IDs are unique', () => {
    const ids = WORKSHOP_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('problem-solving-sprint has correct module count', () => {
    const sprint = WORKSHOP_TEMPLATES.find((t) => t.id === 'problem-solving-sprint')
    expect(sprint).toBeDefined()
    expect(sprint!.modules.length).toBe(7)
  })

  it('full-day-training has correct module count', () => {
    const fullDay = WORKSHOP_TEMPLATES.find((t) => t.id === 'full-day-training')
    expect(fullDay).toBeDefined()
    expect(fullDay!.modules.length).toBe(11)
  })

  it('quick-fishbone has correct module count', () => {
    const fishbone = WORKSHOP_TEMPLATES.find((t) => t.id === 'quick-fishbone')
    expect(fishbone).toBeDefined()
    expect(fishbone!.modules.length).toBe(6)
  })

  it('brainstorming-workshop has correct module count', () => {
    const brainstorm = WORKSHOP_TEMPLATES.find((t) => t.id === 'brainstorming-workshop')
    expect(brainstorm).toBeDefined()
    expect(brainstorm!.modules.length).toBe(4)
  })
})
