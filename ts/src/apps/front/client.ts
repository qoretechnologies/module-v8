/**
 * Front API Client
 *
 * Extends QoreApiClient with Front-specific configuration:
 * - Bearer token authentication (default)
 * - Fixed base URL: https://api2.frontapp.com
 * - Cursor-based pagination using page_token from _pagination.next URL
 * - Response items in '_results' by default
 * - Removes '_links' from responses
 */

import { omit } from 'lodash';
import { QoreApiClient, PaginatedRequestOptions, RequestOptions } from '../../global/helpers/QoreApiClient';
import { FRONT_APP_NAME } from './constants';

export class FrontApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api2.frontapp.com',
      appName: FRONT_APP_NAME,
    });
  }

  /**
   * Front returns items in '_results' by default
   */
  protected getDefaultItemsPath(): string {
    return '_results';
  }

  /**
   * Default page size for Front
   */
  protected getDefaultPageSize(): number {
    return 100;
  }

  /**
   * Front uses cursor-based pagination with page_token extracted from _pagination.next URL
   */
  protected hasMorePages(
    response: any,
    _params: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const maxResults = options.maxResults || 500;
    const nextUrl = response?._pagination?.next;
    return items.length < maxResults && !!nextUrl;
  }

  /**
   * Extract page_token from the _pagination.next URL
   */
  protected getNextPageParams(
    response: any,
    currentParams: Record<string, any>,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const nextUrl = response?._pagination?.next;
    if (!nextUrl) {
      return null;
    }

    try {
      const urlObj = new URL(nextUrl);
      const pageToken = urlObj.searchParams.get('page_token');
      if (pageToken) {
        return { ...currentParams, page_token: pageToken };
      }
    } catch {
      // Invalid URL, no more pages
    }

    return null;
  }

  /**
   * Initial pagination params with size
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      size: options.limit || 100,
      ...options.params,
    };
  }

  /**
   * Override processResponse to remove _links from Front API responses
   */
  protected processResponse<T>(response: any, options: RequestOptions): T {
    const processed = super.processResponse<T>(response, options);

    if (processed && typeof processed === 'object' && !Array.isArray(processed)) {
      return omit(processed as Record<string, any>, ['_links']) as T;
    }

    return processed;
  }

  /**
   * Override extractItems to also remove _links from each item
   */
  protected extractItems<T>(response: any, options: PaginatedRequestOptions): T[] {
    const items = super.extractItems<T>(response, options);

    return items.map((item) => {
      if (item && typeof item === 'object') {
        return omit(item as Record<string, any>, ['_links']) as T;
      }
      return item;
    });
  }
}

// Export singleton instance
export const frontClient = new FrontApiClient();
