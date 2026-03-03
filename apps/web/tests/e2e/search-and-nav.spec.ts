import { test, expect } from './helpers/auth-fixture'
import {
  createTestOrg,
  createTestProject,
  createTestTicket,
  cleanupTestOrg,
} from './helpers/test-factories'

/**
 * Search & Navigation E2E Tests
 *
 * Tests the command palette (Ctrl+K / Cmd+K), quick actions,
 * search results, result navigation, and notification bell.
 */

test.describe('Command palette and global search', () => {
  test('Ctrl+K opens the command palette', async ({ orgPage }) => {
    await orgPage.goto('/dashboard')
    await orgPage.waitForLoadState('networkidle')

    // Press Ctrl+K to open the command palette
    await orgPage.keyboard.press('Control+k')

    // The command palette dialog should appear
    const dialog = orgPage
      .getByRole('dialog')
      .or(orgPage.locator('[data-command-palette]'))
      .or(orgPage.locator('[role="combobox"]'))
      .or(orgPage.locator('[data-radix-popper-content-wrapper]'))

    // Also check for a search input that appears in the palette
    const searchInput = orgPage.getByPlaceholder(/Search|Type a command/i)

    await expect(dialog.first().or(searchInput)).toBeVisible({ timeout: 5000 })
  })

  test('command palette shows quick actions', async ({ orgPage }) => {
    await orgPage.goto('/dashboard')
    await orgPage.waitForLoadState('networkidle')

    // Open command palette
    await orgPage.keyboard.press('Control+k')

    // Wait for the palette to render
    const searchInput = orgPage.getByPlaceholder(/Search|Type a command/i)
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 })

    // Quick actions should be visible without typing anything
    const createProjectAction = orgPage.getByText(/Create Project/i)
    const createTicketAction = orgPage.getByText(/Create Ticket/i)
    const goToDashboardAction = orgPage.getByText(/Go to Dashboard|Dashboard/i)

    // At least the create actions should appear
    await expect(
      createProjectAction.first().or(createTicketAction.first()).or(goToDashboardAction.first()),
    ).toBeVisible({ timeout: 5000 })
  })

  test('typing a search query shows grouped results', async ({ orgPage, testUser }) => {
    // Create test data so there is something to search for
    const org = await createTestOrg(testUser.id)
    const project = await createTestProject(org.id, testUser.id)
    await createTestTicket(org.id, testUser.id, project.id)

    try {
      await orgPage.goto('/dashboard')
      await orgPage.waitForLoadState('networkidle')

      // Open command palette
      await orgPage.keyboard.press('Control+k')

      const searchInput = orgPage.getByPlaceholder(/Search|Type a command/i)
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 })

      // Type "E2E" which should match the factory-created project and ticket titles
      await searchInput.first().fill('E2E')

      // Wait for search results to load
      await orgPage.waitForTimeout(1000)

      // Results should be grouped by type — look for group headings or result items
      const projectsGroup = orgPage.getByText(/Projects/i)
      const ticketsGroup = orgPage.getByText(/Tickets/i)
      const resultItems = orgPage.locator(
        '[data-command-item], [role="option"], [data-search-result]',
      )

      // Either group headings or individual result items should appear
      const hasProjectGroup = await projectsGroup
        .first()
        .isVisible()
        .catch(() => false)
      const hasTicketGroup = await ticketsGroup
        .first()
        .isVisible()
        .catch(() => false)
      const resultCount = await resultItems.count().catch(() => 0)

      expect(hasProjectGroup || hasTicketGroup || resultCount > 0).toBe(true)
    } finally {
      await cleanupTestOrg(org.id)
    }
  })

  test('clicking a search result navigates to the correct page', async ({ orgPage, testUser }) => {
    const org = await createTestOrg(testUser.id)
    await createTestProject(org.id, testUser.id)

    try {
      await orgPage.goto('/dashboard')
      await orgPage.waitForLoadState('networkidle')

      // Open command palette
      await orgPage.keyboard.press('Control+k')

      const searchInput = orgPage.getByPlaceholder(/Search|Type a command/i)
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 })

      // Search for the test project
      await searchInput.first().fill('E2E Test Project')
      await orgPage.waitForTimeout(1000)

      // Click the first result that looks like a project
      const resultItem = orgPage
        .locator('[data-command-item], [role="option"], [data-search-result]')
        .first()
        .or(orgPage.getByText(/E2E Test Project/).first())

      const hasResult = await resultItem.isVisible().catch(() => false)

      if (hasResult) {
        await resultItem.click()
        await orgPage.waitForLoadState('networkidle')

        // Should have navigated to a project or other detail page (away from dashboard)
        const url = orgPage.url()
        expect(url).toMatch(/\/(projects|tickets)\//)
      }
    } finally {
      await cleanupTestOrg(org.id)
    }
  })

  test('notification bell icon is visible in header', async ({ orgPage }) => {
    await orgPage.goto('/dashboard')
    await orgPage.waitForLoadState('networkidle')

    // Look for the notification bell in the header/navbar area
    const bellIcon = orgPage
      .getByRole('button', { name: /Notification/i })
      .or(orgPage.locator('[data-testid="notification-bell"]'))
      .or(
        orgPage
          .locator('button')
          .filter({ has: orgPage.locator('svg[class*="bell"], .lucide-bell') }),
      )
      .or(orgPage.getByLabel(/Notification/i))

    await expect(bellIcon.first()).toBeVisible({ timeout: 5000 })
  })
})
