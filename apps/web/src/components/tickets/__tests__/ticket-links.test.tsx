import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TicketLinks } from '../ticket-links'
import type { TicketLinksData } from '@/app/(app)/tickets/[ticketId]/link-actions'

/* ============================================================
   Mocks
   ============================================================ */

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const mockAddTicketLink = vi.fn()
const mockRemoveTicketLink = vi.fn()
const mockSearchTickets = vi.fn()

vi.mock('@/app/(app)/tickets/[ticketId]/link-actions', () => ({
  addTicketLink: (...args: unknown[]) => mockAddTicketLink(...args),
  removeTicketLink: (...args: unknown[]) => mockRemoveTicketLink(...args),
  searchTickets: (...args: unknown[]) => mockSearchTickets(...args),
}))

/* ============================================================
   Test Data
   ============================================================ */

const EMPTY_LINKS: TicketLinksData = {
  blocking: [],
  blockedBy: [],
  related: [],
}

const LINKS_WITH_DATA: TicketLinksData = {
  blocking: [
    {
      id: 'ticket-2',
      linkId: 'link-1',
      title: 'Fix authentication bug',
      sequence_number: 2,
      status: 'in_progress',
    },
  ],
  blockedBy: [
    {
      id: 'ticket-3',
      linkId: 'link-2',
      title: 'Database migration',
      sequence_number: 3,
      status: 'todo',
    },
  ],
  related: [
    {
      id: 'ticket-4',
      linkId: 'link-3',
      title: 'Update docs',
      sequence_number: 4,
      status: 'done',
    },
  ],
}

const DEFAULT_PROPS = {
  ticketId: 'ticket-1',
  orgId: 'org-1',
  ticketPrefix: 'TKT',
  initialLinks: EMPTY_LINKS,
}

/* ============================================================
   Tests
   ============================================================ */

