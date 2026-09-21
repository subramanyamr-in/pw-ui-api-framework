import { logger } from '@utils';

export type FailureCategory =
  | 'LOCATOR_TIMEOUT'
  | 'API_SERVER_ERROR'
  | 'DATABASE_ERROR'
  | 'SCHEMA_MISMATCH'
  | 'NETWORK_UNREACHABLE'
  | 'ASSERTION_FAILURE'
  | 'UNKNOWN';

/**
 * FailureAnalyzer inspects test errors and stack traces to automatically
 * categorize failure root causes during CI execution and local runs.
 *
 * WHY:
 * Saves triage time by distinguishing between application defects, infrastructure drops,
 * flaky locator timeouts, and database connection failures.
 */
export class FailureAnalyzer {
  /**
   * Inspects error message and stack trace to categorize failure root cause.
   */
  static categorize(error: Error | string): FailureCategory {
    const message = typeof error === 'string' ? error : `${error.message}\n${error.stack ?? ''}`;

    if (
      /waiting for locator|element is not visible|action timed out|Timeout .* exceeded/i.test(
        message
      )
    ) {
      return 'LOCATOR_TIMEOUT';
    }
    if (/status 500|status 502|status 503|internal server error/i.test(message)) {
      return 'API_SERVER_ERROR';
    }
    if (
      /relation .* does not exist|syntax error at or near|database query failed|connection to server at .* failed/i.test(
        message
      )
    ) {
      return 'DATABASE_ERROR';
    }
    if (/ZodError|invalid_type|unrecognized_keys|Contract violation/i.test(message)) {
      return 'SCHEMA_MISMATCH';
    }
    if (/ECONNREFUSED|ENOTFOUND|net::ERR_|getaddrinfo/i.test(message)) {
      return 'NETWORK_UNREACHABLE';
    }
    if (/expect\(|toBe|toEqual|toContainText/i.test(message)) {
      return 'ASSERTION_FAILURE';
    }

    return 'UNKNOWN';
  }

  /**
   * Logs a standardized triage summary for a failed test.
   */
  static logTriage(testTitle: string, error: Error | string): FailureCategory {
    const category = this.categorize(error);
    logger.error(`🔍 Failure Triage for "${testTitle}": Category = [${category}]`);
    return category;
  }
}
