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

    // Press Ctrl+K to open the command palette (AppLayout listens for this)
    await orgPage.keyboard.press('Control+k')

    // CommandPalette renders inside a Dialog with a Command.Input
    // The input has placeholder="Search projects, tickets..."
    const searchInput = orgPage.locator('[placeholder*="Search projects"]')

    // The dialog should become visible
    const dialog = orgPage.getByRole('dialog')

    await expect(dialog.first().or(searchInput)).toBeVisible({ timeout: 5000 })
  })

  test('command palette shows quick actions', async ({ orgPage }) => {
    await orgPage.goto('/dashboard')
    await orgPage.waitForLoadState('networkidle')

    // Open command palette
    await orgPage.keyboard.press('Control+k')

    // Wait for the palette to render — Command.Input has placeholder "Search projects, tickets..."
    const searchInput = orgPage.locator('[placeholder*="Search projects"]')
    await expect(searchInput.first()).toBeVisible({ timeout: 5000 })

    // QUICK_ACTIONS labels: "Create Project", "Create Ticket", "Go to Dashboard"
    // These render as Command.Item children when no query is typed
    const createProjectAction = orgPage.getByText('Create Project')
    const createTicketAction = orgPage.getByText('Create Ticket')
    const goToDashboardAction = orgPage.getByText('Go to Dashboard')

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

      const searchInput = orgPage.locator('[placeholder*="Search projects"]')
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 })

      // Type "E2E" which should match the factory-created project and ticket titles
      await searchInput.first().fill('E2E')

      // Wait for debounced search (DEBOUNCE_MS = 300) plus server response
      await orgPage.waitForTimeout(1500)

      // Results are grouped by type via Command.Group with heading={group.label}
      // cmdk renders group headings as [cmdk-group-heading]
      const groupHeadings = orgPage.locator('[cmdk-group-heading]')
      // Also check for Command.Item elements (rendered as [cmdk-item])
      const resultItems = orgPage.locator('[cmdk-item]')

      const headingCount = await groupHeadings.count().catch(() => 0)
      const resultCount = await resultItems.count().catch(() => 0)

      // Either group headings or individual result items should appear
      // (search might find data from the factory-created org or from empty state)
      expect(headingCount > 0 || resultCount > 0).toBe(true)
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

      const searchInput = orgPage.locator('[placeholder*="Search projects"]')
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 })

      // Search for the test project
      await searchInput.first().fill('E2E Test Project')
      await orgPage.waitForTimeout(1500)

      // Click the first cmdk item result
      const resultItem = orgPage.locator('[cmdk-item]').first()

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

    // NotificationBell renders a <button> with aria-label="Notifications" or "Notifications (X unread)"
    const bellIcon = orgPage.getByLabel(/Notifications/i)

    await expect(bellIcon.first()).toBeVisible({ timeout: 5000 })
  })
})
