import { test, expect } from '@playwright/test'

test.describe('Protected route redirects', () => {
  test('/dashboard redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login/)
  })

  test('/projects redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/projects')

    await expect(page).toHaveURL(/\/login/)
  })

  test('/tickets redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/tickets')

    await expect(page).toHaveURL(/\/login/)
  })

  test('/settings redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/settings')

    await expect(page).toHaveURL(/\/login/)
  })

  test('/my-work redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/my-work')

    await expect(page).toHaveURL(/\/login/)
  })

  test('redirect URL includes the original path as next param', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/)
  })
})
