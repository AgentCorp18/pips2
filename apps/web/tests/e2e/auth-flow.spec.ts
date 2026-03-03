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
    // Collect console errors for diagnostics
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Login first
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(testUser.email)
    await page.locator('input[name="password"]').fill(testUser.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // After login, the server action redirects to /dashboard.
    // Next.js renders the dashboard page which detects no org and
    // internally redirects to /onboarding content. The URL may stay
    // at /dashboard (Next.js client-side routing behavior).
    // Don't rely on URL — wait for the org creation form to appear.
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

    console.log(`[E2E] Post-login URL: ${page.url()}`)

    // Wait for the org creation form to be ready (may render at /dashboard or /onboarding)
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await expect(nameInput).toBeEnabled()

    console.log(`[E2E] Form URL: ${page.url()}`)

    // Fill org creation form
    const orgName = `E2E Test Org ${Date.now()}`
    await nameInput.fill(orgName)

    // Wait for slug to auto-generate
    const slugInput = page.locator('input[name="slug"]')
    await expect(slugInput).not.toHaveValue('', { timeout: 3000 })

    // Wait for slug availability check to complete (400ms debounce + network time)
    await page.waitForTimeout(2000)

    // Verify the submit button is enabled (not disabled by 'taken' slug)
    const submitButton = page.getByRole('button', { name: /Create organization/i })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled({ timeout: 5000 })

    // Log diagnostic info
    const slugValue = await slugInput.inputValue()
    const nameValue = await nameInput.inputValue()
    console.log(`[E2E] Submitting org: name="${nameValue}", slug="${slugValue}"`)

    // Click submit
    await submitButton.click()
    console.log('[E2E] Clicked submit button')

    // After successful org creation, the server action redirects to /dashboard.
    // The dashboard page will now find the org and render the actual dashboard.
    // Wait for the org creation form to disappear (replaced by dashboard content).
    // The form's "Create organization" heading should no longer be visible.
    await expect(page.getByText('Create your organization')).not.toBeVisible({ timeout: 30000 })

    console.log(`[E2E] Post-submit URL: ${page.url()}`)

    // Verify the org was actually created in the DB
    const orgs = await getUserOrgs(testUser.id)
    console.log(`[E2E] getUserOrgs result: ${JSON.stringify(orgs)}`)
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
