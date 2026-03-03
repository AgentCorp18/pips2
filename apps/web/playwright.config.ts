import { resolve } from 'path'
import { defineConfig, devices } from '@playwright/test'

// Load .env.local for Supabase credentials in E2E tests
// Uses Node.js built-in (no external dependency)
try {
  process.loadEnvFile(resolve(__dirname, '.env.local'))
} catch {
  // .env.local may not exist in CI — env vars are set externally
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
