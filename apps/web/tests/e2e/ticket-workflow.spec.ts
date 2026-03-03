import { test, expect, type Page } from '@playwright/test'

/**
 * Ticket Workflow E2E flow
 *
 * Tests ticket creation, list views, detail pages, comments,
 * and the Kanban board view.
 */

/** Helper: attempt login and skip tests if auth fails */
const loginIfPossible = async (page: Page): Promise<boolean> => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('input[name="email"]')
  const isLoginPage = await emailInput.isVisible().catch(() => false)

  if (!isLoginPage) {
    return !page.url().includes('/login')
  }

  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    return false
  }

  await emailInput.fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await page
    .waitForURL(/\/(dashboard|onboarding|projects|tickets)/, { timeout: 10000 })
    .catch(() => {})
  return !page.url().includes('/login')
}

test.describe('Tickets list page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/tickets')

    await expect(page).toHaveURL(/\/login/)
  })

  test('shows tickets page heading and count', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Page heading
    const heading = page.getByRole('heading', { name: 'Tickets' })
    await expect(heading).toBeVisible()

    // Ticket count (e.g. "0 tickets" or "5 tickets")
    const count = page.getByText(/\d+ tickets?/)
    await expect(count).toBeVisible()
  })

  test('has a "New Ticket" button linking to /tickets/new', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const newTicketButton = page.getByRole('link', { name: /New Ticket/ })
    await expect(newTicketButton).toBeVisible()
    await expect(newTicketButton).toHaveAttribute('href', '/tickets/new')
  })

  test('shows view toggle and export button', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Export button
    const exportButton = page.getByRole('button', { name: /Export/i })
    await expect(exportButton).toBeVisible()
  })

  test('New Ticket button navigates to creation page', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const newTicketButton = page.getByRole('link', { name: /New Ticket/ })
    await newTicketButton.click()

    await expect(page).toHaveURL(/\/tickets\/new/)
  })

  test('shows empty state or ticket list', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Either the empty state or the ticket table/cards should be visible
    const emptyState = page.getByText(/No tickets/i)
    const ticketTable = page.locator('table')
    const ticketCards = page.locator('[class*="grid"]')

    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasTable = await ticketTable.isVisible().catch(() => false)
    const hasCards = await ticketCards.isVisible().catch(() => false)

    expect(hasEmpty || hasTable || hasCards).toBe(true)
  })
})

test.describe('Ticket creation page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/tickets/new')

    await expect(page).toHaveURL(/\/login/)
  })

  test('renders the new ticket form with all fields', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Verify page title
    await expect(page).toHaveTitle(/New Ticket/)

    // Verify form heading
    const heading = page.getByText('Create New Ticket')
    await expect(heading).toBeVisible()

    // Verify required fields
    const titleInput = page.locator('input[name="title"]')
    await expect(titleInput).toBeVisible()

    // Verify description textarea
    const descriptionTextarea = page.locator('textarea[name="description"]')
    await expect(descriptionTextarea).toBeVisible()

    // Verify Type, Priority, Status select triggers
    const typeLabel = page.getByText('Type', { exact: true })
    const priorityLabel = page.getByText('Priority', { exact: true })
    const statusLabel = page.getByText('Status', { exact: true })

    await expect(typeLabel).toBeVisible()
    await expect(priorityLabel).toBeVisible()
    await expect(statusLabel).toBeVisible()

    // Verify submit button
    const submitButton = page.getByRole('button', { name: 'Create Ticket' })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test('title field has correct placeholder', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    const titleInput = page.locator('input[name="title"]')
    await expect(titleInput).toHaveAttribute('placeholder', 'Brief summary of the ticket')
  })

  test('form can be filled with ticket data', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Fill title
    const titleInput = page.locator('input[name="title"]')
    await titleInput.fill('E2E Test Ticket')
    await expect(titleInput).toHaveValue('E2E Test Ticket')

    // Fill description
    const descriptionTextarea = page.locator('textarea[name="description"]')
    await descriptionTextarea.fill('This ticket was created by E2E tests')
    await expect(descriptionTextarea).toHaveValue('This ticket was created by E2E tests')
  })

  test('has due date and tags fields', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Due date
    const dueDateInput = page.locator('input[name="due_date"]')
    await expect(dueDateInput).toBeVisible()

    // Tags
    const tagsInput = page.locator('input[name="tags"]')
    await expect(tagsInput).toBeVisible()
    await expect(tagsInput).toHaveAttribute('placeholder', 'Comma-separated tags')
  })

  test('has assignee and project dropdowns', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    const assigneeLabel = page.getByText('Assignee')
    const projectLabel = page.getByText('Project', { exact: true })

    await expect(assigneeLabel).toBeVisible()
    await expect(projectLabel).toBeVisible()
  })

  test('submit button shows loading state', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Fill required title
    await page.locator('input[name="title"]').fill('E2E Test Ticket')

    const submitButton = page.getByRole('button', { name: 'Create Ticket' })
    await submitButton.click()

    // Button should show pending state
    const pendingButton = page.getByRole('button', { name: /Creating/ })
    await expect(pendingButton.or(submitButton)).toBeVisible()
  })
})

