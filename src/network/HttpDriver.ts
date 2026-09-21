import { test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { config } from '@config';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/**
 * HttpDriver wraps Playwright's native APIRequestContext.
 *
 * WHY:
 * 1. Automatically shares network state, cookies, and context with the browser.
 * 2. Every HTTP request automatically appears in Playwright Traces and HTML reports.
 * 3. Zero external HTTP client library dependencies (No Axios / Fetch wrappers).
 * 4. Automatically wraps calls in native test.step() for clean, collapsible reports.
 */
export class HttpDriver {
  constructor(private readonly context: APIRequestContext) {}

  /**
   * Performs an HTTP GET request and returns typed JSON.
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.resolveUrl(endpoint);
    return test.step(`HTTP GET ${endpoint}`, async () => {
      const response = await this.context.get(url, {
        headers: this.buildHeaders(options?.headers),
        params: options?.params,
        timeout: options?.timeout ?? config.timeouts.action,
      });
      return this.handleResponse<T>(response, 'GET', endpoint);
    });
  }

  /**
   * Performs an HTTP POST request and returns typed JSON.
   */
  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.resolveUrl(endpoint);
    return test.step(`HTTP POST ${endpoint}`, async () => {
      const response = await this.context.post(url, {
        data: body,
        headers: this.buildHeaders(options?.headers),
        params: options?.params,
        timeout: options?.timeout ?? config.timeouts.action,
      });
      return this.handleResponse<T>(response, 'POST', endpoint);
    });
  }

  /**
   * Performs an HTTP PUT request and returns typed JSON.
   */
  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.resolveUrl(endpoint);
    return test.step(`HTTP PUT ${endpoint}`, async () => {
      const response = await this.context.put(url, {
        data: body,
        headers: this.buildHeaders(options?.headers),
        params: options?.params,
        timeout: options?.timeout ?? config.timeouts.action,
      });
      return this.handleResponse<T>(response, 'PUT', endpoint);
    });
  }

  /**
   * Performs an HTTP PATCH request and returns typed JSON.
   */
  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = this.resolveUrl(endpoint);
    return test.step(`HTTP PATCH ${endpoint}`, async () => {
      const response = await this.context.patch(url, {
        data: body,
        headers: this.buildHeaders(options?.headers),
        params: options?.params,
        timeout: options?.timeout ?? config.timeouts.action,
      });
      return this.handleResponse<T>(response, 'PATCH', endpoint);
    });
  }

  /**
   * Performs an HTTP DELETE request and returns typed JSON.
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = this.resolveUrl(endpoint);
    return test.step(`HTTP DELETE ${endpoint}`, async () => {
      const response = await this.context.delete(url, {
        headers: this.buildHeaders(options?.headers),
        params: options?.params,
        timeout: options?.timeout ?? config.timeouts.action,
      });
      return this.handleResponse<T>(response, 'DELETE', endpoint);
    });
  }

  /**
   * Raw request methods for contract/negative tests that assert on status codes and headers directly.
   */
  async getRaw(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    const url = this.resolveUrl(endpoint);
    return this.context.get(url, {
      headers: this.buildHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout ?? config.timeouts.action,
    });
  }

  async postRaw(endpoint: string, body?: unknown, options?: RequestOptions): Promise<APIResponse> {
    const url = this.resolveUrl(endpoint);
    return this.context.post(url, {
      data: body,
      headers: this.buildHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout ?? config.timeouts.action,
    });
  }

  async putRaw(endpoint: string, body?: unknown, options?: RequestOptions): Promise<APIResponse> {
    const url = this.resolveUrl(endpoint);
    return this.context.put(url, {
      data: body,
      headers: this.buildHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout ?? config.timeouts.action,
    });
  }

  async deleteRaw(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    const url = this.resolveUrl(endpoint);
    return this.context.delete(url, {
      headers: this.buildHeaders(options?.headers),
      params: options?.params,
      timeout: options?.timeout ?? config.timeouts.action,
    });
  }

  /**
   * Resolves a path relative to config.app.apiUrl unless it is already an absolute URL.
   */
  private resolveUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const base = config.app.apiUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanEndpoint}`;
  }

  /**
   * Injects default application headers (JSON content type and accept headers).
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...customHeaders,
    };
  }

  /**
   * Parses and validates the HTTP response.
   * Throws a descriptive error if the response status is not 2xx.
   */
  private async handleResponse<T>(
    response: APIResponse,
    method: string,
    endpoint: string
  ): Promise<T> {
    const status = response.status();

    if (!response.ok()) {
      const errorText = await response.text().catch(() => '<unable to read body>');
      throw new Error(
        `[HttpDriver] ${method} ${endpoint} failed with HTTP ${status} (${response.statusText()}):\n${errorText}`
      );
    }

    // Safely handle 204 No Content
    if (status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }
}
