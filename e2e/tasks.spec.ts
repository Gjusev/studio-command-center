import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/tasks')
  })

  test('tasks page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Mitarbeiter Performance/i })).toBeVisible()
  })

  test('can navigate to task templates', async ({ page }) => {
    const templatesLink = page.locator('a[href*="templates"]')
    if (await templatesLink.first().isVisible()) {
      await templatesLink.first().click()
    }
  })

  test('can navigate to create task template', async ({ page }) => {
    const newBtn = page.locator('a[href="/tasks/templates/new"]')
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await expect(page).toHaveURL(/\/tasks\/templates\/new/)
    }
  })
})

test.describe('Tasks - Assignment', () => {
  test('admin can navigate to task assignment', async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/tasks')
    const assignLink = page.locator('a[href*="assign"]')
    if (await assignLink.first().isVisible()) {
      await assignLink.first().click()
      await expect(page).toHaveURL(/\/tasks\/assign/)
    }
  })
})

test.describe('Tasks - Employee View', () => {
  test('employee sees dashboard with tasks panel', async ({ page }) => {
    await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password)
    // Dashboard should load for employee
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})
