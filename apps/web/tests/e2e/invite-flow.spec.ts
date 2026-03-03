import { test, expect } from './helpers/auth-fixture'
import { test as baseTest } from '@playwright/test'

/**
 * Invite Flow E2E tests
 *
 * Tests the invitation UI components: invite dialog from settings,
 * form fields, form submission structure, and the /invite/[token]
 * accept/decline page with error states.
 *
 * Note: Full round-trip invite flow (send email -> click link -> accept)
 * cannot be tested E2E because it requires Resend email delivery.
 * These tests focus on the UI components and error handling.
 */

test.describe('Invite dialog from Settings', () => {
  test('"Invite Member" button opens dialog', async ({ orgPage }) => {
    await orgPage.goto('/settings/members')
    await orgPage.waitForLoadState('networkidle')

    // Click the Invite Member button
    const inviteButton = orgPage.getByRole('button', { name: 'Invite Member' })
    await expect(inviteButton).toBeVisible()
    await inviteButton.click()

    // Verify the dialog opened
    const dialogTitle = orgPage.getByText('Invite a new member')
    await expect(dialogTitle).toBeVisible()

    const dialogDescription = orgPage.getByText(
      'Enter the email address of the person you want to invite.',
    )
    await expect(dialogDescription).toBeVisible()
  })

  test('invite dialog has email and role fields', async ({ orgPage }) => {
    await orgPage.goto('/settings/members')
    await orgPage.waitForLoadState('networkidle')

    // Open the dialog
    const inviteButton = orgPage.getByRole('button', { name: 'Invite Member' })
    await inviteButton.click()

    // Verify email field
    const emailLabel = orgPage.getByText('Email address')
    await expect(emailLabel).toBeVisible()

    const emailInput = orgPage.locator('input#invite-email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('placeholder', 'colleague@company.com')

    // Verify role field
    const roleLabel = orgPage.getByText('Role').first()
    await expect(roleLabel).toBeVisible()

    // The role selector is a Select component with a trigger button
    const roleSelect = orgPage.locator('button[role="combobox"]')
    await expect(roleSelect).toBeVisible()

    // Verify action buttons
    const cancelButton = orgPage.getByRole('button', { name: 'Cancel' })
    await expect(cancelButton).toBeVisible()

    const sendButton = orgPage.getByRole('button', { name: 'Send Invite' })
    await expect(sendButton).toBeVisible()
  })

  test('invite form validates required email', async ({ orgPage }) => {
    await orgPage.goto('/settings/members')
    await orgPage.waitForLoadState('networkidle')

    // Open the dialog
    const inviteButton = orgPage.getByRole('button', { name: 'Invite Member' })
    await inviteButton.click()

    // The Send Invite button should be disabled when email is empty
    const sendButton = orgPage.getByRole('button', { name: 'Send Invite' })
    await expect(sendButton).toBeDisabled()

    // Fill in an email to enable the button
    const emailInput = orgPage.locator('input#invite-email')
    await emailInput.fill('test@example.com')

    await expect(sendButton).toBeEnabled()
  })
})

test.describe('Invite token page', () => {
  baseTest('invalid invite token shows not-found error', async ({ page }) => {
    // Navigate to an invite page with a fake/invalid token
    await page.goto('/invite/invalid-token-00000000')
    await page.waitForLoadState('networkidle')

    // The page should show one of the error states
    // (not_found, expired, revoked, or already_accepted)
    const notFoundTitle = page.getByText('Invitation Not Found')
    const expiredTitle = page.getByText('Invitation Expired')
    const revokedTitle = page.getByText('Invitation Revoked')
    const alreadyTitle = page.getByText('Already Accepted')

    const hasNotFound = await notFoundTitle.isVisible().catch(() => false)
    const hasExpired = await expiredTitle.isVisible().catch(() => false)
    const hasRevoked = await revokedTitle.isVisible().catch(() => false)
    const hasAlready = await alreadyTitle.isVisible().catch(() => false)

    // At least one error state should be shown for an invalid token
    expect(hasNotFound || hasExpired || hasRevoked || hasAlready).toBe(true)
  })

  baseTest('invalid invite token page has sign-in link', async ({ page }) => {
    await page.goto('/invite/invalid-token-00000000')
    await page.waitForLoadState('networkidle')

    // All error states include a "Go to sign in" link
    const signInLink = page.getByText('Go to sign in')
    await expect(signInLink).toBeVisible()
  })
})
