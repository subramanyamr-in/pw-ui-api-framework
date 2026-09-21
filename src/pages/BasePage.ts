import type { Page, Response } from '@playwright/test';
import { config } from '@config';
import { logger } from '@utils';

/**
 * Abstract BasePage providing lean, application-agnostic web interactions.
 * All domain Page Objects extend BasePage.
 *
 * IDIOMATIC PLAYWRIGHT DESIGN:
 * 1. Leverages Playwright's native auto-waiting (no explicit element polling or try/catch wrappers).
 * 2. Defers timeouts to Playwright's global configuration in playwright.config.ts.
 * 3. Keeps methods simple, predictable, and decoupled.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a relative path or absolute URL.
   * Relative paths are resolved against config.app.baseUrl.
   */
  async navigate(path = ''): Promise<Response | null> {
    const targetUrl = this.resolveUrl(path);
    logger.info(`Navigating to ${targetUrl}`);
    return this.page.goto(targetUrl);
  }

  /**
   * Waits for a specific URL or RegExp pattern.
   */
  async waitForUrl(urlOrPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlOrPattern);
  }

  /**
   * Waits for specific page load states ('load', 'domcontentloaded', 'networkidle').
   */
  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded'
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Returns document title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Returns current URL.
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Reloads current page.
   */
  async reload(): Promise<Response | null> {
    return this.page.reload();
  }

  /**
   * Captures a screenshot buffer for diagnostics or report attachments.
   */
  async takeScreenshot(fullPage = false): Promise<Buffer> {
    return this.page.screenshot({ fullPage });
  }

  /**
   * Resolves relative path against configured base URL.
   */
  protected resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = config.app.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }
}
