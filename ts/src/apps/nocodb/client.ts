/**
 * NocoDB API Client
 *
 * Extends QoreApiClient with NocoDB-specific configuration:
 * - 'xc-token' header authentication
 * - Auto-prepends '/api/v3/' to all paths (data/ for records, meta/ for metadata)
 * - Offset-based pagination with limit and offset
 * - Dynamic baseUrl per request (supports self-hosted instances)
 */

import { QoreApiClient, PaginatedRequestOptions, RequestOptions } from '../../global/helpers/QoreApiClient';
import { NOCODB_APP_NAME } from './constants';

export class NocoDBApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: '', // Will be provided per-request via connectionOptions.url
      appName: NOCODB_APP_NAME,
    });
  }

  /**
   * NocoDB uses custom baseUrl per request (supports self-hosted instances)
   */
  protected getBaseUrl(options: RequestOptions): string {
    return options?.connectionOptions?.url || options?.baseUrl || '';
  }

  /**
   * NocoDB uses 'xc-token' header instead of 'Authorization: Bearer'
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (token) {
      headers['xc-token'] = token;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Auto-prepend /api/v3/ to all paths
   * Routes data operations to /api/v3/data/ and meta operations to /api/v3/meta/
   */
  protected formatPath(path: string): string {
    let clean = path.trim().replace(/^\/+/, '');

    // Already has full api path
    if (clean.startsWith('api/')) {
      return `/${clean}`;
    }

    // Route to appropriate v3 endpoint
    if (clean.startsWith('data/') || clean.startsWith('meta/')) {
      clean = `api/v3/${clean}`;
    } else {
      // Default to data endpoint for backwards compatibility
      clean = `api/v3/data/${clean}`;
    }

    return `/${clean}`;
  }

  /**
   * NocoDB returns items in 'records' for v3 API
   */
  protected getDefaultItemsPath(): string {
    return 'records';
  }

  /**
   * NocoDB uses offset-based pagination
   */
  protected hasMorePages(
    response: any,
    _params: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const pageInfo = response?.pageInfo;
    const maxResults = options.maxResults || 1000;

    if (!pageInfo) {
      return false;
    }

    // Check if there are more pages
    const hasMore = pageInfo.isLastPage === false || pageInfo.totalRows > items.length;
    return hasMore && items.length < maxResults;
  }

  /**
   * Offset-based pagination
   */
  protected getNextPageParams(
    _response: any,
    currentParams: Record<string, any>,
    options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const limit = options.limit || 100;
    const currentOffset = parseInt(currentParams.offset || '0', 10);
    const nextOffset = currentOffset + limit;

    return { ...currentParams, offset: String(nextOffset) };
  }

  /**
   * Initial pagination params with offset
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      offset: '0',
      limit: String(options.limit || 100),
      ...options.params,
    };
  }

  /**
   * Default page size for NocoDB
   */
  protected getDefaultPageSize(): number {
    return 100;
  }
}

// Export singleton instance
export const nocodbClient = new NocoDBApiClient();

/**
 * v3 API Response Types
 */
export type NocoDBV3Record = {
  id: string;
  fields: Record<string, unknown>;
};

export type NocoDBV3Response = {
  records: NocoDBV3Record[];
  pageInfo?: {
    isLastPage?: boolean;
    totalRows?: number;
  };
};

/**
 * Transform flat records to v3 request format
 * v3 expects: [{ fields: { col: val, ... } }]
 */
export const toV3Request = (records: Record<string, unknown>[]): Array<{ fields: Record<string, unknown> }> =>
  records.map((r) => ({ fields: r }));

/**
 * Transform v3 response to flat record format
 * v3 returns: { records: [{ id, fields }] }
 */
export const fromV3Response = (records: NocoDBV3Record[]): Array<Record<string, unknown>> =>
  records.map((r) => ({ id: r.id, ...r.fields }));

/**
 * Transform for update requests (includes id in each record)
 * v3 expects: [{ id: recordId, fields: { col: val, ... } }]
 */
export const toV3UpdateRequest = (
  records: Array<{ id: string; data: Record<string, unknown> }>
): Array<{ id: string; fields: Record<string, unknown> }> =>
  records.map((r) => ({ id: r.id, fields: r.data }));

/**
 * Transform for delete requests
 * v3 expects: [{ id: recordId }, ...]
 */
export const toV3DeleteRequest = (ids: string[]): Array<{ id: string }> => ids.map((id) => ({ id }));
