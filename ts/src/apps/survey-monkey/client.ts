/**
 * SurveyMonkey API Client
 *
 * Extends QoreApiClient with SurveyMonkey-specific configuration:
 * - Bearer token authentication (default)
 * - Page-based pagination (page/per_page parameters)
 * - Response structure with 'data' array
 * - Pagination metadata: page, per_page, total
 */

import { QoreApiClient, PaginatedRequestOptions } from '../../global/helpers/QoreApiClient';

export class SurveyMonkeyApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.surveymonkey.com/v3',
      appName: 'survey-monkey',
    });
  }

  /**
   * Items are in 'data' array
   */
  protected getDefaultItemsPath(): string {
    return 'data';
  }

  /**
   * Check if more pages exist based on pagination metadata
   */
  protected hasMorePages(
    response: any,
    currentParams: any,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const total = response?.total;
    const maxResults = options.maxResults || 500;

    // Check if we have total and haven't fetched everything yet
    if (total !== undefined) {
      return items.length < total && items.length < maxResults;
    }

    // Fallback: check if we got a full page (likely more data exists)
    const perPage = currentParams.per_page || 100;
    const currentPageItems = response?.data?.length || 0;
    return currentPageItems >= perPage && items.length < maxResults;
  }

  /**
   * Page-based pagination
   */
  protected getNextPageParams(_response: any, params: any): Record<string, any> {
    const page = (params.page || 1) + 1;
    return { ...params, page };
  }

  /**
   * Initial pagination params with page and per_page
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      page: 1,
      per_page: options.limit || 100,
      ...options.params,
    };
  }

  /**
   * Default page size
   */
  protected getDefaultPageSize(): number {
    return 100;
  }
}

// Export singleton instance
export const surveyMonkeyClient = new SurveyMonkeyApiClient();
