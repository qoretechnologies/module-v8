// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

/**
 * Slack API Client
 *
 * Extends QoreApiClient with Slack-specific configuration:
 * - Bearer token authentication (bot token or user token)
 * - Base URL: https://slack.com/api
 * - Cursor-based pagination with response_metadata.next_cursor
 * - Slack's ok/error response pattern
 * - Read requests preserve HTTP rate-limit headers and retry within a deadline
 */

import axios, { AxiosHeaders } from 'axios';
import { get } from 'lodash';
import {
  BaseRequestOptions,
  PaginatedRequestOptions,
  QoreApiClient,
} from '../../global/helpers/QoreApiClient';
import { SLACK_API_URL, SLACK_APP_NAME, SlackError } from './constants';

const MAX_RATE_LIMIT_RETRIES = 3;
const MAX_TIMEOUT_MS = 2_147_483_647;

interface SlackRequestOptions extends BaseRequestOptions {
  /** Total request budget, including rate-limit retries, in milliseconds. */
  timeout?: number;
}

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
  protected handleError(
    error: unknown,
    context: { path: string; method: string; baseUrl: string }
  ): never {
    // Check if it's a Slack API error response
    if (
      error &&
      typeof error === 'object' &&
      'ok' in error &&
      error.ok === false &&
      'error' in error
    ) {
      throw new SlackError(`Slack API error: ${error.error}`);
    }

    const detail = error instanceof Error ? error.message : String(error);
    const message = `Error calling Slack API for ${context.path}: ${detail}`;
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
   * GET request with Slack error handling and at most three HTTP 429 retries.
   * Retry-After must fit within the request budget; otherwise the rate-limit error propagates.
   * Axios retains status and headers that QorusRequest discards on HTTP errors.
   *
   * @param path Slack API method, e.g. conversations.list
   * @param options Authentication, query parameters and optional timeout (default: 60 seconds)
   * @returns The successful Slack response, processed according to options
   * @throws SlackError On transport, HTTP, Slack API, or timeout errors
   */
  async get<ResponseType = unknown>(
    path: string,
    options: SlackRequestOptions = {}
  ): Promise<ResponseType> {
    const timeout = options.timeout ?? this.defaultTimeout;
    if (!Number.isSafeInteger(timeout) || timeout <= 0 || timeout > MAX_TIMEOUT_MS) {
      throw new SlackError(
        `Slack request timeout must be an integer from 1 to ${MAX_TIMEOUT_MS} ms`
      );
    }
    const deadline = Date.now() + timeout;
    const baseUrl = options.baseUrl || this.getBaseUrl(options);
    const formattedPath = this.formatPath(path);

    for (let retries = 0; ; ++retries) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new SlackError(`Slack request timed out for ${path}`);
      }
      try {
        const response = await axios.get<unknown>(
          `${baseUrl.replace(/\/$/, '')}/${formattedPath}`,
          {
            headers: {
              Accept: 'application/json',
              ...this.buildHeaders(options.token, options.headers),
            },
            params: options.params,
            timeout: remaining,
          }
        );
        if (Date.now() >= deadline) {
          throw new SlackError(`Slack request timed out for ${path}`);
        }
        const data = response.data;
        if (!data || typeof data !== 'object' || !('ok' in data)) {
          throw new SlackError(`Invalid Slack API response for ${path}`);
        }
        if (data.ok !== true) {
          const error = 'error' in data ? data.error : 'Unknown error';
          throw new SlackError(`Slack API error for ${path}: ${error}`);
        }
        return this.processResponse(response, options) as ResponseType;
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          const headers = error.response.headers;
          const retryAfter =
            headers instanceof AxiosHeaders
              ? headers.get('retry-after')
              : Object.entries(headers).find(([name]) => name.toLowerCase() === 'retry-after')?.[1];
          const retryMs =
            typeof retryAfter === 'string' && /^\d+$/.test(retryAfter)
              ? Number(retryAfter) * 1000
              : NaN;
          if (
            retries < MAX_RATE_LIMIT_RETRIES &&
            Number.isFinite(retryMs) &&
            retryMs < deadline - Date.now()
          ) {
            await this.delay(retryMs);
            continue;
          }
        }
        if (error instanceof SlackError) {
          throw error;
        }
        this.handleError(error, { path: formattedPath, method: 'GET', baseUrl });
      }
    }
  }

  /**
   * Fetch paginated data using GET with query parameters.
   * Slack's cursor-based pagination requires params as query parameters —
   * the cursor is ignored when sent in a JSON POST body.
   *
   * @param options Method, items field, authentication and pagination limits
   * @returns Results up to maxResults (default: 500); empty only for a successful empty scan
   * @throws SlackError On any failed page, invalid response, cursor cycle or expired scan
   * @example
   * const channels = await slackClient.fetchPaginatedPost<{ id: string; name: string }>({
   *   token, path: 'conversations.list', itemsPath: 'channels', maxResults: 2000,
   *   params: { exclude_archived: true },
   * });
   */
  async fetchPaginatedPost<ItemType = unknown>(options: SlackCursorOptions): Promise<ItemType[]> {
    const items: ItemType[] = [];
    const timeout = options.timeout ?? this.defaultTimeout;
    const fetchDelay = options.fetchDelay ?? this.defaultFetchDelay;
    const maxResults = options.maxResults ?? 500;
    if (
      !Number.isSafeInteger(timeout) ||
      timeout <= 0 ||
      timeout > MAX_TIMEOUT_MS ||
      !Number.isFinite(fetchDelay) ||
      fetchDelay < 0 ||
      !Number.isSafeInteger(maxResults) ||
      maxResults < 0
    ) {
      throw new SlackError('Invalid Slack pagination timeout, fetchDelay or maxResults');
    }
    const deadline = Date.now() + timeout;

    let cursor: string | undefined;
    const seenCursors = new Set<string>();

    while (items.length < maxResults) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new SlackError(`Slack pagination timed out for ${options.path}`);
      }

      const params: Record<string, unknown> = {
        limit: options.limit ?? this.getDefaultPageSize(),
        ...options.params,
      };
      if (cursor) {
        params.cursor = cursor;
      }
      const response = await this.get<unknown>(options.path, {
        token: options.token,
        headers: options.headers,
        baseUrl: options.baseUrl,
        connectionOptions: options.connectionOptions,
        params,
        timeout: remaining,
      });
      if (Date.now() >= deadline) {
        throw new SlackError(`Slack pagination timed out for ${options.path}`);
      }

      const pageItems: unknown = get(response, options.itemsPath);
      if (!Array.isArray(pageItems)) {
        throw new SlackError(
          `Invalid Slack ${options.path} response: expected ${options.itemsPath} array`
        );
      }
      items.push(...pageItems.slice(0, maxResults - items.length));

      const nextCursor: unknown = get(response, 'response_metadata.next_cursor');
      if (
        nextCursor === undefined ||
        nextCursor === null ||
        nextCursor === '' ||
        items.length >= maxResults
      ) {
        break;
      }
      if (typeof nextCursor !== 'string' || seenCursors.has(nextCursor)) {
        throw new SlackError(`Invalid or repeated Slack pagination cursor for ${options.path}`);
      }
      seenCursors.add(nextCursor);
      cursor = nextCursor;

      if (fetchDelay >= deadline - Date.now()) {
        throw new SlackError(`Slack pagination timed out for ${options.path}`);
      }
      if (fetchDelay > 0) {
        await this.delay(fetchDelay);
      }
    }
    return items;
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
