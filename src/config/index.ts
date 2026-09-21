import dotenv from 'dotenv';
import path from 'path';
import { envSchema, type ValidatedEnv } from './env.schema';

// 1. Load active .env from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. Validate environment with friendly formatting
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n🚨 [CONFIG ERROR] Invalid or missing environment configuration:\n');
  for (const issue of parsed.error.issues) {
    console.error(`   👉 ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('\n💡 Tip: Check your .env file against .env.example\n');
  process.exit(1);
}

const env: ValidatedEnv = parsed.data;

/**
 * Immutable, domain-grouped configuration for the entire test framework.
 *
 * HOW TO USE:
 * import { config } from '@config';
 *
 * console.log(config.app.baseUrl);
 * console.log(config.auth.admin.email);
 * console.log(config.timeouts.action);
 */
export const config = Object.freeze({
  app: {
    baseUrl: env.APP_URL,
    apiUrl: env.API_URL,
    env: env.NODE_ENV,
    isCI: env.CI,
  },
  auth: {
    admin: {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    },
  },
  db: {
    connectionString: env.DATABASE_URL,
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL,
  },
  timeouts: {
    test: env.TIMEOUT_TEST_MS,
    action: env.TIMEOUT_ACTION_MS,
    navigation: env.TIMEOUT_NAVIGATION_MS,
  },
  runner: {
    workers: env.CI ? 2 : env.WORKERS,
    retries: env.CI ? 2 : env.RETRIES,
    logLevel: env.LOG_LEVEL,
  },
});

export type AppConfig = typeof config;
export type { Environment, LogLevel } from './env.schema';
export { ENVIRONMENTS, LOG_LEVELS } from './env.schema';
