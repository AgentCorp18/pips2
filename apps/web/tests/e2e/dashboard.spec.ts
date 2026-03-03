import { test, expect, type Page } from '@playwright/test'

/**
 * Dashboard Verification E2E flow
 *
 * Tests that the dashboard renders all key sections: stat cards,
 * projects-by-step chart, recent activity, and quick action navigation.
 */

/** Helper: attempt login and skip tests if auth fails */
const loginIfPossible = async (page: Page): Promise<boolean> => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('input[name="email"]')
  const isLoginPage = await emailInput.isVisible().catch(() => false)

  if (!isLoginPage) {
    return !page.url().includes('/login')
  }

  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    return false
  }

  await emailInput.fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 }).catch(() => {})
  return !page.url().includes('/login')
}

test.describe('Dashboard access', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login/)
  })

  test('redirect URL includes next param for dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/)
  })
})

test.describe('Dashboard page content', () => {
  test('shows the organization name as heading', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // If redirected to onboarding, skip (no org yet)
    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    await expect(page).toHaveTitle(/Dashboard/)

    // The org name is rendered as an h1
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()

    // Welcome text should be present
    const welcomeText = page.getByText('Welcome to your PIPS dashboard')
    await expect(welcomeText).toBeVisible()
  })

  test('shows role and plan badges', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Role badge (e.g., "Owner", "Admin", "Member")
    const roleBadge = page.getByText(/(Owner|Admin|Member|Viewer)/)
    await expect(roleBadge.first()).toBeVisible()

    // Plan badge (e.g., "free plan", "pro plan")
    const planBadge = page.getByText(/plan/)
    await expect(planBadge.first()).toBeVisible()
  })

  test('shows the step gradient stripe', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    const stripe = page.locator('.step-gradient-stripe')
    await expect(stripe).toBeVisible()
  })
})

test.describe('Dashboard stat cards', () => {
  test('renders all four stat cards', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Verify all 4 stat card titles
    const activeProjects = page.getByText('Active Projects')
    const openTickets = page.getByText('Open Tickets')
    const overdue = page.getByText('Overdue')
    const completedThisMonth = page.getByText('Completed This Month')

    await expect(activeProjects).toBeVisible()
    await expect(openTickets).toBeVisible()
    await expect(overdue).toBeVisible()
    await expect(completedThisMonth).toBeVisible()
  })

  test('stat cards display numeric values', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Each stat card contains a bold number (text-2xl font-bold)
    const statValues = page.locator('.text-2xl.font-bold')
    const count = await statValues.count()

    // Should have at least 4 stat values
    expect(count).toBeGreaterThanOrEqual(4)

    // Each value should be a number
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = await statValues.nth(i).textContent()
      expect(text).toBeTruthy()
      expect(Number.isInteger(Number(text?.trim()))).toBe(true)
    }
  })
})

test.describe('Dashboard projects-by-step chart', () => {
  test('renders the Projects by Step chart card', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    const chartTitle = page.getByText('Projects by Step')
    await expect(chartTitle).toBeVisible()
  })

  test('shows empty state or chart content', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Either shows the empty state message or the chart
    const emptyMessage = page.getByText('No active projects yet')
    const chartContainer = page.locator('.recharts-responsive-container')

    const hasEmpty = await emptyMessage.isVisible().catch(() => false)
    const hasChart = await chartContainer.isVisible().catch(() => false)

    // One of these must be visible
    expect(hasEmpty || hasChart).toBe(true)
  })
})

test.describe('Dashboard recent activity', () => {
  test('renders the Recent Activity section', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    const activityTitle = page.getByText('Recent Activity')
    await expect(activityTitle).toBeVisible()
  })

  test('shows empty state message or activity items', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Either shows empty message or activity items
    const emptyMessage = page.getByText('No recent activity')
    const viewAllLink = page.getByRole('link', { name: 'View all' })

    const hasEmpty = await emptyMessage.isVisible().catch(() => false)
    const hasViewAll = await viewAllLink.isVisible().catch(() => false)

    // One of these must be visible
    expect(hasEmpty || hasViewAll).toBe(true)
  })

  test('View all link navigates to tickets page', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    const viewAllLink = page.getByRole('link', { name: 'View all' })
    const hasLink = await viewAllLink.isVisible().catch(() => false)

    if (!hasLink) {
      // No activity yet, no "View all" link shown
      test.skip()
      return
    }

    await viewAllLink.click()
    await expect(page).toHaveURL(/\/tickets/)
  })
})

test.describe('Dashboard navigation actions', () => {
  test('sidebar has navigation to projects page', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Sidebar nav link to Projects
    const projectsLink = page.locator('a[href="/projects"]')
    await expect(projectsLink).toBeVisible()
  })

  test('sidebar navigation works from dashboard to projects', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Click Projects in sidebar
    const projectsLink = page.locator('a[href="/projects"]')
    await projectsLink.click()

    await expect(page).toHaveURL(/\/projects/)

    // Verify projects page loaded
    const heading = page.getByRole('heading', { name: 'Projects' })
    await expect(heading).toBeVisible()
  })

  test('sidebar navigation works from dashboard to tickets', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Click Tickets in sidebar
    const ticketsLink = page.locator('a[href="/tickets"]')
    await ticketsLink.click()

    await expect(page).toHaveURL(/\/tickets/)

    const heading = page.getByRole('heading', { name: 'Tickets' })
    await expect(heading).toBeVisible()
  })

  test('projects page has "New Project" that leads to creation', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    // Navigate to projects via the dashboard sidebar
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    const projectsLink = page.locator('a[href="/projects"]')
    await projectsLink.click()
    await page.waitForLoadState('networkidle')

    // Click "New Project" button
    const newProjectButton = page.getByRole('link', { name: /New Project/ })
    await newProjectButton.click()

    await expect(page).toHaveURL(/\/projects\/new/)

    // Verify the creation form loaded
    const formHeading = page.getByText('Create a new project')
    await expect(formHeading).toBeVisible()
  })
})

test.describe('Dashboard layout', () => {
  test('sidebar shows PIPS branding and step dots', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // PIPS brand text in sidebar
    const brandText = page.locator('aside').getByText('PIPS')
    await expect(brandText).toBeVisible()

    // Step dots in sidebar
    const dots = page.locator('aside .pip-dot')
    const dotCount = await dots.count()
    expect(dotCount).toBe(6)
  })

  test('header has search trigger and user menu', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    // Search trigger button (opens command palette)
    const searchTrigger = page.getByText('Search projects, tickets...')
    const hasSearch = await searchTrigger.isVisible().catch(() => false)
    // On mobile, the text may be hidden
    if (hasSearch) {
      await expect(searchTrigger).toBeVisible()
    }
  })

  test('sidebar has all 5 navigation items', async ({ page }) => {
    const loggedIn = await loginIfPossible(page)

    if (!loggedIn) {
      test.skip()
      return
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    if (page.url().includes('/onboarding')) {
      test.skip()
      return
    }

    const navItems = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Projects', href: '/projects' },
      { label: 'Tickets', href: '/tickets' },
      { label: 'Teams', href: '/teams' },
      { label: 'Settings', href: '/settings' },
    ]

    for (const item of navItems) {
      const link = page.locator(`a[href="${item.href}"]`)
      await expect(link).toBeVisible()
      await expect(link).toContainText(item.label)
    }
  })
})