describe('TicketLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchTickets.mockResolvedValue({ data: [] })
    mockAddTicketLink.mockResolvedValue({})
    mockRemoveTicketLink.mockResolvedValue({})
  })

  describe('empty state', () => {
    it('renders the Linked Tickets heading', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      expect(screen.getByText('Linked Tickets')).toBeTruthy()
    })

    it('shows empty state message when no links', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('ticket-links-empty')).toBeTruthy()
      expect(screen.getByText('No linked tickets yet')).toBeTruthy()
    })

    it('renders the Add Link button', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      expect(screen.getByTestId('add-ticket-link-button')).toBeTruthy()
    })
  })

  describe('with links', () => {
    it('renders blocking section', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByTestId('blocking-section')).toBeTruthy()
      expect(screen.getByText('Blocks')).toBeTruthy()
    })

    it('renders blocked-by section', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByTestId('blocked-by-section')).toBeTruthy()
      expect(screen.getByText('Blocked By')).toBeTruthy()
    })

    it('renders related section', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByTestId('related-section')).toBeTruthy()
      expect(screen.getByText('Related To')).toBeTruthy()
    })

    it('renders linked ticket titles', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByText('Fix authentication bug')).toBeTruthy()
      expect(screen.getByText('Database migration')).toBeTruthy()
      expect(screen.getByText('Update docs')).toBeTruthy()
    })

    it('renders sequence IDs with prefix', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByText('TKT-2')).toBeTruthy()
      expect(screen.getByText('TKT-3')).toBeTruthy()
      expect(screen.getByText('TKT-4')).toBeTruthy()
    })

    it('links to ticket detail pages', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      const ticketLink = screen.getByTestId('linked-ticket-ticket-2')
      expect(ticketLink.getAttribute('href')).toBe('/tickets/ticket-2')
    })

    it('shows remove button for blocking tickets', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByTestId('remove-link-ticket-2')).toBeTruthy()
    })

    it('shows remove button for related tickets', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.getByTestId('remove-link-ticket-4')).toBeTruthy()
    })

    it('does not show remove button for blocked-by tickets', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.queryByTestId('remove-link-ticket-3')).toBeNull()
    })

    it('shows link count in heading', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      // 1 blocking + 1 blockedBy + 1 related = 3
      expect(screen.getByText('3')).toBeTruthy()
    })

    it('does not show empty state when links exist', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      expect(screen.queryByTestId('ticket-links-empty')).toBeNull()
    })

    it('applies strikethrough to done tickets', () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)
      const doneTicketTitle = screen.getByText('Update docs')
      expect(doneTicketTitle.className).toContain('line-through')
    })
  })

  describe('Add Link form', () => {
    it('opens add form when Add Link button clicked', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      expect(screen.getByTestId('add-link-form')).toBeTruthy()
    })

    it('shows Cancel button when form is open', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      expect(screen.getByText('Cancel')).toBeTruthy()
    })

    it('closes add form when Cancel clicked', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      expect(screen.getByTestId('add-link-form')).toBeTruthy()
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      expect(screen.queryByTestId('add-link-form')).toBeNull()
    })

    it('renders link type selector with Blocks and Related to options', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      expect(screen.getByTestId('link-type-select')).toBeTruthy()
    })

    it('renders search input', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      expect(screen.getByTestId('ticket-link-search-input')).toBeTruthy()
    })

    it('Add Link button is disabled when no ticket selected', () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))
      const addBtn = screen.getByTestId('confirm-add-link-button')
      expect(addBtn.hasAttribute('disabled')).toBe(true)
    })

    it('calls searchTickets when user types in search input', async () => {
      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))

      const input = screen.getByTestId('ticket-link-search-input')
      fireEvent.change(input, { target: { value: 'auth' } })

      await waitFor(() => {
        expect(mockSearchTickets).toHaveBeenCalledWith('org-1', 'auth', 'ticket-1')
      })
    })

    it('shows search results dropdown', async () => {
      mockSearchTickets.mockResolvedValue({
        data: [
          { id: 'ticket-5', title: 'Auth feature', sequence_number: 5, status: 'todo', linkId: '' },
        ],
      })

      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))

      const input = screen.getByTestId('ticket-link-search-input')
      fireEvent.change(input, { target: { value: 'auth' } })

      await waitFor(() => {
        expect(screen.getByTestId('ticket-link-search-results')).toBeTruthy()
        expect(screen.getByText('Auth feature')).toBeTruthy()
      })
    })

    it('selecting a search result populates the input', async () => {
      mockSearchTickets.mockResolvedValue({
        data: [
          {
            id: 'ticket-5',
            title: 'Auth feature',
            sequence_number: 5,
            status: 'todo',
            linkId: '',
          },
        ],
      })

      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))

      const input = screen.getByTestId('ticket-link-search-input')
      fireEvent.change(input, { target: { value: 'auth' } })

      await waitFor(() => screen.getByText('Auth feature'))
      fireEvent.click(screen.getByText('Auth feature'))

      // Input should now contain the selected ticket info
      const updatedInput = screen.getByTestId('ticket-link-search-input') as HTMLInputElement
      expect(updatedInput.value).toContain('TKT-5')
      expect(updatedInput.value).toContain('Auth feature')
    })

    it('enables Add Link button after selecting a ticket', async () => {
      mockSearchTickets.mockResolvedValue({
        data: [
          { id: 'ticket-5', title: 'Auth feature', sequence_number: 5, status: 'todo', linkId: '' },
        ],
      })

      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))

      const input = screen.getByTestId('ticket-link-search-input')
      fireEvent.change(input, { target: { value: 'auth' } })

      await waitFor(() => screen.getByText('Auth feature'))
      fireEvent.click(screen.getByText('Auth feature'))

      const addBtn = screen.getByTestId('confirm-add-link-button')
      expect(addBtn.hasAttribute('disabled')).toBe(false)
    })

    it('calls addTicketLink when Add Link is clicked with selection', async () => {
      mockSearchTickets.mockResolvedValue({
        data: [
          { id: 'ticket-5', title: 'Auth feature', sequence_number: 5, status: 'todo', linkId: '' },
        ],
      })

      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))

      const input = screen.getByTestId('ticket-link-search-input')
      fireEvent.change(input, { target: { value: 'auth' } })

      await waitFor(() => screen.getByText('Auth feature'))
      fireEvent.click(screen.getByText('Auth feature'))

      fireEvent.click(screen.getByTestId('confirm-add-link-button'))

      await waitFor(() => {
        expect(mockAddTicketLink).toHaveBeenCalledWith('ticket-1', 'ticket-5', 'related')
      })
    })

    it('shows error when addTicketLink fails', async () => {
      mockAddTicketLink.mockResolvedValue({ error: 'This link already exists' })
      mockSearchTickets.mockResolvedValue({
        data: [
          { id: 'ticket-5', title: 'Auth feature', sequence_number: 5, status: 'todo', linkId: '' },
        ],
      })

      render(<TicketLinks {...DEFAULT_PROPS} />)
      fireEvent.click(screen.getByTestId('add-ticket-link-button'))

      const input = screen.getByTestId('ticket-link-search-input')
      fireEvent.change(input, { target: { value: 'auth' } })

      await waitFor(() => screen.getByText('Auth feature'))
      fireEvent.click(screen.getByText('Auth feature'))

      fireEvent.click(screen.getByTestId('confirm-add-link-button'))

      await waitFor(() => {
        expect(screen.getByTestId('ticket-link-add-error')).toBeTruthy()
        expect(screen.getByText('This link already exists')).toBeTruthy()
      })
    })
  })

  describe('removing links', () => {
    it('calls removeTicketLink when remove button clicked for blocking link', async () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)

      fireEvent.click(screen.getByTestId('remove-link-ticket-2'))

      await waitFor(() => {
        expect(mockRemoveTicketLink).toHaveBeenCalledWith('link-1')
      })
    })

    it('calls removeTicketLink when remove button clicked for related link', async () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)

      fireEvent.click(screen.getByTestId('remove-link-ticket-4'))

      await waitFor(() => {
        expect(mockRemoveTicketLink).toHaveBeenCalledWith('link-3')
      })
    })

    it('removes link from UI after successful removal', async () => {
      render(<TicketLinks {...DEFAULT_PROPS} initialLinks={LINKS_WITH_DATA} />)

      expect(screen.getByText('Fix authentication bug')).toBeTruthy()

      fireEvent.click(screen.getByTestId('remove-link-ticket-2'))

      await waitFor(() => {
        expect(screen.queryByText('Fix authentication bug')).toBeNull()
      })
    })
  })
})
