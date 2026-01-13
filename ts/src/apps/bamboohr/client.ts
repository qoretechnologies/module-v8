/**
 * BambooHR API Client
 *
 * Extends QoreApiClient with BambooHR-specific configuration:
 * - Basic Auth (API key as username, 'x' as password)
 * - Dynamic path formatting with company domain: /{companyDomain}/v1/{path}
 * - Accept header set to application/json
 *
 * @see https://documentation.bamboohr.com/reference
 */

import { QoreApiClient, BaseRequestOptions } from '../../global/helpers/QoreApiClient';
import { BAMBOOHR_APP_NAME, BAMBOOHR_BASE_URL } from './constants';
import { IBambooHRConnectionOptions } from './types';

export class BambooHRApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: BAMBOOHR_BASE_URL,
      appName: BAMBOOHR_APP_NAME,
    });
  }

  /**
   * BambooHR uses Basic Auth with API key as username and 'x' as password.
   * Also sets Accept header to application/json.
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Token is the API key - use Basic Auth
    if (token) {
      const credentials = Buffer.from(`${token}:x`).toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Override get to include company domain in path.
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return super.get<ResponseType>(this.formatPathWithOptions(path, options), options);
  }

  /**
   * Override post to include company domain in path.
   */
  async post<ResponseType = unknown>(
    path: string,
    body?: unknown,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return super.post<ResponseType>(this.formatPathWithOptions(path, options), body, options);
  }

  /**
   * Helper to format path with company domain.
   * Transforms path to include: /{companyDomain}/v1/{path}
   */
  private formatPathWithOptions(path: string, options?: BaseRequestOptions): string {
    const clean = path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
    const companyDomain = options?.connectionOptions?.company_domain;

    if (!companyDomain) {
      return clean;
    }

    // Return the full path including company domain - base class will prepend baseUrl
    return `${companyDomain}/v1/${clean}`;
  }

  /**
   * BambooHR returns items in 'employees' for most list endpoints.
   */
  protected getDefaultItemsPath(): string {
    return 'employees';
  }
}

// Export singleton instance
export const bambooHRClient = new BambooHRApiClient();

/**
 * Helper type for extracting connection options from context.
 */
export type TBambooHRClientOptions = {
  token: string;
  connectionOptions: IBambooHRConnectionOptions;
};
