import { type ZodType, ZodError } from 'zod';

/**
 * SchemaValidator provides runtime validation against Zod schemas.
 *
 * WHY:
 * Backend APIs evolve, and breaking schema contract changes (missing fields, changed types)
 * are a primary source of regressions. SchemaValidator catches these immediately with detailed diffs.
 */
export class SchemaValidator {
  /**
   * Validates data against a given Zod schema.
   * Throws a descriptive formatted error if validation fails.
   */
  static validate<T>(schema: ZodType<T>, data: unknown, contextName = 'API Response'): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      const formattedErrors = this.formatZodError(result.error);
      throw new Error(
        `[SchemaValidator] Contract violation in ${contextName}:\n${formattedErrors}`
      );
    }

    return result.data;
  }

  /**
   * Non-throwing validation check.
   * Returns true if data satisfies the schema, false otherwise.
   */
  static isValid<T>(schema: ZodType<T>, data: unknown): boolean {
    return schema.safeParse(data).success;
  }

  /**
   * Formats Zod errors into an actionable, readable list.
   */
  private static formatZodError(error: ZodError): string {
    return error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `   👉 [${path}]: ${issue.message} (code: ${issue.code})`;
      })
      .join('\n');
  }
}
