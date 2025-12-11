import { test, expect } from '@playwright/test'

test.describe('HomeView E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should render HeroSection and Ending Soon section', async ({
    page,
  }) => {
    await expect(
      page.locator('section:has-text("⏳ Ending Soon")')
    ).toBeVisible()
  })

  test('should display loading skeletons initially', async ({ page }) => {
    const skeletons = page.locator('.animate-pulse')
    await expect(skeletons.first()).toBeVisible()
  })

  test('should fetch and render listings', async ({ page }) => {
    await page.waitForSelector('#homeContent > div:not(.animate-pulse)', {
      timeout: 5000,
    })

    const listings = page.locator('#homeContent > div')
    const count = await listings.count()
    expect(count).toBeGreaterThan(0)

    const firstListingText = await listings.first().innerText()
    expect(firstListingText).toContain('Highest Bid')
  })

  test('should render pagination if more than 9 listings', async ({ page }) => {
    const pagination = page.locator('#paginationControls')
    await expect(pagination).toBeVisible()

    const pages = pagination.locator('button')
    const pageCount = await pages.count()
    expect(pageCount).toBeGreaterThan(1)
  })

  test('login button should navigate to login', async ({ page }) => {
    const acceptCookies = page.getByRole('button', {
      name: 'Accept All Cookies',
    })
    if (await acceptCookies.count()) {
      await acceptCookies.click()
    }

    const navbarLogin = page
      .locator('#desktopMenu')
      .getByRole('link', { name: 'Login' })
    if (await navbarLogin.count()) {
      await navbarLogin.click()
      await expect(page).toHaveURL(/\/login/)
      return
    }

    const heroLogin = page.getByRole('button', { name: 'Login to Bid' }).first()
    if (await heroLogin.count()) {
      await heroLogin.click()
      await expect(page).toHaveURL(/\/login/)
    }
  })
})
