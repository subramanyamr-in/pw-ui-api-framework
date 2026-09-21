import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

/**
 * Reusable TableComponent for standard HTML data tables or CSS grid tabular views.
 * Kept lean and decoupled from test runner micro-steps.
 */
export class TableComponent extends BaseComponent {
  /**
   * Returns text array of all header column names.
   */
  async getHeaderNames(): Promise<string[]> {
    const headers = this.root.locator('thead th, [role="columnheader"]');
    return headers.allInnerTexts();
  }

  /**
   * Returns total visible row count in tbody.
   */
  async getRowCount(): Promise<number> {
    const rows = this.root.locator('tbody tr, [role="row"]');
    return rows.count();
  }

  /**
   * Locates a row containing matching text.
   */
  getRowByText(text: string): Locator {
    return this.root.locator('tbody tr, [role="row"]').filter({ hasText: text });
  }

  /**
   * Retrieves text from a specific cell by row (0-indexed) and column (0-indexed).
   */
  async getCellText(rowIndex: number, columnIndex: number): Promise<string> {
    const row = this.root.locator('tbody tr, [role="row"]').nth(rowIndex);
    const cell = row.locator('td, [role="cell"]').nth(columnIndex);
    return cell.innerText();
  }

  /**
   * Clicks an action button/link inside a specific row identified by row text.
   */
  async clickActionInRow(rowText: string, actionSelector: string): Promise<void> {
    const row = this.getRowByText(rowText);
    await row.locator(actionSelector).click();
  }
}
