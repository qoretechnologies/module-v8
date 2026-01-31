/**
 * Trello API Client
 *
 * Extends QoreApiClient with Trello-specific configuration:
 * - Authentication via query params (key + token) instead of headers
 * - Auto-prepends '/1/' to all paths
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { BaseRequestOptions, QoreApiClient } from '../../global/helpers/QoreApiClient';
import { TRELLO_APP_NAME } from './constants';

/**
 * Extended request options for Trello API
 */
export interface TrelloRequestOptions extends BaseRequestOptions {
  /** Trello API key */
  key?: string;
}

/**
 * Trello API Client
 *
 * Handles Trello-specific authentication and path formatting:
 * - Uses query parameters for auth (key, token) instead of headers
 * - Prepends /1/ to API paths
 */
export class TrelloApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.trello.com',
      appName: TRELLO_APP_NAME,
    });
  }

  /**
   * Format path to prepend /1/ (Trello API version)
   */
  protected formatPath(path: string): string {
    let clean = path.trim().replace(/^\/+/, '');

    // Ensure path starts with /1/
    if (!clean.startsWith('1/')) {
      clean = `1/${clean}`;
    }

    return `/${clean}`;
  }

  /**
   * Trello uses query params for auth, not headers
   */
  protected buildHeaders(
    _token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return customHeaders || {};
  }

  /**
   * Make a GET request with Trello-specific auth params
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: TrelloRequestOptions
  ): Promise<ResponseType> {
    const params = this.addAuthParams(options);
    return super.get(path, { ...options, params });
  }

  /**
   * Make a POST request with Trello-specific auth params
   */
  async post<ResponseType = unknown>(
    path: string,
    body?: unknown,
    options?: TrelloRequestOptions
  ): Promise<ResponseType> {
    const params = this.addAuthParams(options);
    return super.post(path, body, { ...options, params });
  }

  /**
   * Make a PUT request with Trello-specific auth params
   */
  async put<ResponseType = unknown>(
    path: string,
    body?: unknown,
    options?: TrelloRequestOptions
  ): Promise<ResponseType> {
    const params = this.addAuthParams(options);
    return super.put(path, body, { ...options, params });
  }

  /**
   * Make a DELETE request with Trello-specific auth params
   */
  async delete<ResponseType = unknown>(
    path: string,
    options?: TrelloRequestOptions
  ): Promise<ResponseType> {
    const params = this.addAuthParams(options);
    return super.delete(path, { ...options, params });
  }

  /**
   * Add Trello auth params (key, token) to query parameters
   */
  private addAuthParams(options?: TrelloRequestOptions): Record<string, unknown> {
    return {
      ...options?.params,
      key: options?.key || options?.connectionOptions?.key,
      token: options?.token,
    };
  }
}

/**
 * Singleton instance of Trello API client
 */
export const trelloClient = new TrelloApiClient();
