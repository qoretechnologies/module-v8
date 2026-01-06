/**
 * Active Campaign API Client
 *
 * Extends QoreApiClient with Active Campaign-specific configuration:
 * - Custom 'Api-Token' header authentication
 * - Offset-based pagination with meta.total tracking
 * - Auto-prepends '/api/3/' to all paths
 */

import { QoreApiClient, PaginatedRequestOptions } from '../../global/helpers/QoreApiClient';

export class ActiveCampaignApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: '', // Will be provided per-request via options.url
      appName: 'active-campaign',
    });
  }

  /**
   * Active Campaign uses custom baseUrl per request
   * Supports both 'url' (legacy) and 'baseUrl' parameters
   */
  protected getBaseUrl(options: any): string {
    return options?.baseUrl || options?.url || '';
  }

  /**
   * Active Campaign uses 'Api-Token' header instead of Bearer
   */
  protected buildHeaders(token?: string): Record<string, string> {
    return {
      'Api-Token': token || '',
    };
  }

  /**
   * Auto-prepend /api/3/ to all paths
   */
  protected formatPath(path: string): string {
    const clean = path.trim().replace(/^\/+/, '');
    return `/api/3/${clean}`;
  }

  /**
   * Items are at custom object path (default 'data')
   */
  protected getDefaultItemsPath(): string {
    return 'data';
  }

  /**
   * Check if more pages exist based on total count
   */
  protected hasMorePages(
    response: any,
    _params: any,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const total = response?.meta?.total || 0;
    const maxResults = options.maxResults || 500;
    return items.length < total && items.length < maxResults;
  }

  /**
   * Offset-based pagination
   */
  protected getNextPageParams(_response: any, params: any): Record<string, any> {
    const offset = (params.offset || 0) + (params.limit || 100);
    return { ...params, offset };
  }

  /**
   * Initial pagination params with offset
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      offset: 0,
      limit: options.limit || 100,
      ...options.params,
    };
  }
}

// Export singleton instance
export const activeCampaignClient = new ActiveCampaignApiClient();
