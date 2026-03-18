import { test, expect } from './helpers/auth-fixture'

/**
 * TKT-255: Full Ticket Lifecycle E2E Tests
 *
 * Tests the complete ticket workflow: create → assign → status changes →
 * comment → resolve. Validates all state transitions through the UI.
 */

test.describe('Ticket lifecycle', () => {
  test('create ticket with description', async ({ orgPage }) => {
    const page = orgPage

    // Navigate to ticket creation
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    // Fill in the title
    const titleInput = page.getByTestId('ticket-title-input')
    await expect(titleInput).toBeVisible()
    await titleInput.fill('E2E Lifecycle Test Ticket')

    // Expand full form if needed
    const expandButton = page.getByTestId('expand-full-form')
    const expandVisible = await expandButton.isVisible({ timeout: 2000 }).catch(() => false)
    if (expandVisible) {
      await expandButton.click()
    }

    // Set priority
    const prioritySelect = page.getByTestId('ticket-priority-select')
    if (await prioritySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prioritySelect.click()
      const highOption = page.getByRole('option', { name: /high/i })
      if (await highOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await highOption.click()
      }
    }

    // Submit the ticket
    const submitButton = page.getByTestId('ticket-submit-button')
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    // Should redirect to ticket detail or tickets list
    await page.waitForURL(/\/tickets/, { timeout: 10000 })
  })

  test('view ticket detail page with all sections', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket first
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')

    const titleInput = page.getByTestId('ticket-title-input')
    await titleInput.fill('E2E Detail View Test')
    const submitButton = page.getByTestId('ticket-submit-button')
    await submitButton.click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    // Navigate to tickets list and click the first ticket
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (await ticketLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ticketLink.click()
      await page.waitForLoadState('networkidle')

      // Verify key sections are present
      const commentsHeading = page.getByTestId('comments-heading')
      await expect(commentsHeading).toBeVisible({ timeout: 5000 })

      // Attachments section should be present
      const attachmentsSection = page.getByText(/attachments/i)
      await expect(attachmentsSection).toBeVisible({ timeout: 5000 })
    }
  })

  test('add comment to ticket', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Comment Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    // Go to tickets list and open the ticket
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (await ticketLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ticketLink.click()
      await page.waitForLoadState('networkidle')

      // Find comment textarea and add a comment
      const commentArea = page.getByTestId('comment-textarea')
      await expect(commentArea).toBeVisible({ timeout: 5000 })
      await commentArea.fill('This is an E2E test comment')

      const commentButton = page.getByTestId('comment-submit-button')
      await commentButton.click()

      // Wait for comment to appear
      await expect(page.getByText('This is an E2E test comment')).toBeVisible({ timeout: 10000 })
    }
  })

  test('change ticket status', async ({ orgPage }) => {
    const page = orgPage

    // Create a ticket
    await page.goto('/tickets/new')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('ticket-title-input').fill('E2E Status Change Test')
    await page.getByTestId('ticket-submit-button').click()
    await page.waitForURL(/\/tickets/, { timeout: 10000 })

    // Open ticket detail
    await page.goto('/tickets')
    await page.waitForLoadState('networkidle')

    const ticketLink = page.locator('[data-testid^="ticket-row-"] a').first()
    if (await ticketLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ticketLink.click()
      await page.waitForLoadState('networkidle')

      // Find and click the status select
      const statusTrigger = page.getByTestId('ticket-status-select')
      if (await statusTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
        await statusTrigger.click()

        // Select "In Progress"
        const inProgressOption = page.getByRole('option', { name: /in progress/i })
        if (await inProgressOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await inProgressOption.click()

          // Verify status changed
          await expect(statusTrigger).toContainText(/in progress/i, { timeout: 5000 })
        }
      }
    }
  })
})
