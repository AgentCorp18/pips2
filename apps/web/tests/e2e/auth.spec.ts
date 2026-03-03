import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders with email and password fields', async ({ page }) => {
    await page.goto('/login')

    await expect(page).toHaveTitle(/Sign In/)

    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('displays the "Welcome back" heading', async ({ page }) => {
    await page.goto('/login')

    const heading = page.locator('text=Welcome back')
    await expect(heading).toBeVisible()
  })

  test('has a link to the signup page', async ({ page }) => {
    await page.goto('/login')

    const signupLink = page.locator('a[href="/signup"]')
    await expect(signupLink).toBeVisible()
    await expect(signupLink).toHaveText('Sign up')
  })

  test('has a link to the forgot password page', async ({ page }) => {
    await page.goto('/login')

    const forgotLink = page.locator('a[href="/forgot-password"]')
    await expect(forgotLink).toBeVisible()
    await expect(forgotLink).toHaveText('Forgot password?')
  })

  test('shows the sign in button', async ({ page }) => {
    await page.goto('/login')

    const submitButton = page.locator('button[type="submit"]', { hasText: 'Sign in' })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })
})

test.describe('Signup page', () => {
  test('renders with name, email, and password fields', async ({ page }) => {
    await page.goto('/signup')

    await expect(page).toHaveTitle(/Sign Up/)

    const nameInput = page.locator('input[name="displayName"]')
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')

    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('displays the "Create an account" heading', async ({ page }) => {
    await page.goto('/signup')

    const heading = page.locator('text=Create an account')
    await expect(heading).toBeVisible()
  })

  test('has a link to the login page', async ({ page }) => {
    await page.goto('/signup')

    const loginLink = page.locator('a[href="/login"]')
    await expect(loginLink).toBeVisible()
    await expect(loginLink).toHaveText('Sign in')
  })
})

test.describe('Forgot password page', () => {
  test('renders with email field and submit button', async ({ page }) => {
    await page.goto('/forgot-password')

    await expect(page).toHaveTitle(/Forgot Password/)

    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()

    const submitButton = page.locator('button[type="submit"]', { hasText: 'Send reset link' })
    await expect(submitButton).toBeVisible()
  })

  test('displays the "Reset password" heading', async ({ page }) => {
    await page.goto('/forgot-password')

    const heading = page.locator('text=Reset password')
    await expect(heading).toBeVisible()
  })

  test('has a link back to the login page', async ({ page }) => {
    await page.goto('/forgot-password')

    const backLink = page.locator('a[href="/login"]')
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveText('Back to sign in')
  })
})
