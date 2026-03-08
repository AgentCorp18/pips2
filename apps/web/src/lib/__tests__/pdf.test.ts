import { describe, it, expect, vi } from 'vitest'

vi.mock('jspdf', () => {
  return {
    jsPDF: class MockJsPDF {
      setFontSize = vi.fn()
      setFont = vi.fn()
      setTextColor = vi.fn()
      text = vi.fn()
      setDrawColor = vi.fn()
      setLineWidth = vi.fn()
      line = vi.fn()
      splitTextToSize = vi.fn().mockReturnValue(['line1'])
      addPage = vi.fn()
      getNumberOfPages = vi.fn().mockReturnValue(1)
      setPage = vi.fn()
      output = vi.fn().mockReturnValue(new ArrayBuffer(10))
    },
  }
})

import { generateProjectPDF, downloadPDF, type ProjectPDFData } from '../pdf'

const sampleProject: ProjectPDFData = {
  name: 'Test Project',
  description: 'A test project description',
  status: 'in_progress',
  currentStep: 2,
  currentStepName: 'Analyze',
  createdAt: '2026-01-15T00:00:00Z',
  targetDate: '2026-06-15T00:00:00Z',
  ownerName: 'Alice',
  problemStatement: 'We need to reduce defect rates by 50%',
  steps: [
    { number: 1, name: 'Identify', status: 'completed' },
    { number: 2, name: 'Analyze', status: 'in_progress' },
    { number: 3, name: 'Generate', status: 'not_started' },
  ],
  tickets: {
    total: 10,
    open: 3,
    inProgress: 2,
    review: 1,
    done: 3,
    blocked: 1,
  },
  members: [
    { displayName: 'Alice', role: 'owner' },
    { displayName: 'Bob', role: 'member' },
  ],
}

describe('generateProjectPDF', () => {
  it('returns a value (Uint8Array/ArrayBuffer)', () => {
    const result = generateProjectPDF(sampleProject)
    expect(result).toBeDefined()
  })

  it('does not throw for a complete project', () => {
    expect(() => generateProjectPDF(sampleProject)).not.toThrow()
  })

  it('handles project without description', () => {
    const noDescProject = { ...sampleProject, description: null }
    expect(() => generateProjectPDF(noDescProject)).not.toThrow()
  })

  it('handles project without problem statement', () => {
    const noPSProject = { ...sampleProject, problemStatement: null }
    expect(() => generateProjectPDF(noPSProject)).not.toThrow()
  })

  it('handles project without target date', () => {
    const noDateProject = { ...sampleProject, targetDate: null }
    expect(() => generateProjectPDF(noDateProject)).not.toThrow()
  })

  it('handles empty members array', () => {
    const noMembersProject = { ...sampleProject, members: [] }
    expect(() => generateProjectPDF(noMembersProject)).not.toThrow()
  })

  it('handles all step statuses', () => {
    const allStatusProject = {
      ...sampleProject,
      steps: [
        { number: 1, name: 'Identify', status: 'completed' as const },
        { number: 2, name: 'Analyze', status: 'in_progress' as const },
        { number: 3, name: 'Generate', status: 'skipped' as const },
        { number: 4, name: 'Select', status: 'not_started' as const },
      ],
    }
    expect(() => generateProjectPDF(allStatusProject)).not.toThrow()
  })
})

describe('downloadPDF', () => {
  it('creates and clicks an anchor element', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    }
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockAnchor as unknown as HTMLElement)
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockReturnValue(null as unknown as HTMLElement)
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockReturnValue(null as unknown as HTMLElement)
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined)

    const data = new Uint8Array([1, 2, 3])
    downloadPDF('test.pdf', data)

    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(mockAnchor.download).toBe('test.pdf')
    expect(mockAnchor.click).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalled()

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
    createObjectURLSpy.mockRestore()
    revokeObjectURLSpy.mockRestore()
  })
})
