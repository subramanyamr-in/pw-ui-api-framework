import type { Page } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Reusable NotificationComponent for alerts, toasts, and snackbars.
 */
export class NotificationComponent extends BaseComponent {
  /**
   * Waits for notification message to appear.
   */
  async waitForNotification(): Promise<void> {
    await this.waitForVisible();
  }

  /**
   * Retrieves message content of toast/alert.
   */
  async getMessage(): Promise<string> {
    const textLocator = this.root.locator('.toast-message, .alert-text, [role="status"], p');
    if (await textLocator.first().isVisible()) {
      return textLocator.first().innerText();
    }
    return this.root.innerText();
  }

  /**
   * Dismisses notification if close button is present.
   */
  async dismiss(closeButtonSelector = 'button[aria-label="Close"], .toast-close'): Promise<void> {
    const closeBtn = this.root.locator(closeButtonSelector);
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  /**
   * Checks if notification has a specific type/severity class.
   */
  async getType(): Promise<'success' | 'error' | 'warning' | 'info' | 'unknown'> {
    const classAttr = (await this.root.getAttribute('class')) || '';
    if (classAttr.includes('success')) return 'success';
    if (classAttr.includes('error') || classAttr.includes('danger')) return 'error';
    if (classAttr.includes('warning')) return 'warning';
    if (classAttr.includes('info')) return 'info';
    return 'unknown';
  }

  /**
   * Static helper to find any active notification anywhere on the page.
   */
  static fromPage(
    page: Page,
    selector = '[role="alert"], .toast, .notification'
  ): NotificationComponent {
    return new NotificationComponent(page.locator(selector).first());
  }
}