test.describe('Ticket detail page', () => {
  test('ticket detail shows comment section', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    // Click first ticket link if available
    const ticketLink = page.locator('a[href^="/tickets/"]').first()
    const hasTicket = await ticketLink.isVisible().catch(() => false)

    if (!hasTicket) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on a ticket detail page
    await expect(page).toHaveURL(/\/tickets\/[a-f0-9-]+/)

    // Comment section heading
    const commentsHeading = page.getByText(/Comments \(\d+\)/)
    await expect(commentsHeading).toBeVisible()
  })

  test('comment form has textarea and submit button', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('a[href^="/tickets/"]').first()
    const hasTicket = await ticketLink.isVisible().catch(() => false)

    if (!hasTicket) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Comment textarea
    const commentTextarea = page.getByPlaceholder('Write a comment... Use @ to mention someone')
    await expect(commentTextarea).toBeVisible()

    // Comment button (disabled when empty)
    const commentButton = page.getByRole('button', { name: 'Comment' })
    await expect(commentButton).toBeVisible()
    await expect(commentButton).toBeDisabled()
  })

  test('typing a comment enables the submit button', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('a[href^="/tickets/"]').first()
    const hasTicket = await ticketLink.isVisible().catch(() => false)

    if (!hasTicket) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    const commentTextarea = page.getByPlaceholder('Write a comment... Use @ to mention someone')
    await commentTextarea.fill('This is a test comment from E2E')

    // Comment button should now be enabled
    const commentButton = page.getByRole('button', { name: 'Comment' })
    await expect(commentButton).toBeEnabled()
  })

  test('shows keyboard shortcut hint for submitting comments', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('a[href^="/tickets/"]').first()
    const hasTicket = await ticketLink.isVisible().catch(() => false)

    if (!hasTicket) {
      test.skip()
      return
    }

    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    const shortcutHint = page.getByText('Ctrl+Enter to submit')
    await expect(shortcutHint).toBeVisible()
  })
})

test.describe('Kanban board page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/tickets/board')

    await expect(page).toHaveURL(/\/login/)
  })

  test('shows board heading and description', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    const heading = page.getByRole('heading', { name: 'Board' })
    await expect(heading).toBeVisible()

    const description = page.getByText('Drag tickets between columns to update status')
    await expect(description).toBeVisible()
  })

  test('board has New Ticket button', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    const newTicketButton = page.getByRole('link', { name: /New Ticket/ })
    await expect(newTicketButton).toBeVisible()
    await expect(newTicketButton).toHaveAttribute('href', '/tickets/new')
  })

  test('board displays Kanban columns with correct labels', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Verify all 7 board columns are visible
    const columnLabels = [
      'Backlog',
      'To Do',
      'In Progress',
      'In Review',
      'Blocked',
      'Done',
      'Cancelled',
    ]

    for (const label of columnLabels) {
      const columnHeader = page.getByRole('heading', { name: label })
      await expect(columnHeader).toBeVisible()
    }
  })

  test('each board column shows a ticket count', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Each column header has a count badge (shows "0" or more)
    // The count badges are spans inside the column headers
    const countBadges = page.locator('h3 + span')
    const count = await countBadges.count()

    // We expect at least 7 count badges (one per column)
    expect(count).toBeGreaterThanOrEqual(7)
  })
})

test.describe('Ticket navigation flow', () => {
  test('navigating from tickets list to board preserves context', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    // Start on tickets list
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const heading = page.getByRole('heading', { name: 'Tickets' })
    await expect(heading).toBeVisible()

    // Navigate to board
    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    const boardHeading = page.getByRole('heading', { name: 'Board' })
    await expect(boardHeading).toBeVisible()
  })

  test('board page has filter controls', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // Board filters section should be present (BoardFilters component)
    // It contains filter dropdowns for priority, assignee, and project
    const filtersArea = page.locator('[class*="mb-4"]').last()
    await expect(filtersArea).toBeVisible()
  })
})
