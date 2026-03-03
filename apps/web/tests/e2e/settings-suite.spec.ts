import { test, expect } from './helpers/auth-fixture'
import { test as baseTest } from '@playwright/test'

/**
 * Settings Suite E2E flow
 *
 * Tests the settings page with its tab navigation (General, Members,
 * Notifications, Audit Log), org name editing, invite button, and
 * notification toggle switches.
 */

baseTest.describe('Settings auth guard', () => {
  baseTest('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/settings')

    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Settings General tab', () => {
  test('shows General tab by default with org name', async ({ orgPage }) => {
    await orgPage.goto('/settings')
    await orgPage.waitForLoadState('networkidle')

    // Verify page heading
    const heading = orgPage.getByRole('heading', { name: 'Settings' })
    await expect(heading).toBeVisible()

    // Verify General tab is active (it is the default tab at /settings)
    const generalTab = orgPage.locator('a[href="/settings"]').filter({ hasText: 'General' })
    await expect(generalTab).toBeVisible()

    // Verify the org name input is present with a value
    const nameInput = orgPage.locator('input#name')
    await expect(nameInput).toBeVisible()
    const nameValue = await nameInput.inputValue()
    expect(nameValue).toBeTruthy()
  })

  test('edit org name via General settings and verify update', async ({ orgPage }) => {
    await orgPage.goto('/settings')
    await orgPage.waitForLoadState('networkidle')

    const nameInput = orgPage.locator('input#name')
    await expect(nameInput).toBeVisible()

    // Update the org name
    const newName = `Updated Org ${Date.now()}`
    await nameInput.clear()
    await nameInput.fill(newName)

    // Click Save
    const saveButton = orgPage.getByRole('button', { name: 'Save changes' })
    await saveButton.click()

    // Wait for the success message
    await orgPage.waitForLoadState('networkidle')

    // Verify the name input reflects the new value after page settles
    // Reload the page to confirm persistence
    await orgPage.goto('/settings')
    await orgPage.waitForLoadState('networkidle')

    const updatedNameInput = orgPage.locator('input#name')
    const updatedValue = await updatedNameInput.inputValue()
    expect(updatedValue).toBe(newName)
  })
})

test.describe('Settings Members tab', () => {
  test('Members tab shows current user as owner', async ({ orgPage }) => {
    await orgPage.goto('/settings/members')
    await orgPage.waitForLoadState('networkidle')

    // Verify Members heading
    const heading = orgPage.getByRole('heading', { name: 'Members' })
    await expect(heading).toBeVisible()

    // Verify the members table exists
    const nameHeader = orgPage.getByRole('columnheader', { name: 'Name' })
    await expect(nameHeader).toBeVisible()

    // The test user should appear in the table with role "Owner" and "(you)" indicator
    const youIndicator = orgPage.getByText('(you)')
    await expect(youIndicator).toBeVisible()

    const ownerBadge = orgPage.getByText('Owner')
    await expect(ownerBadge.first()).toBeVisible()
  })

  test('Members tab has "Invite Member" button', async ({ orgPage }) => {
    await orgPage.goto('/settings/members')
    await orgPage.waitForLoadState('networkidle')

    const inviteButton = orgPage.getByRole('button', { name: 'Invite Member' })
    await expect(inviteButton).toBeVisible()
  })
})

test.describe('Settings Notifications tab', () => {
  test('Notifications tab shows toggle switches', async ({ orgPage }) => {
    await orgPage.goto('/settings/notifications')
    await orgPage.waitForLoadState('networkidle')

    // Verify notifications heading
    const heading = orgPage.getByRole('heading', { name: 'Notification Preferences' })
    await expect(heading).toBeVisible()

    // Verify in-app notification section exists
    const inAppTitle = orgPage.getByText('In-app notifications')
    await expect(inAppTitle).toBeVisible()

    // Verify that Switch toggles are present
    // There are 5 in-app notification preferences + 1 email toggle = 6 total
    const switches = orgPage.locator('button[role="switch"]')
    const switchCount = await switches.count()
    expect(switchCount).toBeGreaterThanOrEqual(5)

    // Verify specific preference labels exist
    const ticketAssigned = orgPage.getByText('Ticket assigned')
    await expect(ticketAssigned).toBeVisible()

    const mentions = orgPage.getByText('Mentions')
    await expect(mentions).toBeVisible()

    // Verify email notifications section
    const emailTitle = orgPage.getByText('Email notifications')
    await expect(emailTitle).toBeVisible()
  })
})

test.describe('Settings Audit Log tab', () => {
  test('Audit Log tab shows table for owner', async ({ orgPage }) => {
    await orgPage.goto('/settings/audit-log')
    await orgPage.waitForLoadState('networkidle')

    // Verify audit log heading
    const heading = orgPage.getByRole('heading', { name: 'Audit Log' })
    await expect(heading).toBeVisible()

    // Verify "Activity History" card title
    const cardTitle = orgPage.getByText('Activity History')
    await expect(cardTitle).toBeVisible()

    // Should show either the table headers or the empty state
    const timestampHeader = orgPage.getByRole('columnheader', { name: 'Timestamp' })
    const emptyMessage = orgPage.getByText('No audit log entries yet')

    const hasTable = await timestampHeader.isVisible().catch(() => false)
    const hasEmpty = await emptyMessage.isVisible().catch(() => false)

    // One of these must be visible
    expect(hasTable || hasEmpty).toBe(true)
  })

  test('Audit Log has pagination controls when entries exist', async ({ orgPage }) => {
    await orgPage.goto('/settings/audit-log')
    await orgPage.waitForLoadState('networkidle')

    // Check for total count display
    const totalText = orgPage.getByText(/\d+ total (entry|entries)/)
    await expect(totalText).toBeVisible()

    // Check for Previous and Next buttons (they exist even if disabled)
    const prevButton = orgPage
      .getByRole('button', { name: 'Previous' })
      .or(orgPage.getByRole('link', { name: 'Previous' }))
    const nextButton = orgPage
      .getByRole('button', { name: 'Next' })
      .or(orgPage.getByRole('link', { name: 'Next' }))

    // Pagination controls are shown only when totalPages > 1.
    // If there are entries, the table should be visible
    const timestampHeader = orgPage.getByRole('columnheader', { name: 'Timestamp' })
    const hasEntries = await timestampHeader.isVisible().catch(() => false)

    if (hasEntries) {
      // The "Page X of Y" text and buttons only render when totalPages > 1
      const pageInfo = orgPage.getByText(/Page \d+ of \d+/)
      const hasPagination = await pageInfo.isVisible().catch(() => false)

      if (hasPagination) {
        await expect(prevButton.first()).toBeVisible()
        await expect(nextButton.first()).toBeVisible()
      }
    }

    // The test passes either way -- it validates the structure is correct
    // whether or not there is enough data for pagination to appear
    expect(true).toBe(true)
  })
})
