import { defineConfig } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import path from 'node:path'

// The app and tests share a fresh database, never the developer's data/ folder.
process.env.FORMA_E2E_RUN_ID ||= randomUUID()
process.env.PLATFORM_DATA_DIR = path.join(tmpdir(), 'opencode', `forma-e2e-${process.env.FORMA_E2E_RUN_ID}`)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://localhost:3100', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run start -- --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    env: { PLATFORM_DATA_DIR: process.env.PLATFORM_DATA_DIR, COOKIE_SECURE: 'false' },
  },
})
