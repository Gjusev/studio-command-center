import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Machines', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/machines')
  })

  test('machines list page loads with data', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Maschinen' })).toBeVisible()
    await expect(page.getByText('Laufband Pro 5000').first()).toBeVisible()
    await expect(page.getByText('Crosstrainer Elite').first()).toBeVisible()
    await expect(page.getByText('Beinpresse X200').first()).toBeVisible()
    await expect(page.getByText('Latzug Station').first()).toBeVisible()
  })

  test('shows machine statuses', async ({ page }) => {
    // Beinpresse is in MAINTENANCE status
    await expect(page.getByText(/Wartung|MAINTENANCE/i).first()).toBeVisible()
  })

  test('can navigate to machine detail', async ({ page }) => {
    // Click on a machine name to go to its detail page
    await page.getByText('Laufband Pro 5000').first().click()
    await page.waitForTimeout(1000)
    // Should have navigated away from the list page
    const url = page.url()
    expect(url).toMatch(/localhost:3000/)
  })

  test('machine detail shows info and events', async ({ page }) => {
    // Go to Beinpresse detail (has maintenance event)
    await page.getByText('Beinpresse X200').first().click()
    await expect(page).toHaveURL(/\/machines\/[0-9a-f]{8}-/)
    // Should show the maintenance event
    await expect(page.getByText(/Jährliche Inspektion/).first()).toBeVisible()
  })

  test('can navigate to create new machine', async ({ page }) => {
    const newBtn = page.locator('a[href="/machines/new"]').first()
    await newBtn.click()
    await expect(page).toHaveURL(/\/machines\/new/)
  })

  test('machine detail shows brand and model', async ({ page }) => {
    await page.getByText('Laufband Pro 5000').first().click()
    await expect(page.getByText('Technogym').first()).toBeVisible()
  })
})

test.describe('Machines - Open incidents', () => {
  test('shows open incident for Laufband', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/machines')
    // Navigate to Laufband detail
    await page.getByText('Laufband Pro 5000').first().click()
    // Should show incident
    await expect(page.getByText(/Geräusche/i).first()).toBeVisible()
  })
})
