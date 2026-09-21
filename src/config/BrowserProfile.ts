import type { PlaywrightTestConfig } from '@playwright/test';
import { config } from './index';

/**
 * BrowserProfile manages browser launch options, viewport defaults,
 * project matrix definitions, and reporting profiles.
 *
 * WHY:
 * Keeps `playwright.config.ts` lean (under 25 lines) and decouples
 * project matrices from top-level test runner configuration.
 */
export class BrowserProfile {
  /**
   * Common options inherited by all browser projects.
   */
  static useOptions(): PlaywrightTestConfig['use'] {
    return {
      baseURL: config.app.baseUrl,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      actionTimeout: config.timeouts.action,
      navigationTimeout: config.timeouts.navigation,
    };
  }

  /**
   * Defines the multi-project execution matrix:
   * 1. setup: Runs global UI authentication once and saves storageState.
   * 2. chromium / firefox / webkit: Authenticated browser projects.
   * 3. api: Headless API test execution without browser overhead.
   */
  static projects(): PlaywrightTestConfig['projects'] {
    return [
      // Authentication setup project (creates storage state)
      {
        name: 'setup',
        testMatch: /.*\.setup\.ts/,
      },
      // Desktop Chromium (Chrome)
      {
        name: 'chromium',
        dependencies: ['setup'],
        use: {
          browserName: 'chromium',
          storageState: '.auth/admin.json',
        },
      },
      // Desktop Firefox
      {
        name: 'firefox',
        dependencies: ['setup'],
        use: {
          browserName: 'firefox',
          storageState: '.auth/admin.json',
        },
      },
      // Desktop WebKit (Safari)
      {
        name: 'webkit',
        dependencies: ['setup'],
        use: {
          browserName: 'webkit',
          storageState: '.auth/admin.json',
        },
      },
      // Pure API project (Zero browser launch overhead)
      {
        name: 'api',
        testMatch: /.*\/tests\/api\/.*\.spec\.ts/,
      },
    ];
  }

  /**
   * Returns reporters based on execution environment.
   */
  static reporters(): PlaywrightTestConfig['reporter'] {
    const list: PlaywrightTestConfig['reporter'] = [
      ['html', { outputFolder: 'reports/html', open: 'never' }],
      ['list'],
      ['./src/observability/SummaryReporter.ts'],
      [
        'allure-playwright',
        {
          resultsDir: 'reports/allure-results',
          detail: true,
          suiteTitle: false,
          environmentInfo: {
            app_url: config.app.baseUrl,
            api_url: config.app.apiUrl,
            environment: config.app.env,
            ci: String(config.app.isCI),
          },
        },
      ],
      ['junit', { outputFile: 'reports/junit.xml' }],
      ['blob', { outputDir: 'reports/blob-report' }],
    ];

    if (config.app.isCI) {
      list.push(['github']);
    }

    return list;
  }
}
