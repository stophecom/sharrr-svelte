import type { PlaywrightTestConfig } from '@playwright/test'

const isTest = process.env.PUBLIC_ENV === 'CI' // For tests ran on Github Actions

// Runs on published websites
const configCI: PlaywrightTestConfig = {
  use: {
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write']
    },
    baseURL: process.env.VERCEL_URL
  },
  testDir: 'tests'
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
  testDir: 'tests'
}

export default isTest ? configCI : config
