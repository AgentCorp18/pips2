import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads with the correct title', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/PIPS/)
  })

  test('displays the PIPS 2.0 heading', async ({ page }) => {
    await page.goto('/')

    const heading = page.locator('h1', { hasText: 'PIPS 2.0' })
    await expect(heading).toBeVisible()
  })

  test('displays the product description', async ({ page }) => {
    await page.goto('/')

    const description = page.locator('text=6-step process improvement methodology')
    await expect(description).toBeVisible()
  })
})
