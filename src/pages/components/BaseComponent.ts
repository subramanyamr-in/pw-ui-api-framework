import type { Locator, Page } from '@playwright/test';

/**
 * BaseComponent serves as the foundational class for modular UI component primitives.
 *
 * ARCHITECTURAL RULE:
 * Every component is strictly scoped to a root Locator.
 * All internal element lookups must originate from this.root to prevent DOM bleeding across tests.
 * Auto-waiting is natively handled by Playwright; no custom polling loops needed.
 */
export abstract class BaseComponent {
  readonly root: Locator;
  readonly page: Page;

  constructor(root: Locator) {
    this.root = root;
    this.page = root.page();
  }

  /**
   * Scoped locator within this component's root element.
   */
  locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  /**
   * Non-waiting boolean check of current visibility.
   */
  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  /**
   * Waits until this component's root element becomes visible.
   */
  async waitForVisible(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  /**
   * Waits until this component's root element is hidden or detached.
   */
  async waitForHidden(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }
}
