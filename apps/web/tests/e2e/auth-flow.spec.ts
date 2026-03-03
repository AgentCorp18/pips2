import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, getUserOrgs } from './helpers/supabase-admin'
import type { TestUser } from './helpers/supabase-admin'

/**
 * Auth & Onboarding E2E Flow Tests
 *
 * Tests the critical path: login → org creation → dashboard
 * Uses a real Supabase test user with a confirmed email.
 *
 * Run against production:
 *   BASE_URL=https://pips-app.vercel.app pnpm exec playwright test auth-flow
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

let testUser: TestUser

test.beforeAll(async () => {
  testUser = await createTestUser()
})

test.afterAll(async () => {
  if (testUser?.id) {
    await deleteTestUser(testUser.id)
  }
})

test.describe('Login with confirmed email', () => {
  test('logs in and redirects to onboarding (no org yet)', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[name="email"]').fill(testUser.email)
    await page.locator('input[name="password"]').fill(testUser.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Should redirect to onboarding or dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })
    const url = page.url()
    expect(url).toMatch(/\/(onboarding|dashboard)/)
  })

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/login')

    await page.locator('input[name="email"]').fill(testUser.email)
    await page.locator('input[name="password"]').fill('WrongPassword999!')
    await page.getByRole('button', { name: 'Sign in' }).click()

    const error = page.getByText('Invalid email or password')
    await expect(error).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Organization creation', () => {
  test('creates an org and lands on dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(testUser.email)
    await page.locator('input[name="password"]').fill(testUser.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for redirect to onboarding
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

    if (page.url().includes('/onboarding')) {
      // Fill org creation form
      const orgName = `E2E Test Org ${Date.now()}`
      await page.locator('input[name="name"]').fill(orgName)

      // Wait for slug to auto-generate
      await page.waitForTimeout(500)

      // Submit
      const submitButton = page.getByRole('button', { name: /Create organization/i })
      await expect(submitButton).toBeVisible()
      await submitButton.click()

      // Should redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    }

    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard')

    // Verify the org was actually created in the DB
    const orgs = await getUserOrgs(testUser.id)
    expect(orgs.length).toBeGreaterThan(0)
    expect(orgs[0]!.role).toBe('owner')
  })
})

test.describe('Login error for unconfirmed email', () => {
  test('shows confirmation message instead of generic error', async ({ page }) => {
    // This test creates its own unconfirmed user
    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )

    const email = `e2e-unconfirmed-${Date.now()}@test.pips.app`
    const password = 'TestPass123!'

    // Create user WITHOUT confirming email
    const { data } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { display_name: 'Unconfirmed User' },
    })

    try {
      await page.goto('/login')
      await page.locator('input[name="email"]').fill(email)
      await page.locator('input[name="password"]').fill(password)
      await page.getByRole('button', { name: 'Sign in' }).click()

      // Should show the specific unconfirmed email message
      const error = page.getByText(/confirm your email/i)
      await expect(error).toBeVisible({ timeout: 10000 })
    } finally {
      // Clean up
      if (data.user) {
        await admin.from('profiles').delete().eq('id', data.user.id)
        await admin.auth.admin.deleteUser(data.user.id)
      }
    }
  })
})
