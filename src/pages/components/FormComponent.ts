import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Reusable FormComponent for inputs, selects, checkboxes, and error state inspections.
 */
export class FormComponent extends BaseComponent {
  /**
   * Fills an input or textarea element by selector, name, or label.
   */
  async fillField(selectorOrName: string, value: string): Promise<void> {
    const field = this.resolveField(selectorOrName);
    await field.fill(value);
  }

  /**
   * Selects an option from a dropdown by value or label.
   */
  async selectOption(selectorOrName: string, valueOrLabel: string): Promise<void> {
    const select = this.resolveField(selectorOrName);
    await select.selectOption({ label: valueOrLabel }).catch(async () => {
      await select.selectOption({ value: valueOrLabel });
    });
  }

  /**
   * Checks a checkbox or radio button.
   */
  async checkField(selectorOrName: string): Promise<void> {
    const checkbox = this.resolveField(selectorOrName);
    await checkbox.check();
  }

  /**
   * Unchecks a checkbox.
   */
  async uncheckField(selectorOrName: string): Promise<void> {
    const checkbox = this.resolveField(selectorOrName);
    await checkbox.uncheck();
  }

  /**
   * Submits the form via standard submit button or custom selector.
   */
  async submit(submitSelector = 'button[type="submit"], input[type="submit"]'): Promise<void> {
    await this.root.locator(submitSelector).first().click();
  }

  /**
   * Gets field validation error message if visible.
   */
  async getFieldError(fieldNameOrSelector: string): Promise<string | null> {
    const errorLocator = this.root.locator(
      `[data-error-for="${fieldNameOrSelector}"], .error-message, .invalid-feedback`
    );
    if (await errorLocator.first().isVisible()) {
      return errorLocator.first().innerText();
    }
    return null;
  }

  /**
   * Internal resolver for standard inputs by id, name, or explicit selector.
   */
  private resolveField(selectorOrName: string): Locator {
    if (
      selectorOrName.startsWith('#') ||
      selectorOrName.startsWith('.') ||
      selectorOrName.startsWith('[')
    ) {
      return this.root.locator(selectorOrName);
    }
    return this.root.locator(
      `[name="${selectorOrName}"], [id="${selectorOrName}"], [data-testid="${selectorOrName}"]`
    );
  }
}
