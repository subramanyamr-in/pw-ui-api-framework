import { defineConfig } from '@playwright/test';
import { config } from './src/config/index';
import { BrowserProfile } from './src/config/BrowserProfile';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Lean Playwright configuration that delegates environment loading,
 * browser matrices, and lifecycle hooks to the modular config layer.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: config.app.isCI,
  retries: config.runner.retries,
  workers: config.runner.workers,
  timeout: config.timeouts.test,

  reporter: BrowserProfile.reporters(),
  globalSetup: './src/config/GlobalSetup.ts',
  globalTeardown: './src/config/GlobalTeardown.ts',

  outputDir: 'reports/test-artifacts',
  use: BrowserProfile.useOptions(),
  projects: BrowserProfile.projects(),
});
