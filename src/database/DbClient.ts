import pg from 'pg';
import { config } from '@config';

const { Pool } = pg;

export type QueryParams = unknown[];

/**
 * Enterprise PostgreSQL Client wrapping `pg.Pool`.
 *
 * FEATURES:
 * 1. Dual Connection Mode: Supports `DATABASE_URL` (ideal for Neon / Supabase / Heroku)
 *    or discrete host/port/database parameters.
 * 2. Parameterized Queries: Built-in SQL injection prevention.
 * 3. Connection Pooling: Manages connections efficiently across test steps.
 * 4. Atomic Transactions: Self-rolling back on failure, committing on success.
 * 5. Health Checks: Non-throwing connectivity verification.
 * 6. Graceful Teardown: Cleanly terminates pool sockets on suite completion.
 */
export class DbClient {
  private static pool: pg.Pool | null = null;

  /**
   * Returns the active singleton `pg.Pool` instance.
   * Lazily initialized on first access.
   */
  static getPool(): pg.Pool {
    if (!this.pool) {
      this.pool = this.createPool();
    }
    return this.pool;
  }

  /**
   * Instantiates a new Pool using configuration from `@config`.
   */
  private static createPool(): pg.Pool {
    const dbConfig = config.db;

    // 1. Connection String mode (e.g. Neon, Supabase, Cloud PostgreSQL)
    if (dbConfig.connectionString && dbConfig.connectionString.trim().length > 0) {
      const isNeonOrCloud =
        dbConfig.connectionString.includes('neon.tech') ||
        dbConfig.connectionString.includes('sslmode=require') ||
        dbConfig.ssl;

      return new Pool({
        connectionString: dbConfig.connectionString,
        ssl: isNeonOrCloud ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
    }

    // 2. Discrete parameters mode (Local Docker, AWS RDS, internal server)
    return new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  /**
   * Executes a parameterized query and returns typed rows.
   *
   * @example
   * const users = await DbClient.query<User>('SELECT * FROM users WHERE status = $1', ['active']);
   */
  static async query<T = Record<string, unknown>>(
    sql: string,
    params: QueryParams = []
  ): Promise<T[]> {
    const pool = this.getPool();
    const result = await pool.query<pg.QueryResultRow>(sql, params);
    return result.rows as T[];
  }

  /**
   * Executes a parameterized query expecting at most one row.
   *
   * @example
   * const user = await DbClient.queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
   */
  static async queryOne<T = Record<string, unknown>>(
    sql: string,
    params: QueryParams = []
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /**
   * Executes an INSERT, UPDATE, or DELETE query and returns the number of affected rows.
   *
   * @example
   * const deleted = await DbClient.execute('DELETE FROM users WHERE email = $1', [email]);
   */
  static async execute(sql: string, params: QueryParams = []): Promise<number> {
    const pool = this.getPool();
    const result = await pool.query(sql, params);
    return result.rowCount ?? 0;
  }

  /**
   * Executes multiple operations inside an atomic transaction.
   * Automatically commits on success and rolls back on failure.
   */
  static async transaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Non-throwing health check to verify database connectivity.
   * Returns true if database is reachable, false otherwise.
   */
  static async isHealthy(): Promise<boolean> {
    try {
      const rows = await this.query<{ health: number }>('SELECT 1 as health');
      return rows.length > 0 && rows[0]?.health === 1;
    } catch {
      return false;
    }
  }

  /**
   * Gracefully terminates all pool connections.
   * Called during GlobalTeardown to prevent hanging Node.js processes.
   */
  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
