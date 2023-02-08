import type { PlaywrightTestConfig } from '@playwright/test'

// Run local tests headed: PUBLIC_ENV=development npm run test -- --headed
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
  testDir: 'tests/local'
}

// Runs on published websites
const configPublished: PlaywrightTestConfig = {
  timeout: 10000,
  use: {
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write']
    },
    video: 'off',
    screenshot: 'only-on-failure',
    baseURL: process.env.VERCEL_URL || 'http://localhost:3000'
  },

  testDir: 'tests/published'
}

export default isLocalTest ? config : configPublished
