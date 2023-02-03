import { expect, test, type Download } from '@playwright/test'
import type { Page } from '@playwright/test'
import fs from 'fs'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

test.describe.configure({ mode: 'serial' })

let page: Page
let secretUrl: string
let originalSize: number
let download: Download

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test('File upload ', async ({ baseURL }) => {
  await page.goto('/')

  // Create and upload text file
  const buf = Buffer.from(new String('this is a test'))
  originalSize = buf.byteLength

  await page.setInputFiles("input[type='file']", {
    name: 'foo.txt',
    mimeType: 'text/plain',
    buffer: buf
  })

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
  test.skip(process.env.PUBLIC_ENV === 'CI')
  // Test doesn't run on actual published website for some reason. (Maybe issue with service worker or access to fs, etc.)

  // Download file
  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('download-button').click()
  download = await downloadPromise
  expect(downloadPromise).resolves
  expect((await fs.promises.stat((await download.path()) as string)).size).toBe(originalSize)
})

test(`File can't be accessed twice`, async () => {
  await page.reload()
  await page.getByTestId('download-button').click()

  await expect(page.getByTestId('download-error')).toBeVisible()
})

test('About page has expected h1', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('h1')).toHaveText('About')
})
