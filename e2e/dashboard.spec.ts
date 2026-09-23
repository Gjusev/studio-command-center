import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
  })

  test('shows dashboard with KPIs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    // Check that stat cards are visible (using more specific selectors)
    await expect(page.locator('text=Kritische Best').first()).toBeVisible()
    await expect(page.locator('text=Außer Betrieb').first()).toBeVisible()
  })

  test('sidebar navigation works for admin', async ({ page }) => {
    // All navigation links should be present for studioleiter
    await expect(page.locator('nav a[href="/dashboard"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/consumables"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/machines"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/tasks"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/employees"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/settings"]').first()).toBeVisible()
  })

  test('can navigate to consumables via sidebar', async ({ page }) => {
    await page.locator('nav a[href="/consumables"]').first().click()
    await expect(page).toHaveURL(/\/consumables/)
  })

  test('can navigate to machines via sidebar', async ({ page }) => {
    await page.locator('nav a[href="/machines"]').first().click()
    await expect(page).toHaveURL(/\/machines/)
  })

  test('can navigate to tasks via sidebar', async ({ page }) => {
    await page.locator('nav a[href="/tasks"]').first().click()
    await expect(page).toHaveURL(/\/tasks/)
  })

  test('can navigate to employees via sidebar', async ({ page }) => {
    await page.locator('nav a[href="/employees"]').first().click()
    await expect(page).toHaveURL(/\/employees/)
  })
})

test.describe('Dashboard - Employee View', () => {
  test('employee sees limited sidebar', async ({ page }) => {
    await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    // Employee should NOT see settings link
    await expect(page.locator('nav a[href="/settings"]')).not.toBeVisible()
  })
})
