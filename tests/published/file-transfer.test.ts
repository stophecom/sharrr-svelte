import { expect, test } from '@playwright/test'
import type { Page, Download } from '@playwright/test'

test.describe.configure({ mode: 'serial' })

let page: Page
let secretUrl: string
let download: Download

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test('File upload ', async ({ baseURL }) => {
  await page.goto('/')

  const [fileChooser] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    page.waitForEvent('filechooser'),
    // Opens the file chooser.
    page.locator("input[type='file']").click()
  ])
  await fileChooser.setFiles(['src/app.html'])

  await page.getByTestId('copy-link').click()
  secretUrl = await page.evaluate(() => navigator.clipboard.readText())

  expect(secretUrl).toContain(`${baseURL}/s#`)
})

test('Download page renders correctly', async () => {
  await page.goto(secretUrl)
  await expect(page.locator('h1')).toHaveText('You received a file')
  await expect(page.getByTestId('download-button')).toBeVisible()
})

test('File download succeeds', async () => {
  // Download file
  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('download-button').click()
  download = await downloadPromise
  expect(downloadPromise).resolves
})

test(`File can't be accessed twice`, async () => {
  await page.reload()
  await expect(page.getByTestId('download-error')).toBeVisible()
})
