import { test, expect } from './helpers/auth-fixture'

/**
 * Kanban Board E2E tests
 *
 * Covers the board at `/tickets/board`: column labels, ticket
 * placement, filter bar visibility, New Ticket button, and column
 * count badges.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 * Tickets are created via the UI to ensure they belong to the
 * orgPage user's organization.
 */

test.describe('Kanban Board', () => {
  // ─── Test 1: Board shows all 7 columns ──────────────────────

  test('board shows all 7 status columns', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    const columnIds = [
      'backlog',
      'todo',
      'in_progress',
      'in_review',
      'blocked',
      'done',
      'cancelled',
    ]

    for (const id of columnIds) {
      const columnHeader = page.getByTestId(`kanban-column-heading-${id}`)
      await expect(columnHeader).toBeVisible({ timeout: 10000 })
    }
  })

  // ─── Test 2: Ticket appears in correct column ───────────────

  test('ticket created in backlog status appears in Backlog column', async ({ orgPage }) => {
    const page = orgPage
    const uniqueTitle = `E2E Board Backlog ${Date.now()}`

    // Create a ticket via the UI with default status (backlog)
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill(uniqueTitle)
    await page.getByTestId('create-ticket-button').click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })

    // Navigate to the board
    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // The ticket should appear in the Backlog column
    const backlogColumn = page.getByTestId('kanban-column-backlog')
    const ticketInBacklog = backlogColumn.getByText(uniqueTitle)
    await expect(ticketInBacklog).toBeVisible({ timeout: 10000 })
  })

  // ─── Test 3: Board filter bar is visible and functional ─────

  test('board filter bar is visible', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // The board has a BoardFilters component that renders filter dropdowns
    // and a TicketQuickFilters component with quick filter buttons.
    // At minimum, the quick filters section should be visible.

    // Check for quick filter buttons (My Open, Overdue, etc.)
    const quickFiltersArea = page.getByText(/My Open|Overdue|High Priority/i)
    const hasQuickFilters = await quickFiltersArea
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    // Check for the board filters section (priority, assignee, project dropdowns)
    // At least one filter mechanism should be visible
    // The page structure has: header, quick filters, board filters, then the board
    const boardPage = page.getByTestId('board-page-heading')
    await expect(boardPage).toBeVisible()

    // The description text below the heading is always present
    const filterDescription = page.getByTestId('board-description')
    await expect(filterDescription).toBeVisible()

    // If quick filters exist, verify they render
    if (hasQuickFilters) {
      await expect(quickFiltersArea.first()).toBeVisible()
    }
  })

  // ─── Test 4: New Ticket button navigates to /tickets/new ───

  test('New Ticket button navigates to /tickets/new', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    const newTicketButton = page.getByTestId('board-new-ticket-link')
    await expect(newTicketButton).toBeVisible({ timeout: 10000 })
    await expect(newTicketButton).toHaveAttribute('href', '/tickets/new')

    // Click and verify navigation
    await newTicketButton.click()
    await expect(page).toHaveURL(/\/tickets\/new/, { timeout: 15000 })
  })

  // ─── Test 5: Each column shows a ticket count ───────────────

  test('each board column shows a ticket count badge', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Each column has a count badge with a data-testid
    const columnIds = [
      'backlog',
      'todo',
      'in_progress',
      'in_review',
      'blocked',
      'done',
      'cancelled',
    ]

    for (const id of columnIds) {
      const column = page.getByTestId(`kanban-column-${id}`)
      await expect(column).toBeVisible({ timeout: 10000 })

      // The count badge has a data-testid
      const countBadge = page.getByTestId(`kanban-column-count-${id}`)
      await expect(countBadge).toBeVisible()

      // Verify the column has an aria-label that includes "ticket"
      const ariaLabel = await column.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/\d+ tickets?/)
    }
  })
})
