import { test as base, expect } from '@playwright/test'

export const TEST_USERS = {
  admin: {
    email: 'admin@teststudio.de',
    password: 'TestPass123!',
    name: 'Admin Test',
    role: 'studioleiter',
  },
  employee: {
    email: 'mitarbeiter@teststudio.de',
    password: 'TestPass123!',
    name: 'Max Mitarbeiter',
    role: 'mitarbeiter',
  },
}

type TestFixtures = {
  authedPage: import('@playwright/test').Page
}

export const test = base.extend<TestFixtures>({
  authedPage: async ({ page }, use) => {
    await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password)
    await use(page)
  },
})

export { expect }

export async function login(page, email, password) {
  await page.goto('/signin')
  await page.getByLabel('E-Mail').fill(email)
  await page.getByLabel('Passwort').fill(password)
  await page.getByRole('button', { name: /Anmelden/ }).click()
  await page.waitForURL(/\/(dashboard)/, { timeout: 15000 })
}

export async function loginAsEmployee(page) {
  await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password)
}
