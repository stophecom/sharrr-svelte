import type { PlaywrightTestConfig } from '@playwright/test'

const isPreviewTest = process.env.PUBLIC_ENV === 'preview' // For tests ran on Github Actions

// Runs on published websites
const configPublished: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.VERCEL_URL
  },
  testDir: 'tests/published'
}

// Runs in local webserver
const config: PlaywrightTestConfig = {
  use: {
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write']
    }
  },
  webServer: {
    command: 'VERCEL_URL=http://localhost:4173 npm run build && npm run preview',
    port: 4173
  },
  testDir: 'tests/ci'
}

export default isPreviewTest ? configPublished : config
