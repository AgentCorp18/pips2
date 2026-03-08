import { describe, it, expect } from 'vitest'
import { projectUpdatedTemplate } from '../project-updated'

describe('projectUpdatedTemplate', () => {
  const defaultParams = {
    recipientName: 'Alice',
    projectName: 'Quality Initiative',
    newStep: 'Analyze',
    projectUrl: 'https://pips.com/projects/123',
  }

  it('returns a string', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(typeof result).toBe('string')
  })

  it('contains the project name', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(result).toContain('Quality Initiative')
  })

  it('contains the step name', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(result).toContain('Analyze')
  })

  it('contains the project URL', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(result).toContain('https://pips.com/projects/123')
  })

  it('includes step number for known steps', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(result).toContain('Step 2')
  })

  it('uses correct step color for Analyze', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(result).toContain('#F59E0B')
  })

  it('handles Identify step', () => {
    const result = projectUpdatedTemplate({ ...defaultParams, newStep: 'Identify' })
    expect(result).toContain('Step 1')
    expect(result).toContain('#3B82F6')
  })

  it('handles Generate step', () => {
    const result = projectUpdatedTemplate({ ...defaultParams, newStep: 'Generate' })
    expect(result).toContain('Step 3')
    expect(result).toContain('#10B981')
  })

  it('handles unknown step names gracefully', () => {
    const result = projectUpdatedTemplate({ ...defaultParams, newStep: 'Custom Step' })
    expect(result).toContain('Custom Step')
    expect(result).toContain('#4F46E5') // falls back to primary
  })

  it('wraps content in base template', () => {
    const result = projectUpdatedTemplate(defaultParams)
    expect(result).toContain('<!DOCTYPE html>')
  })

  it('escapes HTML in user input', () => {
    const result = projectUpdatedTemplate({
      ...defaultParams,
      projectName: '<b>Unsafe</b>',
    })
    expect(result).not.toContain('<b>Unsafe</b>')
    expect(result).toContain('&lt;b&gt;Unsafe&lt;/b&gt;')
  })
})
