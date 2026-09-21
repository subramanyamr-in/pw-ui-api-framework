import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { config } from '@config';

const logDir = path.resolve(process.cwd(), 'reports', 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom console log formatter: [2026-09-21 13:30:00] [INFO] [Worker #] message
 */
const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const workerId = process.env.TEST_WORKER_INDEX
    ? `[Worker #${process.env.TEST_WORKER_INDEX}]`
    : '';
  const logMsg = stack || message;
  return `[${ts}] [${level}] ${workerId} ${logMsg}`;
});

/**
 * Custom file log formatter (no ANSI color codes)
 */
const fileFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const workerId = process.env.TEST_WORKER_INDEX
    ? `[Worker #${process.env.TEST_WORKER_INDEX}]`
    : '';
  const logMsg = stack || message;
  return `[${ts}] [${level.toUpperCase()}] ${workerId} ${logMsg}`;
});

/**
 * Global Winston Logger Utility.
 *
 * HOW TO USE:
 * import { logger } from '@utils';
 *
 * logger.info('Navigating to dashboard');
 * logger.error('Failed to submit form', error);
 */
export const logger = winston.createLogger({
  level: config.runner.logLevel,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    // 1. Console Transport with vibrant colors
    new winston.transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
    }),
    // 2. Persistent File Transport
    new winston.transports.File({
      filename: path.join(logDir, 'execution.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB rotation
      maxFiles: 3,
    }),
  ],
});
