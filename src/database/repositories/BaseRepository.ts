import { DbClient, type QueryParams } from '@database';

/**
 * BaseRepository encapsulates common SQL operations and pattern standards.
 * All domain repositories extend BaseRepository.
 */
export abstract class BaseRepository {
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Returns total count of rows in this table.
   */
  async count(): Promise<number> {
    const rows = await DbClient.query<{ count: string | number }>(
      `SELECT COUNT(*)::int as count FROM ${this.tableName}`
    );
    const countValue = rows[0]?.count ?? 0;
    return typeof countValue === 'number' ? countValue : parseInt(countValue, 10);
  }

  /**
   * Deletes record(s) matching an identifier column.
   */
  async deleteBy(column: string, value: unknown): Promise<number> {
    return DbClient.execute(`DELETE FROM ${this.tableName} WHERE ${column} = $1`, [value]);
  }

  /**
   * Finds records matching a column value.
   */
  async findBy<T = Record<string, unknown>>(column: string, value: unknown): Promise<T[]> {
    return DbClient.query<T>(`SELECT * FROM ${this.tableName} WHERE ${column} = $1`, [value]);
  }

  /**
   * Finds a single record matching a column value.
   */
  async findOneBy<T = Record<string, unknown>>(column: string, value: unknown): Promise<T | null> {
    return DbClient.queryOne<T>(`SELECT * FROM ${this.tableName} WHERE ${column} = $1 LIMIT 1`, [
      value,
    ]);
  }

  /**
   * Executes custom query via DbClient.
   */
  protected async query<T>(sql: string, params: QueryParams = []): Promise<T[]> {
    return DbClient.query<T>(sql, params);
  }

  /**
   * Executes custom single-row query via DbClient.
   */
  protected async queryOne<T>(sql: string, params: QueryParams = []): Promise<T | null> {
    return DbClient.queryOne<T>(sql, params);
  }

  /**
   * Executes custom mutation via DbClient.
   */
  protected async execute(sql: string, params: QueryParams = []): Promise<number> {
    return DbClient.execute(sql, params);
  }
}
