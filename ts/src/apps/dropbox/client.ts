/**
 * Dropbox API Client
 *
 * Extends QoreApiClient with Dropbox-specific configuration:
 * - Bearer token authentication
 * - Dual base URLs: api.dropboxapi.com (metadata) and content.dropboxapi.com (uploads)
 * - Cursor-based pagination with separate /continue endpoints
 * - All operations use POST (even reads)
 * - File uploads use Dropbox-API-Arg header
 */

import {
  BaseRequestOptions,
  PaginatedRequestOptions,
  QoreApiClient,
} from '../../global/helpers/QoreApiClient';
import { DROPBOX_API_URL, DROPBOX_APP_NAME, DROPBOX_CONTENT_URL } from './constants';

/**
 * Options for cursor-based pagination (Dropbox-specific)
 */
export interface DropboxCursorOptions {
  /** Authentication token */
  token: string;
  /** Initial endpoint path (e.g., 'files/list_folder') */
  initialPath: string;
  /** Continue endpoint path (e.g., 'files/list_folder/continue') */
  continuePath: string;
  /** Initial request body */
  initialBody: Record<string, any>;
  /** Filter entries by .tag value ('file' or 'folder') */
  filterTag?: 'file' | 'folder';
  /** Maximum number of results to fetch */
  maxResults?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Delay between page fetches in milliseconds */
  fetchDelay?: number;
}

/**
 * Options for content uploads
 */
export interface DropboxUploadOptions extends BaseRequestOptions {
  /** Dropbox API arguments to send in header */
  dropboxApiArg: Record<string, any>;
}

export class DropboxApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: DROPBOX_API_URL,
      appName: DROPBOX_APP_NAME,
    });
  }

  /**
   * Auto-prepend /2/ to paths for Dropbox API v2
   */
  protected formatPath(path: string): string {
    const clean = path.trim().replace(/^\/+/, '');
    if (clean.startsWith('2/')) {
      return `/${clean}`;
    }
    return `/2/${clean}`;
  }

  /**
   * Dropbox returns items in 'entries' array
   */
  protected getDefaultItemsPath(): string {
    return 'entries';
  }

  /**
   * Default page size for Dropbox
   */
  protected getDefaultPageSize(): number {
    return 100;
  }

  /**
   * Dropbox uses cursor + has_more for pagination
   */
  protected hasMorePages(
    response: any,
    _params: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const maxResults = options.maxResults || 500;
    return response?.has_more === true && items.length < maxResults;
  }

  /**
   * Build next page params (cursor-based)
   * Note: For Dropbox, we need to call a different /continue endpoint,
   * so standard fetchPaginated won't work - use fetchWithCursor instead
   */
  protected getNextPageParams(
    response: any,
    _params: Record<string, any>,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const cursor = response?.cursor;
    if (!cursor || !response?.has_more) {
      return null;
    }
    return { cursor };
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

  /**
   * Custom cursor-based pagination for Dropbox
   *
   * Dropbox requires calling a separate /continue endpoint with the cursor,
   * which is different from standard pagination patterns.
   *
   * @example
   * const files = await dropboxClient.fetchWithCursor<TDropboxFile>({
   *   token,
   *   initialPath: 'files/list_folder',
   *   continuePath: 'files/list_folder/continue',
   *   initialBody: { path: '', recursive: true },
   *   filterTag: 'file',
   *   maxResults: 100,
   * });
   */
  async fetchWithCursor<ItemType = unknown>(options: DropboxCursorOptions): Promise<ItemType[]> {
    const items: ItemType[] = [];
    const maxResults = options.maxResults || 500;
    const timeout = options.timeout || 60_000;
    const fetchDelay = options.fetchDelay || 300;
    const startTime = Date.now();

    try {
      // Initial request
      const initialResponse = await this.post<any>(options.initialPath, options.initialBody, {
        token: options.token,
      });

      let entries = initialResponse.entries || [];

      // Filter by tag if specified
      if (options.filterTag) {
        entries = entries.filter((entry: any) => entry['.tag'] === options.filterTag);
      }

      items.push(...entries);

      let cursor = initialResponse.cursor;
      let hasMore = initialResponse.has_more;

      // Continue fetching while there are more pages
      while (hasMore && items.length < maxResults && Date.now() - startTime < timeout) {
        // Delay between requests
        await this.delay(fetchDelay);

        const continueResponse = await this.post<any>(
          options.continuePath,
          { cursor },
          { token: options.token }
        );

        let moreEntries = continueResponse.entries || [];

        // Filter by tag if specified
        if (options.filterTag) {
          moreEntries = moreEntries.filter((entry: any) => entry['.tag'] === options.filterTag);
        }

        items.push(...moreEntries);

        cursor = continueResponse.cursor;
        hasMore = continueResponse.has_more;
      }

      return items.slice(0, maxResults);
    } catch (error) {
      // Return what we have so far (graceful degradation)
      return items;
    }
  }

  /**
   * Upload content to Dropbox (files)
   *
   * Uses the content.dropboxapi.com endpoint with special headers:
   * - Dropbox-API-Arg: JSON-encoded parameters
   * - Content-Type: application/octet-stream
   *
   * @example
   * const result = await dropboxClient.uploadContent<TFileMetadata>(
   *   'files/upload',
   *   fileBuffer,
   *   {
   *     token,
   *     dropboxApiArg: {
   *       path: '/folder/file.txt',
   *       mode: 'add',
   *       autorename: true,
   *     },
   *   }
   * );
   */
  async uploadContent<ResponseType = unknown>(
    path: string,
    content: Buffer,
    options: DropboxUploadOptions
  ): Promise<ResponseType> {
    const { dropboxApiArg, ...baseOptions } = options;

    return this.post<ResponseType>(path, content, {
      ...baseOptions,
      baseUrl: DROPBOX_CONTENT_URL,
      headers: {
        'Dropbox-API-Arg': JSON.stringify(dropboxApiArg),
        'Content-Type': 'application/octet-stream',
        ...baseOptions.headers,
      },
    });
  }

  /**
   * Download content from Dropbox
   *
   * Uses the content.dropboxapi.com endpoint with Dropbox-API-Arg header.
   * Returns raw response data.
   *
   * @example
   * const content = await dropboxClient.downloadContent(
   *   'files/download',
   *   { token, dropboxApiArg: { path: '/folder/file.txt' } }
   * );
   */
  async downloadContent<ResponseType = unknown>(
    path: string,
    options: DropboxUploadOptions
  ): Promise<ResponseType> {
    const { dropboxApiArg, ...baseOptions } = options;

    return this.post<ResponseType>(path, undefined, {
      ...baseOptions,
      baseUrl: DROPBOX_CONTENT_URL,
      headers: {
        'Dropbox-API-Arg': JSON.stringify(dropboxApiArg),
        ...baseOptions.headers,
      },
    });
  }

  /**
   * Helper to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const dropboxClient = new DropboxApiClient();
