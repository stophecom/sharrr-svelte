import { expect, test } from '@playwright/test'

test('Home page has expected h1', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('secure file transfer')
})

test('About page has expected h1', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('h1')).toHaveText('About')
})
