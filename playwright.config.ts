import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    contextOptions: {
      permissions: ['clipboard-read', 'clipboard-write', 'accessibility-events']
    }
  },
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173
  },
  testDir: 'tests'
}

export default config
