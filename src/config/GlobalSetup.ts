import fs from 'fs';
import path from 'path';
import { config } from './index';
import { logger } from '@utils';

/**
 * GlobalSetup runs ONCE before the entire test suite begins.
 *
 * WHY:
 * 1. Ensures required runtime directories (.auth, reports) exist.
 * 2. Emits a pre-flight summary so you know exactly which environment you're hitting.
 */
export default async function globalSetup(): Promise<void> {
  const dirsToEnsure = [
    path.resolve(process.cwd(), '.auth'),
    path.resolve(process.cwd(), 'reports'),
    path.resolve(process.cwd(), 'reports/html'),
    path.resolve(process.cwd(), 'reports/logs'),
    path.resolve(process.cwd(), 'reports/allure-results'),
    path.resolve(process.cwd(), 'reports/test-artifacts'),
    path.resolve(process.cwd(), 'reports/blob-report'),
  ];

  for (const dir of dirsToEnsure) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  logger.info('🚀 [SUITE START] Test run initializing...');
  logger.info(`   • Target URL : ${config.app.baseUrl}`);
  logger.info(`   • API URL    : ${config.app.apiUrl}`);
  logger.info(`   • Environment: ${config.app.env}`);
  logger.info(`   • Workers    : ${config.runner.workers}`);
  logger.info(`   • CI Mode    : ${config.app.isCI}`);
}
