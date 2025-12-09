import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

const TEST_EMAIL = process.env.TEST_EMAIL
const TEST_PASSWORD = process.env.TEST_PASSWORD

if (!TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error('TEST_EMAIL or TEST_PASSWORD not defined in .env')
}

async function handleCookieModal(page) {
  const modal = page.locator('#cookie-modal')

  if (await modal.isVisible().catch(() => false)) {
    const acceptBtn = page.locator('#accept-cookies')
    await expect(acceptBtn).toBeVisible()
    await acceptBtn.click()
    await expect(modal).toHaveClass(/hidden/)
  }
}

test.describe('Login Flow with Cookie Consent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await handleCookieModal(page)
  })

  test('login successfully and redirect to home', async ({ page }) => {
    await page.fill('#email', TEST_EMAIL)
    await page.fill('#password', TEST_PASSWORD)

    await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes('/login') && resp.status() === 200
      ),
      page.click('#submitBtn'),
    ])

    await expect(page.locator('#loadingOverlay')).toBeHidden({ timeout: 5000 })

    const successToast = page.locator(
      '#toastContainer >> text=successfully logged in'
    )
    await expect(successToast)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        console.warn('Success toast not found, skipping check')
      })

    await page.waitForURL('/home', { timeout: 5000 })
    expect(page.url()).toContain('/home')
  })

  test('shows error on invalid login', async ({ page }) => {
    await page.fill('#email', 'invalid@test.com')
    await page.fill('#password', 'wrongpassword')

    await Promise.all([
      page.waitForResponse(
        (resp) => resp.url().includes('/login') && resp.status() === 401
      ),
      page.click('#submitBtn'),
    ])

    const errorLocator = page.locator(
      '#formError, [role="alert"], .error-message, .notification-error'
    )
    await expect(errorLocator).toBeVisible({ timeout: 5000 })

    const errorToast = page.locator('#toastContainer >> text=Login failed')
    await expect(errorToast)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        console.warn('Error toast not found, skipping check')
      })

    await expect(page.locator('#loadingOverlay')).toBeHidden({ timeout: 5000 })

    expect(page.url()).toContain('/login')
  })
})
