import { test as base, type Page } from '@playwright/test';
import { BasePage } from '@pages';
import { logger } from '@utils';

/**
 * Concrete generic BasePage implementation for base tests and direct fixture injection.
 */
export class WebPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
}

export interface UiFixtures {
  basePage: WebPage;
  logger: typeof logger;
}

/**
 * Dedicated UI Test Fixture.
 * Automatically handles failure screenshot capture attached directly to the test report.
 */
export const uiTest = base.extend<UiFixtures>({
  logger: async ({}, use) => {
    await use(logger);
  },

  basePage: async ({ page }, use) => {
    const webPage = new WebPage(page);
    await use(webPage);
  },

  page: async ({ page }, use, testInfo) => {
    await use(page);

    // Auto-capture screenshot on test failure
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
      if (screenshot) {
        await testInfo.attach('failure-screenshot', {
          body: screenshot,
          contentType: 'image/png',
        });
        logger.warn(`📸 [FAILURE ARTIFACT] Captured screenshot for "${testInfo.title}"`);
      }
    }
  },
});
