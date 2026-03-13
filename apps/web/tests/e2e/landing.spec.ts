import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('loads with the correct title', async ({ page }) => {
    await page.goto('/')

    // The landing page title is "Transform How Your Team Solves Problems | PIPS"
    await expect(page).toHaveTitle(/Transform How Your Team Solves Problems/)
  })

  test('displays the hero heading', async ({ page }) => {
    await page.goto('/')

    // The actual h1 in hero-section.tsx reads "Transform How Your Team Solves Problems"
    const heading = page.locator('h1', { hasText: 'Transform How Your Team Solves Problems' })
    await expect(heading).toBeVisible()
  })

  test('displays the methodology overline', async ({ page }) => {
    await page.goto('/')

    // The overline span contains "6-Step Process Improvement Methodology"
    // Use first() since the text may appear in multiple places on the page
    const overline = page.getByText('6-Step Process Improvement Methodology').first()
    await expect(overline).toBeVisible()
  })
})
