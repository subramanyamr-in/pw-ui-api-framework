import fs from 'fs';
import path from 'path';
import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import { logger } from '@utils';
import { FailureAnalyzer } from './FailureAnalyzer';

export interface TestSummaryRecord {
  title: string;
  project: string;
  status: TestResult['status'];
  durationMs: number;
  retry: number;
  error?: string;
}

export interface SuiteSummary {
  startTime: string;
  endTime: string;
  totalDurationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  timedOut: number;
  skipped: number;
  interrupted: number;
  tests: TestSummaryRecord[];
}

/**
 * Custom Playwright Reporter that outputs machine-readable summary metrics.
 *
 * PRODUCES:
 * 1. reports/summary.json: Clean JSON payload for CI artifacts, Slack notifications, or dashboards.
 * 2. Structured logging of suite execution metrics via Winston logger.
 */
export default class SummaryReporter implements Reporter {
  private startTime = 0;
  private results: TestSummaryRecord[] = [];
  private readonly reportsDir = path.resolve(process.cwd(), 'reports');

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    logger.info(
      `🎭 [REPORTER] Test run initiated with ${suite.allTests().length} total test instances.`
    );
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const record: TestSummaryRecord = {
      title: test.title,
      project: test.parent.project()?.name ?? 'default',
      status: result.status,
      durationMs: result.duration,
      retry: result.retry,
      error: result.error?.message,
    };

    this.results.push(record);

    if (result.status === 'failed' || result.status === 'timedOut') {
      logger.error(`❌ [TEST FAILED] ${record.project} › ${record.title} (${record.durationMs}ms)`);
      if (result.error?.message || result.error?.stack) {
        FailureAnalyzer.logTriage(
          record.title,
          result.error.stack ?? result.error.message ?? 'Unknown error'
        );
      }
    }
  }

  async onEnd(_result: FullResult): Promise<void> {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const summary: SuiteSummary = {
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      totalDurationMs: duration,
      totalTests: this.results.length,
      passed: this.results.filter((r) => r.status === 'passed').length,
      failed: this.results.filter((r) => r.status === 'failed').length,
      timedOut: this.results.filter((r) => r.status === 'timedOut').length,
      skipped: this.results.filter((r) => r.status === 'skipped').length,
      interrupted: this.results.filter((r) => r.status === 'interrupted').length,
      tests: this.results,
    };

    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    const summaryPath = path.join(this.reportsDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    logger.info(
      `🏁 [REPORTER] Suite completed in ${(duration / 1000).toFixed(2)}s. ` +
        `Passed: ${summary.passed}, Failed: ${summary.failed}, Skipped: ${summary.skipped}. ` +
        `Summary saved to ${summaryPath}`
    );
  }
}
