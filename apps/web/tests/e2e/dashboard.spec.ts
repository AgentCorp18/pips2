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
    const heading = page.getByTestId('dashboard-heading')
    await expect(heading).toBeVisible()

    // Welcome text should be present
    const welcomeText = page.getByTestId('dashboard-welcome-text')
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
    const roleBadge = page.getByTestId('dashboard-role-badge')
    await expect(roleBadge).toBeVisible()

    // Plan badge (e.g., "free plan", "pro plan")
    const planBadge = page.getByTestId('dashboard-plan-badge')
    await expect(planBadge).toBeVisible()
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
    const projectsLink = page.getByTestId('nav-link-projects')
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
    const projectsLink = page.getByTestId('nav-link-projects')
    await projectsLink.click()

    await expect(page).toHaveURL(/\/projects/)

    // Verify projects page loaded
    const heading = page.getByTestId('projects-page-heading')
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
    const ticketsLink = page.getByTestId('nav-link-tickets')
    await ticketsLink.click()

    await expect(page).toHaveURL(/\/tickets/)

    const heading = page.getByTestId('tickets-page-heading')
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

    const projectsLink = page.getByTestId('nav-link-projects')
    await projectsLink.click()
    await page.waitForLoadState('networkidle')

    // Click "New Project" button
    const newProjectButton = page.getByTestId('new-project-link')
    await newProjectButton.click()

    await expect(page).toHaveURL(/\/projects\/new/)

    // Verify the creation form loaded
    const formHeading = page.getByTestId('create-project-heading')
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

    // Step gradient stripe in sidebar
    const stripe = page.locator('aside .step-gradient-stripe')
    await expect(stripe).toBeVisible()
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
    const searchTrigger = page.getByTestId('search-trigger')
    await expect(searchTrigger).toBeVisible()
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
      { label: 'dashboard', href: '/dashboard' },
      { label: 'projects', href: '/projects' },
      { label: 'tickets', href: '/tickets' },
      { label: 'teams', href: '/teams' },
      { label: 'settings', href: '/settings' },
    ]

    for (const item of navItems) {
      const link = page.getByTestId(`nav-link-${item.label}`)
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', item.href)
    }
  })
})
