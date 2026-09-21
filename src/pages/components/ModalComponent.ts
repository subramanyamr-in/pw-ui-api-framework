import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Reusable ModalComponent for dialogs, alerts, and overlay modals.
 */
export class ModalComponent extends BaseComponent {
  /**
   * Waits for modal dialog to become visible using Playwright auto-wait.
   */
  async waitForOpen(): Promise<void> {
    await this.waitForVisible();
  }

  /**
   * Waits for modal dialog to close / detach from DOM.
   */
  async waitForClose(): Promise<void> {
    await this.waitForHidden();
  }

  /**
   * Retrieves modal title / header text.
   */
  async getTitle(): Promise<string> {
    const titleLocator = this.root.locator(
      'h1, h2, h3, [role="heading"], .modal-title, [data-testid="modal-title"]'
    );
    return titleLocator.first().innerText();
  }

  /**
   * Clicks confirmation or primary action button inside modal.
   */
  async confirm(
    buttonSelector = 'button[type="submit"], .btn-primary, [data-testid="modal-confirm"]'
  ): Promise<void> {
    await this.root.locator(buttonSelector).first().click();
  }

  /**
   * Clicks cancel or close button inside modal.
   */
  async cancel(
    buttonSelector = 'button[aria-label="Close"], .btn-secondary, [data-testid="modal-cancel"]'
  ): Promise<void> {
    await this.root.locator(buttonSelector).first().click();
  }

  /**
   * Locates content area inside modal.
   */
  getContent(): Locator {
    return this.root.locator('.modal-body, [role="document"], p');
  }
}
