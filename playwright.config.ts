import type { PlaywrightTestConfig } from '@playwright/test'

const isLocalTest = process.env.PUBLIC_ENV === 'development'

// Runs in local webserver
const config: PlaywrightTestConfig = {
  use: {
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write']
    },
    video: 'off',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'VERCEL_URL=http://localhost:4173 npm run build && npm run preview',
    port: 4173
  },
  testDir: 'tests/ci'
}

// Runs on published websites
const configPublished: PlaywrightTestConfig = {
  use: {
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write']
    },
    video: 'off',
    screenshot: 'only-on-failure',
    baseURL: process.env.VERCEL_URL
  },

  testDir: 'tests/ci'
}

export default isLocalTest ? config : configPublished
