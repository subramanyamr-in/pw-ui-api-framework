import type { ZodType } from 'zod';
import type { HttpDriver, RequestOptions } from '@network';
import { SchemaValidator } from '@schemas';
import { logger } from '@utils';

/**
 * Abstract BaseService providing standard HTTP operations with optional runtime schema validation.
 * All domain API services extend BaseService.
 *
 * DESIGN HIGHLIGHTS:
 * 1. Wraps HttpDriver.
 * 2. Accepts an optional ZodType<T> parameter to automatically validate contracts upon receiving responses.
 * 3. Keeps methods lean and decoupled.
 */
export abstract class BaseService {
  protected readonly http: HttpDriver;
  protected readonly basePath: string;

  constructor(http: HttpDriver, basePath = '') {
    this.http = http;
    this.basePath = basePath;
  }

  /**
   * Executes a GET request with optional schema contract validation.
   */
  async get<T>(endpoint = '', options?: RequestOptions, schema?: ZodType<T>): Promise<T> {
    const url = this.buildUrl(endpoint);
    logger.debug(`[Service] GET ${url}`);
    const data = await this.http.get<T>(url, options);
    if (schema) {
      return SchemaValidator.validate(schema, data, `GET ${url}`);
    }
    return data;
  }

  /**
   * Executes a POST request with optional schema contract validation.
   */
  async post<T>(
    endpoint = '',
    body?: unknown,
    options?: RequestOptions,
    schema?: ZodType<T>
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    logger.debug(`[Service] POST ${url}`);
    const data = await this.http.post<T>(url, body, options);
    if (schema) {
      return SchemaValidator.validate(schema, data, `POST ${url}`);
    }
    return data;
  }

  /**
   * Executes a PUT request with optional schema contract validation.
   */
  async put<T>(
    endpoint = '',
    body?: unknown,
    options?: RequestOptions,
    schema?: ZodType<T>
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const data = await this.http.put<T>(url, body, options);
    if (schema) {
      return SchemaValidator.validate(schema, data, `PUT ${url}`);
    }
    return data;
  }

  /**
   * Executes a PATCH request with optional schema contract validation.
   */
  async patch<T>(
    endpoint = '',
    body?: unknown,
    options?: RequestOptions,
    schema?: ZodType<T>
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const data = await this.http.patch<T>(url, body, options);
    if (schema) {
      return SchemaValidator.validate(schema, data, `PATCH ${url}`);
    }
    return data;
  }

  /**
   * Executes a DELETE request with optional schema contract validation.
   */
  async delete<T>(endpoint = '', options?: RequestOptions, schema?: ZodType<T>): Promise<T> {
    const url = this.buildUrl(endpoint);
    const data = await this.http.delete<T>(url, options);
    if (schema) {
      return SchemaValidator.validate(schema, data, `DELETE ${url}`);
    }
    return data;
  }

  /**
   * Combines basePath with specific endpoint.
   */
  protected buildUrl(endpoint: string): string {
    if (!this.basePath) return endpoint;
    const cleanBase = this.basePath.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    return cleanEndpoint ? `${cleanBase}/${cleanEndpoint}` : cleanBase;
  }
}
