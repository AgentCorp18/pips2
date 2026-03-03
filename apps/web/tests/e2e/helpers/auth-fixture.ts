import { test as base, type Page } from '@playwright/test'
import { createTestUser, deleteTestUser, type TestUser } from './supabase-admin'

/**
 * Custom Playwright fixtures for authenticated E2E tests.
 *
 * Provides:
 * - `testUser`           — a fresh Supabase user (created/destroyed per test)
 * - `authenticatedPage`  — a Page that has already logged in via the UI
 * - `orgPage`            — an authenticatedPage that also has an org
 *                          (creates one via onboarding if needed)
 *
 * Usage:
 *   import { test, expect } from './helpers/auth-fixture'
 *
 *   test('dashboard loads', async ({ authenticatedPage }) => {
 *     await authenticatedPage.goto('/dashboard')
 *     // ...already logged in
 *   })
 */

type AuthFixtures = {
  testUser: TestUser
  authenticatedPage: Page
  orgPage: Page
}

export const test = base.extend<AuthFixtures>({
  testUser: [
    async ({}, use) => {
      const user = await createTestUser()
      await use(user)
      await deleteTestUser(user.id)
    },
    { scope: 'test' },
  ],

  authenticatedPage: [
    async ({ page, testUser }, use) => {
      await page.goto('/login')

      await page.locator('input[name="email"]').fill(testUser.email)
      await page.locator('input[name="password"]').fill(testUser.password)
      await page.getByRole('button', { name: 'Sign in' }).click()

      // After login the app redirects to /onboarding (no org) or /dashboard
      await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

      await use(page)
    },
    { scope: 'test' },
  ],

  orgPage: [
    async ({ authenticatedPage, testUser: _testUser }, use) => {
      const page = authenticatedPage

      // Check if we landed on onboarding (need to create an org)
      const nameInput = page.locator('input[name="name"]')
      const isOnboarding = await nameInput.isVisible({ timeout: 3000 }).catch(() => false)

      if (isOnboarding) {
        const orgName = `E2E Org ${Date.now()}`
        await nameInput.fill(orgName)

        // Wait for slug to auto-generate from the name
        const slugInput = page.locator('input[name="slug"]')
        await slugInput.waitFor({ state: 'visible' })
        // Allow debounce + availability check to complete
        await page.waitForTimeout(2000)

        const submitButton = page.getByRole('button', { name: /Create organization/i })
        await submitButton.click()

        // Wait for the onboarding form to disappear (replaced by dashboard)
        await page.waitForURL(/\/dashboard/, { timeout: 30000 })
      }

      await use(page)
    },
    { scope: 'test' },
  ],
})

export { expect } from '@playwright/test'
