/**
 * ClickUp API Client
 *
 * A unified client for all ClickUp API interactions.
 * Extends QoreApiClient with ClickUp-specific customizations.
 *
 * @example
 * ```typescript
 * // Single requests (v2 API - default)
 * const task = await clickUpClient.get('task/123', { token });
 * const newTask = await clickUpClient.post('list/456/task', { name: 'Task' }, { token });
 * await clickUpClient.delete('task/123', { token });
 *
 * // v3 API requests - use v3() helper
 * const channels = await clickUpClient.get(clickUpClient.v3('workspaces/123/chat/channels'), { token });
 *
 * // Paginated requests
 * const tasks = await clickUpClient.fetchPaginated({
 *   token,
 *   path: 'list/456/task',
 *   itemsPath: 'tasks',
 *   maxResults: 100,
 * });
 *
 * // Allowed values
 * const values = await clickUpClient.fetchAllowedValues({
 *   token,
 *   path: 'team/789/space',
 *   itemsPath: 'spaces',
 *   mapItemToAllowedValue: (space) => ({
 *     value: space.id,
 *     display_name: space.name,
 *   }),
 * });
 * ```
 */

import {
  PaginatedRequestOptions,
  QoreApiClient,
  RequestOptions,
} from '../../global/helpers/QoreApiClient';
import { CLICKUP_APP_NAME } from './constants';

export class ClickUpApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.clickup.com',
      appName: CLICKUP_APP_NAME,
    });
  }

  /**
   * Helper to create v3 API paths
   * Use this for v3 endpoints like chat channels, documents, etc.
   *
   * @example
   * ```typescript
   * clickUpClient.get(clickUpClient.v3('workspaces/123/chat/channels'), { token });
   * ```
   */
  v3(path: string): string {
    return `api/v3/${path.replace(/^\/+/, '')}`;
  }

  /**
   * ClickUp uses Bearer token authentication
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
   * ClickUp API paths are prefixed with /api/v2/ (or /api/v3/ for some endpoints)
   */
  protected formatPath(path: string): string {
    const clean = path.trim().replace(/^\/+/, '');

    // If already prefixed with api/, return as-is
    if (clean.startsWith('api/')) {
      return `/${clean}`;
    }

    // Default to v2 API
    return `/api/v2/${clean}`;
  }

  /**
   * ClickUp uses 'last_page' boolean for pagination.
   * last_page: true = this is the final page, stop paginating
   * last_page: false = there are more pages, continue fetching
   */
  protected hasMorePages(
    response: any,
    _currentParams: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const maxResults = options.maxResults || 500;

    if (items.length >= maxResults) {
      return false;
    }

    // Continue only if last_page is explicitly false (more pages exist)
    return response.last_page === false;
  }

  /**
   * ClickUp uses page-based pagination starting at 0
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      page: 0,
      ...(options.limit && { limit: options.limit.toString() }),
      ...options.params,
    };
  }

  /**
   * Increment page number for next request
   */
  protected getNextPageParams(
    _response: any,
    currentParams: Record<string, any>,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const page = (currentParams.page || 0) + 1;
    return { ...currentParams, page };
  }

  /**
   * Default items path varies by endpoint in ClickUp
   * Common ones: tasks, spaces, folders, lists, members, etc.
   */
  protected getDefaultItemsPath(): string {
    return 'data';
  }

  /**
   * Override to handle ClickUp-specific response extraction
   */
  protected processResponse<T>(
    response: { data: T; headers?: Record<string, any> },
    options: RequestOptions
  ): T {
    // Use base implementation
    return super.processResponse(response, options);
  }
}

// Export singleton instance
export const clickUpClient = new ClickUpApiClient();
