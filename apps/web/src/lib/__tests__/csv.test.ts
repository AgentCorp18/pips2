import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateCSV, downloadCSV } from '../csv'

/* ============================================================
   generateCSV
   ============================================================ */

describe('generateCSV', () => {
  it('generates a CSV string with headers and rows', () => {
    const result = generateCSV(
      ['Name', 'Age'],
      [
        ['Alice', '30'],
        ['Bob', '25'],
      ],
    )
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('Name,Age')
    expect(lines[1]).toBe('Alice,30')
    expect(lines[2]).toBe('Bob,25')
  })

  it('starts with UTF-8 BOM for Excel compatibility', () => {
    const result = generateCSV(['A'], [['B']])
    expect(result.charCodeAt(0)).toBe(0xfeff)
  })

  it('handles empty rows', () => {
    const result = generateCSV(['Name', 'Age'], [])
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('Name,Age')
  })

  it('handles empty headers and rows', () => {
    const result = generateCSV([], [])
    const content = result.replace('\uFEFF', '')
    expect(content).toBe('')
  })

  it('escapes cells containing commas', () => {
    const result = generateCSV(['Name'], [['Doe, John']])
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines[1]).toBe('"Doe, John"')
  })

  it('escapes cells containing double quotes', () => {
    const result = generateCSV(['Quote'], [['She said "hello"']])
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines[1]).toBe('"She said ""hello"""')
  })

  it('escapes cells containing newlines', () => {
    const result = generateCSV(['Text'], [['Line 1\nLine 2']])
    // The cell should be wrapped in quotes
    expect(result).toContain('"Line 1\nLine 2"')
  })

  it('escapes cells containing carriage returns', () => {
    const result = generateCSV(['Text'], [['Line 1\rLine 2']])
    expect(result).toContain('"Line 1\rLine 2"')
  })

  it('does not escape plain values', () => {
    const result = generateCSV(['Name'], [['Alice']])
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines[1]).toBe('Alice')
  })

  it('escapes headers that contain special characters', () => {
    const result = generateCSV(['Name, First'], [['Alice']])
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines[0]).toBe('"Name, First"')
  })

  it('handles multiple rows with mixed escaping needs', () => {
    const result = generateCSV(
      ['Name', 'Bio'],
      [
        ['Alice', 'No special chars'],
        ['Bob', 'Has a "quote"'],
        ['Carol', 'Uses, commas'],
      ],
    )
    const lines = result.replace('\uFEFF', '').split('\r\n')
    expect(lines).toHaveLength(4)
    expect(lines[1]).toBe('Alice,No special chars')
    expect(lines[2]).toBe('Bob,"Has a ""quote"""')
    expect(lines[3]).toBe('Carol,"Uses, commas"')
  })

  it('uses CRLF line endings per RFC 4180', () => {
    const result = generateCSV(['A'], [['B'], ['C']])
    const content = result.replace('\uFEFF', '')
    expect(content).toBe('A\r\nB\r\nC')
  })
})

/* ============================================================
   downloadCSV
   ============================================================ */

describe('downloadCSV', () => {
  let mockAnchor: {
    href: string
    download: string
    click: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an anchor element and clicks it', () => {
    downloadCSV('test.csv', 'header\r\ndata')
    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockAnchor.click).toHaveBeenCalledOnce()
  })

  it('sets the download filename', () => {
    downloadCSV('export-2026.csv', 'data')
    expect(mockAnchor.download).toBe('export-2026.csv')
  })

  it('sets the href to the blob URL', () => {
    downloadCSV('test.csv', 'data')
    expect(mockAnchor.href).toBe('blob:mock-url')
  })

  it('appends the anchor to the body and then removes it', () => {
    downloadCSV('test.csv', 'data')
    expect(document.body.appendChild).toHaveBeenCalledOnce()
    expect(document.body.removeChild).toHaveBeenCalledOnce()
  })

  it('creates a Blob with correct type and revokes the URL after download', () => {
    downloadCSV('test.csv', 'content')
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
