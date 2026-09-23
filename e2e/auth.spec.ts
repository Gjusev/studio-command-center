import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Authentication', () => {
  test('signin page loads correctly', async ({ page }) => {
    await page.goto('/signin')
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Anmelden/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Registrieren/ })).toBeVisible()
  })

  test('signup page loads correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input#studio')).toBeVisible()
    await expect(page.locator('input#name')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
  })

  test('can sign in as studioleiter (admin)', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('can sign in as mitarbeiter', async ({ page }) => {
    await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('shows error with wrong credentials', async ({ page }) => {
    await page.goto('/signin')
    await page.locator('input#email').fill('wrong@test.de')
    await page.locator('input#password').fill('wrongpassword')
    await page.getByRole('button', { name: /Anmelden/ }).click()
    // Wait for error message - it shows in a div with text-destructive class
    await expect(page.locator('div.text-destructive').first()).toBeVisible({ timeout: 10000 })
  })

  test('redirects to signin when accessing protected route without auth', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/signin/, { timeout: 10000 })
  })

  test('redirects to dashboard when authenticated and visiting root', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('can navigate between signin and signup pages', async ({ page }) => {
    await page.goto('/signin')
    await page.getByRole('link', { name: /Registrieren/ }).click()
    await expect(page).toHaveURL(/\/signup/)
    await page.getByRole('link', { name: /Anmelden/ }).click()
    await expect(page).toHaveURL(/\/signin/)
  })

  test('can sign out', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await expect(page).toHaveURL(/\/dashboard/)
    // Click user menu button (contains user initial)
    await page.locator('button:has(> div.size-10)').last().click()
    // Click logout
    await page.getByRole('button', { name: /Abmelden/ }).click()
    await expect(page).toHaveURL(/\/signin/, { timeout: 10000 })
  })
})
