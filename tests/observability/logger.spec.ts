import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { logger } from '@utils';

test.describe('Observability & Logger Verification @smoke', () => {
  test('Logger prints and writes to execution.log @smoke', async () => {
    const testMessage = `Verification log entry - ${Date.now()}`;
    logger.info(testMessage);

    const logPath = path.resolve(process.cwd(), 'reports', 'logs', 'execution.log');
    expect(fs.existsSync(logPath)).toBe(true);

    // Give asynchronous stream buffer a micro-turn to flush
    await expect.poll(() => fs.readFileSync(logPath, 'utf-8')).toContain(testMessage);
  });

  test('Logger supports multiple log levels cleanly @regression', async () => {
    const uniqueId = `level-test-${Date.now()}`;
    logger.info(`Info message ${uniqueId}`);
    logger.warn(`Warning message ${uniqueId}`);
    logger.error(`Error message ${uniqueId}`);

    const logPath = path.resolve(process.cwd(), 'reports', 'logs', 'execution.log');
    await expect
      .poll(() => fs.readFileSync(logPath, 'utf-8'))
      .toContain(`Warning message ${uniqueId}`);

    const logContent = fs.readFileSync(logPath, 'utf-8');
    expect(logContent).toContain(`Info message ${uniqueId}`);
    expect(logContent).toContain(`Error message ${uniqueId}`);
  });

  test('SummaryReporter produces reports/summary.json @smoke', async () => {
    const summaryPath = path.resolve(process.cwd(), 'reports', 'summary.json');
    expect(fs.existsSync(summaryPath)).toBe(true);

    const summaryContent = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    expect(typeof summaryContent.totalTests).toBe('number');
    expect(summaryContent.totalTests).toBeGreaterThan(0);
  });
});
