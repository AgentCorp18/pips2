import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads with the correct title', async ({ page }) => {
    await page.goto('/')

    // The landing page title is "Process Improvement Made Simple | PIPS — ..."
    await expect(page).toHaveTitle(/Process Improvement Made Simple/)
  })

  test('displays the hero heading', async ({ page }) => {
    await page.goto('/')

    // The actual h1 in hero-section.tsx reads "Process Improvement Made Simple"
    const heading = page.locator('h1', { hasText: 'Process Improvement Made Simple' })
    await expect(heading).toBeVisible()
  })

  test('displays the product description', async ({ page }) => {
    await page.goto('/')

    // The overline span contains "6-Step Process Improvement Methodology" (capitalized)
    const description = page.getByText('6-Step Process Improvement Methodology')
    await expect(description).toBeVisible()
  })
})
