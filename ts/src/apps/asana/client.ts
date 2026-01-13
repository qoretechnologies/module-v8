/**
 * Asana API Client
 *
 * Extends QoreApiClient with Asana-specific configuration:
 * - Bearer token authentication
 * - Auto-prepends '/api/1.0/' to all paths
 * - Cursor-based pagination with offset
 * - Response data extraction from 'data' field
 */

import { QoreApiClient, PaginatedRequestOptions } from '../../global/helpers/QoreApiClient';

export class AsanaApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://app.asana.com',
      appName: 'asana',
    });
  }

  /**
   * Auto-prepend /api/1.0/ to all paths
   */
  protected formatPath(path: string): string {
    const clean = path.trim().replace(/^\/+/, '');
    return `/api/1.0/${clean}`;
  }

  /**
   * Asana uses Bearer token authentication
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Items are nested in 'data' field
   */
  protected getDefaultItemsPath(): string {
    return 'data';
  }

  /**
   * Asana uses cursor-based pagination with offset
   */
  protected hasMorePages(
    response: any,
    _params: any,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const maxResults = options.maxResults || 500;
    return !!response?.next_page?.offset && items.length < maxResults;
  }

  /**
   * Get next page using offset from response
   */
  protected getNextPageParams(
    response: any,
    params: any,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const offset = response?.next_page?.offset;
    return offset ? { ...params, offset } : null;
  }

  /**
   * Initial pagination params
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      limit: options.limit || 100,
      ...options.params,
    };
  }
}

// Export singleton instance
export const asanaClient = new AsanaApiClient();
