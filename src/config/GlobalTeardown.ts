/**
 * GlobalTeardown runs ONCE after all tests complete.
 *
 * WHY:
 * Central place to close long-running connections (e.g., database connection pools)
 * and print clean finalization metrics.
 */
import { DbClient } from '@database';
import { logger } from '@utils';

export default async function globalTeardown(): Promise<void> {
  logger.info('🏁 [SUITE END] All test runs finished. Cleaning up global resources...');
  await DbClient.close();
}
