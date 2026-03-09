import { test, expect } from './helpers/auth-fixture'

/**
 * Kanban Enhancements E2E tests
 *
 * Covers the ViewToggle board option on the tickets page,
 * KanbanBoard rendering, expand button, and expanded overlay.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 * Complements the existing kanban-board.spec.ts which covers
 * column labels, ticket placement, and count badges.
 */

test.describe('Kanban Enhancements', () => {
  // --- Test 1: Tickets page has board view option ---

  test('tickets page has board view toggle button', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // The tickets page heading should be visible
    const heading = page.getByTestId('tickets-page-heading')
    await expect(heading).toBeVisible({ timeout: 10000 })

    // ViewToggle should have a Board button
    const boardButton = page.getByTestId('view-toggle-board')
    await expect(boardButton).toBeVisible()
    await expect(boardButton).toHaveText(/Board/)
  })

  // --- Test 2: Board view renders KanbanBoard ---

  test('navigating to /tickets/board renders the KanbanBoard', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Board page heading
    const heading = page.getByTestId('board-page-heading')
    await expect(heading).toBeVisible({ timeout: 10000 })

    // At least one kanban column should be rendered
    const backlogColumn = page.getByTestId('kanban-column-backlog')
    await expect(backlogColumn).toBeVisible()

    // Verify all 7 columns exist
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
      await expect(column).toBeVisible()
    }
  })

  // --- Test 3: Expand button visible on board ---

  test('expand button is visible on the kanban board', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Expand button
    const expandButton = page.getByTestId('kanban-expand-button')
    await expect(expandButton).toBeVisible({ timeout: 10000 })
    await expect(expandButton).toHaveText(/Expand/)
  })

  // --- Test 4: Expanded overlay appears on click ---

  test('clicking expand shows the expanded overlay', async ({ orgPage }) => {
    const page = orgPage

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Click expand
    const expandButton = page.getByTestId('kanban-expand-button')
    await expect(expandButton).toBeVisible({ timeout: 10000 })
    await expandButton.click()

    // Expanded overlay should appear
    const overlay = page.getByTestId('kanban-expanded-overlay')
    await expect(overlay).toBeVisible({ timeout: 5000 })

    // Collapse button should be visible in the overlay
    const collapseButton = page.getByTestId('kanban-collapse-button')
    await expect(collapseButton).toBeVisible()

    // Click collapse to restore normal view
    await collapseButton.click()
    await expect(overlay).not.toBeVisible({ timeout: 5000 })
  })
})
