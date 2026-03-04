import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KnowledgeHubLanding } from '../knowledge-hub-landing'

describe('KnowledgeHubLanding', () => {
  it('renders the Knowledge Hub heading', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    expect(screen.getByText('Knowledge Hub')).toBeTruthy()
  })

  it('renders all 4 pillar cards', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    expect(screen.getByText('Book')).toBeTruthy()
    expect(screen.getByText('Interactive Guide')).toBeTruthy()
    expect(screen.getByText('Workbook')).toBeTruthy()
    expect(screen.getByText('Workshop')).toBeTruthy()
  })

  it('renders pillar descriptions', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    expect(screen.getByText(/Deep methodology content/)).toBeTruthy()
    expect(screen.getByText(/Step-by-step methodology/)).toBeTruthy()
    expect(screen.getByText(/Hands-on practice/)).toBeTruthy()
    expect(screen.getByText(/Facilitation in action/)).toBeTruthy()
  })

  it('renders search bar', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    expect(screen.getByPlaceholderText(/Search the Knowledge Hub/)).toBeTruthy()
  })

  it('renders bookmarks button', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    expect(screen.getByText('Bookmarks')).toBeTruthy()
  })

  it('shows bookmark count badge when count > 0', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={5} />)
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('does not show recently read section when empty', () => {
    render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    expect(screen.queryByText('Recently Read')).toBeNull()
  })

  it('shows recently read section with history items', () => {
    const history = [
      { content_node_id: 'book/ch04', last_read_at: '2026-03-03T12:00:00Z', read_count: 1 },
      { content_node_id: 'book/ch05', last_read_at: '2026-03-02T10:00:00Z', read_count: 2 },
    ]
    render(<KnowledgeHubLanding recentReadHistory={history} bookmarkCount={0} />)
    expect(screen.getByText('Recently Read')).toBeTruthy()
    expect(screen.getByText('book / ch04')).toBeTruthy()
    expect(screen.getByText('book / ch05')).toBeTruthy()
  })

  it('renders pillar cards as links', () => {
    const { container } = render(<KnowledgeHubLanding recentReadHistory={[]} bookmarkCount={0} />)
    const links = container.querySelectorAll('a[href*="/knowledge/"]')
    expect(links.length).toBeGreaterThanOrEqual(4)
  })
})
