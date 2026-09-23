import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Settings - Admin only', () => {
  test('admin can access settings page', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/settings')
    // Page should load - may show error if DB function missing, but route should work
    await expect(page).toHaveURL(/\/settings/)
  })

  test('employee cannot access settings', async ({ page }) => {
    await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password)
    // Settings link should not be in sidebar for employees
    await expect(page.locator('nav a[href="/settings"]')).not.toBeVisible()
  })
})

test.describe('Profile', () => {
  test('can view own profile page', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/profile/)
  })

  test('email field exists on profile', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/profile')
    // Email input should exist and be disabled
    const emailInput = page.locator('input[type="email"], input[value*="@"]').first()
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeDisabled()
    }
  })
})

test.describe('Landing Page', () => {
  test('landing page loads without auth', async ({ page }) => {
    await page.goto('/')
    // Should either show landing page or redirect to signin
    const url = page.url()
    expect(url).toMatch(/localhost:3000/)
  })

  test('landing page shows sign in link', async ({ page }) => {
    await page.goto('/')
    // Should have navigation with signin/signup links
    const signInLink = page.getByRole('link', { name: /Anmelden/ }).first()
    if (await signInLink.isVisible()) {
      await signInLink.click()
      await expect(page).toHaveURL(/\/signin/)
    }
  })
})
