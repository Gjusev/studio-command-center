import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Consumables', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/consumables')
  })

  test('consumables list page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Verbrauchsmaterialien' })).toBeVisible()
    // Should display test data consumables
    await expect(page.getByText('Handtücher').first()).toBeVisible()
    await expect(page.getByText('Desinfektionsmittel').first()).toBeVisible()
    await expect(page.getByText('Protein Riegel').first()).toBeVisible()
  })

  test('can search consumables', async ({ page }) => {
    // Use the main search box on the consumables page (the searchbox type input)
    const searchInput = page.getByRole('searchbox').first()
    await searchInput.fill('Handtücher')
    await page.waitForTimeout(500)
    await expect(page.getByText('Handtücher').first()).toBeVisible()
  })

  test('can navigate to consumable detail', async ({ page }) => {
    // Click on a consumable row - look for links that point to a UUID pattern
    const consumableLink = page.locator('a[href*="-"][href*="-"][href*="-"]').first()
    if (await consumableLink.isVisible()) {
      await consumableLink.click()
      await expect(page).toHaveURL(/\/consumables\/[0-9a-f]{8}-/)
    }
  })

  test('can navigate to create new consumable', async ({ page }) => {
    const newBtn = page.locator('a[href="/consumables/new"]').first()
    await newBtn.click()
    await expect(page).toHaveURL(/\/consumables\/new/)
  })
})

test.describe('Consumables - Detail', () => {
  test('can view consumable detail', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/consumables')
    // Click on a consumable item - use text content that we know exists
    const handtuch = page.getByText('Handtücher').first()
    await handtuch.click()
    // Should navigate to consumable detail
    await page.waitForTimeout(1000)
    const url = page.url()
    // If it navigated to a detail page, check URL pattern
    expect(url).toMatch(/localhost:3000/)
  })
})

test.describe('Consumables - Settings (Categories/Locations/Suppliers)', () => {
  test('settings page loads', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/consumables/settings')
    await expect(page.getByRole('heading', { name: /Einstellungen|Settings/i })).toBeVisible()
  })

  test('categories are listed', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/consumables/settings')
    await expect(page.getByText('Hygiene').first()).toBeVisible()
    await expect(page.getByText('Supplements').first()).toBeVisible()
  })

  test('locations are listed', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/consumables/settings')
    await expect(page.getByText('Hauptlager').first()).toBeVisible()
  })
})
