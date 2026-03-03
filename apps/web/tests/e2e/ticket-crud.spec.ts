import { test, expect } from './helpers/auth-fixture'

/**
 * Ticket CRUD E2E tests
 *
 * Covers ticket creation (title-only and all-fields), detail page,
 * commenting, inline title editing, board view placement, tags, and
 * ticket list count badge.
 *
 * Uses the auth-fixture `orgPage` (logged-in user with an org).
 * Each test creates its own data via the UI, so no factory setup is needed.
 */

test.describe('Ticket CRUD', () => {
  // ─── Test 1: Create a ticket with title only ────────────────

  test('creates a ticket with title only and redirects to /tickets', async ({ orgPage }) => {
    const page = orgPage
    const uniqueTitle = `E2E Title Only ${Date.now()}`

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Fill only the required title field
    await page.locator('input[name="title"]').fill(uniqueTitle)

    // Submit the form
    await page.getByRole('button', { name: 'Create Ticket' }).click()

    // Should redirect to /tickets
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })

    // Ticket should appear in the list
    await page.waitForLoadState('networkidle')
    const ticketInList = page.getByText(uniqueTitle)
    await expect(ticketInList).toBeVisible({ timeout: 10000 })
  })

  // ─── Test 2: Create a ticket with all fields filled ─────────

  test('creates a ticket with all fields filled and verifies in DB', async ({ orgPage }) => {
    const page = orgPage
    const uniqueTitle = `E2E Full Ticket ${Date.now()}`
    const description = 'Full ticket created by E2E with all fields'

    // First create a project so the project dropdown has an option
    await page.goto('/projects/new')
    await page.waitForLoadState('networkidle')
    const projectName = `E2E Proj for Ticket ${Date.now()}`
    await page.locator('input[name="name"]').fill(projectName)
    await page.getByRole('button', { name: 'Create project' }).click()
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 })

    // Navigate to ticket creation
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Fill title and description
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.locator('textarea[name="description"]').fill(description)

    // Select Type = bug
    await page.locator('[aria-label="Type"]').click()
    await page.getByRole('option', { name: 'Bug' }).click()

    // Select Priority = high
    await page.locator('[aria-label="Priority"]').click()
    await page.getByRole('option', { name: 'High' }).click()

    // Select Status = todo
    await page.locator('[aria-label="Status"]').click()
    await page.getByRole('option', { name: 'Todo' }).click()

    // Select Assignee (first member in list — should be the test user)
    await page.locator('[aria-label="Assignee"]').click()
    const assigneeOption = page.getByRole('option').first()
    await assigneeOption.click()

    // Select Project (the one we just created)
    await page.locator('[aria-label="Project"]').click()
    await page.getByRole('option', { name: projectName }).click()

    // Fill tags
    await page.locator('input[name="tags"]').fill('e2e,test,automated')

    // Submit
    await page.getByRole('button', { name: 'Create Ticket' }).click()

    // Should redirect to /tickets
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })

    // Verify the ticket appears in the list
    await page.waitForLoadState('networkidle')
    const ticketInList = page.getByText(uniqueTitle)
    await expect(ticketInList).toBeVisible({ timeout: 10000 })
  })

  // ─── Test 3: Navigate to ticket detail page ─────────────────

  test('navigates to ticket detail and verifies title, status badge, comment section', async ({
    orgPage,
  }) => {
    const page = orgPage

    // Create a ticket first
    const uniqueTitle = `E2E Detail View ${Date.now()}`
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.getByRole('button', { name: 'Create Ticket' }).click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Click on the ticket to go to detail page
    const ticketLink = page.getByRole('link', { name: uniqueTitle }).first()
    await expect(ticketLink).toBeVisible({ timeout: 10000 })
    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on a ticket detail page
    await expect(page).toHaveURL(/\/tickets\/[a-f0-9-]+/)

    // Title should be visible
    const titleElement = page.getByText(uniqueTitle)
    await expect(titleElement.first()).toBeVisible()

    // Status badge (Backlog is the default)
    const statusBadge = page.getByText('Backlog')
    await expect(statusBadge.first()).toBeVisible()

    // Comment section should be visible
    const commentsHeading = page.getByText(/Comments \(\d+\)/)
    await expect(commentsHeading).toBeVisible()
  })

  // ─── Test 4: Add a comment on ticket detail page ────────────

  test('adds a comment on a ticket detail page', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket first
    const uniqueTitle = `E2E Comment Test ${Date.now()}`
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.getByRole('button', { name: 'Create Ticket' }).click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Navigate to the ticket detail
    const ticketLink = page.getByRole('link', { name: uniqueTitle }).first()
    await expect(ticketLink).toBeVisible({ timeout: 10000 })
    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Write a comment
    const commentText = `E2E test comment ${Date.now()}`
    const commentTextarea = page.getByPlaceholder('Write a comment... Use @ to mention someone')
    await expect(commentTextarea).toBeVisible()
    await commentTextarea.fill(commentText)

    // Comment button should now be enabled
    const commentButton = page.getByRole('button', { name: 'Comment' })
    await expect(commentButton).toBeEnabled()
    await commentButton.click()

    // Verify the comment appears in the list
    const postedComment = page.getByText(commentText)
    await expect(postedComment).toBeVisible({ timeout: 15000 })

    // Comment count should update to 1
    const commentsHeading = page.getByText('Comments (1)')
    await expect(commentsHeading).toBeVisible({ timeout: 10000 })
  })

  // ─── Test 5: Verify inline title edit UI exists ─────────────

  test('ticket detail page shows inline title edit UI', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket
    const uniqueTitle = `E2E Edit Title ${Date.now()}`
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.getByRole('button', { name: 'Create Ticket' }).click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Navigate to ticket detail
    const ticketLink = page.getByRole('link', { name: uniqueTitle }).first()
    await expect(ticketLink).toBeVisible({ timeout: 10000 })
    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // The title is rendered in an h1 with a pencil icon on hover.
    // Clicking the title should activate edit mode with an input.
    const titleHeading = page.locator('h1').filter({ hasText: uniqueTitle })
    await expect(titleHeading).toBeVisible()

    // Click title to activate inline editing
    await titleHeading.click()

    // An input field should now be visible for editing the title
    const titleInput = page.locator('input').filter({ hasText: '' }).first()
    await expect(titleInput).toBeVisible({ timeout: 5000 })

    // Pressing Escape should cancel editing
    await titleInput.press('Escape')
  })

  // ─── Test 6: Verify ticket shows in board view at correct column ──

  test('ticket shows in correct board column after creation', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket with todo status
    const uniqueTitle = `E2E Board Check ${Date.now()}`
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.locator('input[name="title"]').fill(uniqueTitle)

    // Set status to todo so it appears in "To Do" column
    await page.locator('[aria-label="Status"]').click()
    await page.getByRole('option', { name: 'Todo' }).click()

    await page.getByRole('button', { name: 'Create Ticket' }).click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })

    // Navigate to board view
    await page.goto('/tickets/board')
    await page.waitForLoadState('networkidle')

    // The ticket should appear in the "To Do" column
    const todoColumn = page.locator('[role="group"]').filter({
      has: page.getByRole('heading', { name: 'To Do' }),
    })
    const ticketInColumn = todoColumn.getByText(uniqueTitle)
    await expect(ticketInColumn).toBeVisible({ timeout: 10000 })
  })

  // ─── Test 7: Create a ticket with tags and verify display ───

  test('creates a ticket with tags and verifies tags display on detail page', async ({
    orgPage,
  }) => {
    const page = orgPage
    const uniqueTitle = `E2E Tags Ticket ${Date.now()}`

    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.locator('input[name="tags"]').fill('urgent,frontend,v2')

    await page.getByRole('button', { name: 'Create Ticket' }).click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // Navigate to ticket detail
    const ticketLink = page.getByRole('link', { name: uniqueTitle }).first()
    await expect(ticketLink).toBeVisible({ timeout: 10000 })
    await ticketLink.click()
    await page.waitForLoadState('networkidle')

    // Verify tags are displayed
    await expect(page.getByText('urgent')).toBeVisible()
    await expect(page.getByText('frontend')).toBeVisible()
    await expect(page.getByText('v2')).toBeVisible()
  })

  // ─── Test 8: Ticket list shows count badge ──────────────────

  test('ticket list shows ticket count in the subheading', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket so the count is non-zero
    const uniqueTitle = `E2E Count Badge ${Date.now()}`
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.locator('input[name="title"]').fill(uniqueTitle)
    await page.getByRole('button', { name: 'Create Ticket' }).click()
    await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 })
    await page.waitForLoadState('networkidle')

    // The ticket list page shows "{N} ticket(s)" in the subheading
    const countText = page.getByText(/\d+ tickets?/)
    await expect(countText).toBeVisible()

    // Extract count and verify it's at least 1
    const text = await countText.textContent()
    const match = text?.match(/(\d+)/)
    expect(match).toBeTruthy()
    if (!match) return
    const count = parseInt(match[1] ?? '0', 10)
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
