/**
 * Slack API Client
 *
 * Extends QoreApiClient with Slack-specific configuration:
 * - Bearer token authentication (bot token or user token)
 * - Base URL: https://slack.com/api
 * - Cursor-based pagination with response_metadata.next_cursor
 * - Slack's ok/error response pattern
 * - All API calls use POST with JSON body
 */

import { get } from 'lodash';
import {
  BaseRequestOptions,
  PaginatedRequestOptions,
  QoreApiClient,
} from '../../global/helpers/QoreApiClient';
import { SLACK_API_URL, SLACK_APP_NAME, SlackError } from './constants';

/**
 * Options for Slack cursor-based pagination
 */
export interface SlackCursorOptions extends Omit<PaginatedRequestOptions, 'path'> {
  /** API method path (e.g., 'conversations.list') */
  path: string;
  /** Response field containing items (e.g., 'channels', 'users', 'messages') */
  itemsPath: string;
}

export class SlackApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: SLACK_API_URL,
      appName: SLACK_APP_NAME,
    });
  }

  /**
   * Slack endpoints don't need path formatting
   */
  protected formatPath(path: string): string {
    return path.trim().replace(/^\/+/, '');
  }

  /**
   * Default items path for Slack responses
   */
  protected getDefaultItemsPath(): string {
    return 'channels';
  }

  /**
   * Default page size for Slack
   */
  protected getDefaultPageSize(): number {
    return 200;
  }

  /**
   * Slack uses cursor-based pagination with response_metadata.next_cursor
   */
  protected hasMorePages(
    response: any,
    _params: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const maxResults = options.maxResults || 500;
    const nextCursor = get(response, 'response_metadata.next_cursor');
    return !!nextCursor && nextCursor !== '' && items.length < maxResults;
  }

  /**
   * Build next page params with cursor
   */
  protected getNextPageParams(
    response: any,
    currentParams: Record<string, any>,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const nextCursor = get(response, 'response_metadata.next_cursor');
    if (!nextCursor || nextCursor === '') {
      return null;
    }
    return { ...currentParams, cursor: nextCursor };
  }

  /**
   * Initial pagination params for Slack
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      limit: options.limit || 200,
      ...options.params,
    };
  }

  /**
   * Handle Slack API errors
   * Slack returns { ok: false, error: "error_code" } for errors
   */
  protected handleError(error: any, context: { path: string; method: string; baseUrl: string }): never {
    // Check if it's a Slack API error response
    if (error?.ok === false && error?.error) {
      throw new SlackError(`Slack API error: ${error.error}`);
    }

    const message = `Error calling Slack API for ${context.path}: ${error.message || error}`;
    throw new SlackError(message);
  }

  /**
   * POST request with Slack error handling
   * Slack APIs return { ok: true/false, ... } pattern
   */
  async post<ResponseType = unknown>(
    path: string,
    body?: any,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const response = await super.post<any>(path, body, options);

    // Check for Slack error response
    if (response?.ok === false) {
      throw new SlackError(`Slack API error: ${response.error || 'Unknown error'}`);
    }

    return response as ResponseType;
  }

  /**
   * GET request with Slack error handling
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const response = await super.get<any>(path, options);

    // Check for Slack error response
    if (response?.ok === false) {
      throw new SlackError(`Slack API error: ${response.error || 'Unknown error'}`);
    }

    return response as ResponseType;
  }

  /**
   * Fetch paginated data using GET with query parameters.
   * Slack's cursor-based pagination requires params as query parameters —
   * the cursor is ignored when sent in a JSON POST body.
   */
  async fetchPaginatedPost<ItemType = unknown>(
    options: SlackCursorOptions
  ): Promise<ItemType[]> {
    const items: ItemType[] = [];
    const timeout = options.timeout || 60_000;
    const fetchDelay = options.fetchDelay || 300;
    const maxResults = options.maxResults || 500;
    const startTime = Date.now();

    let cursor: string | undefined;

    try {
      while (true) {
        // Timeout check
        if (Date.now() - startTime > timeout) {
          break;
        }

        // Max results check
        if (items.length >= maxResults) {
          break;
        }

        // Build query parameters
        const params: Record<string, any> = {
          limit: options.limit || 200,
          ...options.params,
        };

        if (cursor) {
          params.cursor = cursor;
        }

        // Use GET with query params — Slack ignores cursor in JSON POST body
        const response = await this.get<any>(options.path, {
          token: options.token,
          params,
        });

        // Extract items
        const pageItems = get(response, options.itemsPath) || [];
        if (!pageItems.length) break;

        items.push(...pageItems);

        // Check for more pages
        const nextCursor = get(response, 'response_metadata.next_cursor');
        if (!nextCursor || nextCursor === '') {
          break;
        }

        cursor = nextCursor;

        // Delay between requests
        if (items.length < maxResults) {
          await this.delay(fetchDelay);
        }
      }

      return items.slice(0, maxResults);
    } catch (error) {
      // Return what we got so far (graceful degradation)
      return items;
    }
  }

  /**
   * Helper to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const slackClient = new SlackApiClient();
