import { z } from 'zod';

export const ENVIRONMENTS = ['dev', 'qa', 'stage', 'prod', 'local'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * envSchema defines and validates the expected shape of process.env.
 *
 * WHY:
 * 1. Guarantees that mandatory variables are present before any tests run.
 * 2. Automatically converts string environment variables to typed booleans and numbers.
 * 3. Acts as living, self-documenting code for all required framework variables.
 */
export const envSchema = z.object({
  // Target Application URLs
  APP_URL: z.url('APP_URL must be a valid HTTP/HTTPS URL'),
  API_URL: z.url('API_URL must be a valid HTTP/HTTPS URL'),

  // Environment & CI Controls
  NODE_ENV: z.enum(ENVIRONMENTS).default('qa'),
  CI: z.coerce.boolean().default(false),

  // Admin Credentials
  ADMIN_EMAIL: z.email('ADMIN_EMAIL must be a valid email address'),
  ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required and cannot be empty'),

  // Database Connection (PostgreSQL / Neon / RDS)
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default('aura_eyecare_db'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_SSL: z.coerce.boolean().default(false),

  // Test Execution & Timeouts
  TIMEOUT_TEST_MS: z.coerce.number().positive().default(30000),
  TIMEOUT_ACTION_MS: z.coerce.number().positive().default(15000),
  TIMEOUT_NAVIGATION_MS: z.coerce.number().positive().default(30000),
  WORKERS: z.coerce.number().int().positive().default(4),
  RETRIES: z.coerce.number().int().min(0).default(0),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});

export type ValidatedEnv = z.infer<typeof envSchema>;
