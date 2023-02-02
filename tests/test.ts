import { expect, test } from '@playwright/test'
import fs from 'fs'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

test('Complete upload and download file journey', async ({ page }) => {
  await page.goto('/')
  // Create and Upload CSV File

  const buf = Buffer.from(new String('this is a test'))
  const originalSize = buf.byteLength

  await page.setInputFiles("input[type='file']", {
    name: 'foo.txt',
    mimeType: 'text/plain',
    buffer: buf
  })

  await page.getByTestId('copy-link').click()
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText())

  expect(clipboardText).toContain(`${process.env.VERCEL_URL}/s#`)

  await page.goto(clipboardText)

  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent('download')

  // Download file
  await page.getByTestId('download-button').click()
  const download = await downloadPromise
  // We test if downloaded file is the same size
  expect((await fs.promises.stat((await download.path()) as string)).size).toBe(originalSize)

  await page.reload()
  await page.getByTestId('download-button').click()

  await expect(page.getByTestId('download-error')).toBeVisible()
})

test('About page has expected h1', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('h1')).toHaveText('About')
})
