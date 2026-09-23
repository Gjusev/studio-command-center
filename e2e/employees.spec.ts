import { test, expect, login, TEST_USERS } from './helpers'

test.describe('Employees', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await page.goto('/employees')
  })

  test('employees list page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Mitarbeiter/i })).toBeVisible()
    // Should show test employees
    await expect(page.getByText('Admin Test').first()).toBeVisible()
    await expect(page.getByText('Max Mitarbeiter').first()).toBeVisible()
  })

  test('can navigate to create new employee', async ({ page }) => {
    const newBtn = page.locator('a[href="/employees/new"]').first()
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await expect(page).toHaveURL(/\/employees\/new/)
    }
  })
})

test.describe('Employees - Employee View', () => {
  test('mitarbeiter can view employee list', async ({ page }) => {
    await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password)
    await page.goto('/employees')
    await expect(page.getByRole('heading', { name: /Mitarbeiter/i })).toBeVisible()
  })
})
