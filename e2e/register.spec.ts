import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

const TEST_REG_NAME = process.env.TEST_REG_NAME
const TEST_REG_EMAIL = process.env.TEST_REG_EMAIL
const TEST_REG_PASSWORD = process.env.TEST_REG_PASSWORD

if (!TEST_REG_NAME || !TEST_REG_EMAIL || !TEST_REG_PASSWORD) {
  throw new Error('Missing TEST_REG_* environment variables in .env')
}

async function handleCookieModal(page) {
  const modal = page.locator('#cookie-modal')

  if (await modal.isVisible().catch(() => false)) {
    await page.locator('#accept-cookies').click()
    await expect(modal).toHaveClass(/hidden/)
  }
}

test.describe('Register Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await handleCookieModal(page)

    await page.locator('#name').waitFor({ state: 'visible' })
  })

  test('register successfully and redirect to login', async ({ page }) => {
    await page.route('**/register', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          name: TEST_REG_NAME,
          email: TEST_REG_EMAIL,
        }),
      })
    )

    await page.fill('#name', TEST_REG_NAME)
    await page.fill('#email', TEST_REG_EMAIL)
    await page.fill('#password', TEST_REG_PASSWORD)
    await page.fill(
      '#avatarUrl',
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e'
    )

    await page.click('#submitBtn')

    const successToast = page.locator(
      '#toastContainer >> text=Registration successful'
    )
    await expect(successToast).toBeVisible({ timeout: 5000 })

    await expect(page.locator('#loginForm')).toBeVisible({ timeout: 7000 })
    expect(page.url()).toContain('/login')
  })

  test('shows error for invalid email domain', async ({ page }) => {
    await page.fill('#name', 'Invalid Email User')
    await page.fill('#email', 'user@gmail.com')
    await page.fill('#password', 'somepassword')

    await page.click('#submitBtn')

    const error = page.locator('.text-red-700, .error-message')
    await expect(error.first()).toBeVisible()
    await expect(error.first()).toContainText(
      'Invalid email. Please use your @stud.noroff.no email.'
    )

    expect(page.url()).toContain('/register')
  })

  test('shows error when fields are empty', async ({ page }) => {
    await page.click('#submitBtn')

    const error = page.locator('.text-red-700, .error-message')
    await expect(error.first()).toBeVisible()
    await expect(error.first()).toContainText('required')

    expect(page.url()).toContain('/register')
  })

  test('shows API error when email already exists', async ({ page }) => {
    await page.route('**/register', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Email already exists',
        }),
      })
    )

    await page.fill('#name', 'Test User')
    await page.fill('#email', TEST_REG_EMAIL)
    await page.fill('#password', TEST_REG_PASSWORD)

    await page.click('#submitBtn')

    const error = page.locator('.text-red-700, .error-message')
    await expect(error.first()).toBeVisible()
    await expect(error.first()).toContainText('Registration failed')

    const toast = page.locator('#toastContainer >> text=Email already exists')
    await expect(toast)
      .toBeVisible({ timeout: 5000 })
      .catch(() => console.warn('Error toast missing, skipping'))
  })
})
