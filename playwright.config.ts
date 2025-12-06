import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',       // points to your e2e tests folder
  testMatch: ['**/*.spec.ts'],  // include .spec.ts files
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',  // your dev server
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',   // your Vite dev server
    port: 5173,               // make sure this matches baseURL
    timeout: 120 * 1000,      // 2 minutes
    reuseExistingServer: !process.env.CI,
  },
})
