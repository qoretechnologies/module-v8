/**
 * Baserow API Client
 *
 * Extends QoreApiClient with Baserow-specific configuration:
 * - 'Token' prefix authentication (Authorization: Token {token})
 * - Auto-prepends '/api/' to all paths and ensures trailing slash
 * - Page-based pagination with count tracking
 * - Dynamic baseUrl per request (supports self-hosted instances)
 */

import { QoreApiClient, PaginatedRequestOptions, RequestOptions } from '../../global/helpers/QoreApiClient';
import { BASEROW_APP_NAME } from './constants';

export class BaserowApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: '', // Will be provided per-request via connectionOptions.url
      appName: BASEROW_APP_NAME,
    });
  }

  /**
   * Baserow uses custom baseUrl per request (supports self-hosted instances)
   */
  protected getBaseUrl(options: RequestOptions): string {
    return options?.connectionOptions?.url || options?.baseUrl || '';
  }

  /**
   * Baserow uses 'Token' prefix instead of 'Bearer'
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Auto-prepend /api/ to all paths and ensure trailing slash
   */
  protected formatPath(path: string): string {
    let clean = path.trim().replace(/^\/+/, '');

    if (!clean.endsWith('/')) {
      clean = `${clean}/`;
    }

    if (!clean.startsWith('api/')) {
      clean = `api/${clean}`;
    }

    return `/${clean}`;
  }

  /**
   * Baserow returns items in 'results' by default
   */
  protected getDefaultItemsPath(): string {
    return 'results';
  }

  /**
   * Baserow uses page-based pagination with 'count' field
   */
  protected hasMorePages(
    response: any,
    _params: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const count = response?.count || 0;
    const maxResults = options.maxResults || 500;
    return items.length < count && items.length < maxResults;
  }

  /**
   * Page-based pagination
   */
  protected getNextPageParams(
    _response: any,
    currentParams: Record<string, any>,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const page = (currentParams.page || 1) + 1;
    return { ...currentParams, page };
  }

  /**
   * Initial pagination params with page
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      page: 1,
      size: options.limit || 100,
      ...options.params,
    };
  }

  /**
   * Default page size for Baserow
   */
  protected getDefaultPageSize(): number {
    return 100;
  }
}

// Export singleton instance
export const baserowClient = new BaserowApiClient();
