/**
 * SeaTable API Client
 *
 * Extends QoreApiClient with SeaTable-specific configuration:
 * - Two-step authentication: API Token -> Base Token exchange
 * - Automatic Base Token caching with refresh on expiry
 * - API Gateway endpoints: /api-gateway/api/v2/dtables/{base_uuid}/
 * - Offset-based pagination with start/limit parameters
 * - Dynamic baseUrl per request (supports self-hosted instances)
 */

import { QoreApiClient, PaginatedRequestOptions, RequestOptions, BaseRequestOptions } from '../../global/helpers/QoreApiClient';
import { SEATABLE_APP_NAME, SeaTableError } from './constants';

/**
 * Cached Base Token data
 */
interface BaseTokenCache {
  accessToken: string;
  dtableUuid: string;
  dtableServer: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Response from the get Base Token endpoint
 */
interface GetBaseTokenResponse {
  app_name: string;
  access_token: string;
  dtable_uuid: string;
  dtable_server: string;
  workspace_id: number;
  dtable_name: string;
}

export class SeaTableApiClient extends QoreApiClient {
  // Cache Base Tokens by API Token to avoid redundant requests
  private baseTokenCache: Map<string, BaseTokenCache> = new Map();

  // Token validity buffer (refresh 5 minutes before expiry)
  private readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

  // Base Token validity (3 days)
  private readonly BASE_TOKEN_VALIDITY_MS = 3 * 24 * 60 * 60 * 1000;

  constructor() {
    super({
      baseUrl: '', // Will be provided per-request via connectionOptions.url
      appName: SEATABLE_APP_NAME,
    });
  }

  /**
   * SeaTable uses custom baseUrl per request (supports self-hosted instances)
   */
  protected getBaseUrl(options: RequestOptions): string {
    return options?.connectionOptions?.url || options?.baseUrl || 'https://cloud.seatable.io';
  }

  /**
   * SeaTable uses Bearer token authentication
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Format path for SeaTable API
   * For base operations, prepends /api-gateway/api/v2/dtables/{base_uuid}/
   * For auth operations, uses /api/v2.1/
   */
  protected formatPath(path: string): string {
    const clean = path.trim().replace(/^\/+/, '');

    // Already has full path
    if (clean.startsWith('api/') || clean.startsWith('api-gateway/')) {
      return `/${clean}`;
    }

    return `/${clean}`;
  }

  /**
   * SeaTable returns items in 'rows' field
   */
  protected getDefaultItemsPath(): string {
    return 'rows';
  }

  /**
   * SeaTable uses offset-based pagination with start/limit
   */
  protected hasMorePages(
    response: any,
    _params: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    const maxResults = options.maxResults || 1000;
    const limit = options.limit || 100;

    // If we got fewer items than the limit, we're on the last page
    const pageItems = this.extractItems(response, options);
    if (pageItems.length < limit) {
      return false;
    }

    return items.length < maxResults;
  }

  /**
   * Offset-based pagination with start/limit
   */
  protected getNextPageParams(
    _response: any,
    currentParams: Record<string, any>,
    options: PaginatedRequestOptions
  ): Record<string, any> | null {
    const limit = options.limit || 100;
    const currentStart = parseInt(currentParams.start || '0', 10);
    const nextStart = currentStart + limit;

    return { ...currentParams, start: String(nextStart) };
  }

  /**
   * Initial pagination params with start/limit
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      start: '0',
      limit: String(options.limit || 100),
      ...options.params,
    };
  }

  /**
   * Default page size for SeaTable
   */
  protected getDefaultPageSize(): number {
    return 100;
  }

  /**
   * Get Base Token from API Token (with caching)
   *
   * SeaTable requires a Base Token for data operations. This method:
   * 1. Checks if we have a valid cached Base Token
   * 2. If not, exchanges the API Token for a new Base Token
   * 3. Caches the Base Token for future use
   *
   * @param apiToken - The permanent API Token for the base
   * @param url - The SeaTable server URL
   * @returns Base Token data including access_token and dtable_uuid
   */
  async getBaseToken(
    apiToken: string,
    url: string
  ): Promise<{ accessToken: string; dtableUuid: string; dtableServer: string }> {
    const cacheKey = `${url}:${apiToken}`;
    const cached = this.baseTokenCache.get(cacheKey);

    // Check if cached token is still valid
    if (cached && cached.expiresAt > Date.now() + this.TOKEN_REFRESH_BUFFER_MS) {
      return {
        accessToken: cached.accessToken,
        dtableUuid: cached.dtableUuid,
        dtableServer: cached.dtableServer,
      };
    }

    // Exchange API Token for Base Token
    try {
      const response = await this.get<GetBaseTokenResponse>(
        'api/v2.1/dtable/app-access-token/',
        {
          token: apiToken,
          connectionOptions: { url },
        }
      );

      if (!response?.access_token || !response?.dtable_uuid) {
        throw new SeaTableError('Failed to get Base Token: Invalid response from SeaTable API');
      }

      // Cache the token
      const tokenData: BaseTokenCache = {
        accessToken: response.access_token,
        dtableUuid: response.dtable_uuid,
        dtableServer: response.dtable_server || url,
        expiresAt: Date.now() + this.BASE_TOKEN_VALIDITY_MS,
      };

      this.baseTokenCache.set(cacheKey, tokenData);

      return {
        accessToken: tokenData.accessToken,
        dtableUuid: tokenData.dtableUuid,
        dtableServer: tokenData.dtableServer,
      };
    } catch (error) {
      if (error instanceof SeaTableError) {
        throw error;
      }
      throw new SeaTableError(
        `Failed to get Base Token: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear cached Base Token (useful for testing or token invalidation)
   */
  clearBaseTokenCache(apiToken?: string, url?: string): void {
    if (apiToken && url) {
      const cacheKey = `${url}:${apiToken}`;
      this.baseTokenCache.delete(cacheKey);
    } else {
      this.baseTokenCache.clear();
    }
  }

  /**
   * Make a request to a base operation endpoint
   * Automatically handles Base Token exchange
   *
   * @param path - The path relative to /api-gateway/api/v2/dtables/{base_uuid}/
   * @param options - Request options including api_token in connectionOptions
   */
  async baseGet<ResponseType = unknown>(
    path: string,
    options: BaseRequestOptions & { connectionOptions: { url: string; api_token: string } }
  ): Promise<ResponseType> {
    const { url, api_token } = options.connectionOptions;

    // Get Base Token
    const { accessToken, dtableUuid } = await this.getBaseToken(api_token, url);

    // Build full path with base_uuid
    const fullPath = `api-gateway/api/v2/dtables/${dtableUuid}/${path.replace(/^\/+/, '')}`;

    return this.get<ResponseType>(fullPath, {
      ...options,
      token: accessToken,
      connectionOptions: { ...options.connectionOptions, url },
    });
  }

  /**
   * Make a POST request to a base operation endpoint
   */
  async basePost<ResponseType = unknown>(
    path: string,
    body: any,
    options: BaseRequestOptions & { connectionOptions: { url: string; api_token: string } }
  ): Promise<ResponseType> {
    const { url, api_token } = options.connectionOptions;

    // Get Base Token
    const { accessToken, dtableUuid } = await this.getBaseToken(api_token, url);

    // Build full path with base_uuid
    const fullPath = `api-gateway/api/v2/dtables/${dtableUuid}/${path.replace(/^\/+/, '')}`;

    return this.post<ResponseType>(fullPath, body, {
      ...options,
      token: accessToken,
      connectionOptions: { ...options.connectionOptions, url },
    });
  }

  /**
   * Make a PUT request to a base operation endpoint
   */
  async basePut<ResponseType = unknown>(
    path: string,
    body: any,
    options: BaseRequestOptions & { connectionOptions: { url: string; api_token: string } }
  ): Promise<ResponseType> {
    const { url, api_token } = options.connectionOptions;

    // Get Base Token
    const { accessToken, dtableUuid } = await this.getBaseToken(api_token, url);

    // Build full path with base_uuid
    const fullPath = `api-gateway/api/v2/dtables/${dtableUuid}/${path.replace(/^\/+/, '')}`;

    return this.put<ResponseType>(fullPath, body, {
      ...options,
      token: accessToken,
      connectionOptions: { ...options.connectionOptions, url },
    });
  }

  /**
   * Make a DELETE request to a base operation endpoint
   * SeaTable DELETE requests often require a body
   */
  async baseDelete<ResponseType = unknown>(
    path: string,
    body: any,
    options: BaseRequestOptions & { connectionOptions: { url: string; api_token: string } }
  ): Promise<ResponseType> {
    const { url, api_token } = options.connectionOptions;

    // Get Base Token
    const { accessToken, dtableUuid } = await this.getBaseToken(api_token, url);

    // Build full path with base_uuid
    const fullPath = `api-gateway/api/v2/dtables/${dtableUuid}/${path.replace(/^\/+/, '')}`;

    return this.delete<ResponseType>(fullPath, {
      ...options,
      token: accessToken,
      connectionOptions: { ...options.connectionOptions, url },
      body,
    });
  }
}

// Export singleton instance
export const seatableClient = new SeaTableApiClient();

/**
 * SeaTable row type with standard fields
 */
export type SeaTableRow = {
  _id: string;
  _mtime: string;
  _ctime: string;
  [key: string]: unknown;
};

/**
 * SeaTable list rows response
 */
export type SeaTableListRowsResponse = {
  rows: SeaTableRow[];
};

/**
 * SeaTable metadata response
 */
export type SeaTableMetadataResponse = {
  metadata: {
    tables: SeaTableTable[];
    version: number;
    format_version: number;
  };
};

/**
 * SeaTable table metadata
 */
export type SeaTableTable = {
  _id: string;
  name: string;
  columns: SeaTableColumn[];
  views: SeaTableView[];
};

/**
 * SeaTable column metadata
 */
export type SeaTableColumn = {
  key: string;
  name: string;
  type: string;
  width?: number;
  editable?: boolean;
  resizable?: boolean;
  data?: Record<string, unknown>;
};

/**
 * SeaTable view metadata
 */
export type SeaTableView = {
  _id: string;
  name: string;
  type: string;
  is_locked?: boolean;
  filter_conjunction?: string;
  filters?: unknown[];
  sorts?: unknown[];
  hidden_columns?: string[];
  groupbys?: unknown[];
  groups?: unknown[];
};

/**
 * SeaTable SQL query response
 */
export type SeaTableSqlResponse = {
  metadata: Array<{
    key: string;
    name: string;
    type: string;
    data?: Record<string, unknown>;
  }>;
  results: Array<Record<string, unknown>>;
  success: boolean;
};

/**
 * SeaTable append rows response
 */
export type SeaTableAppendRowsResponse = {
  inserted_row_count: number;
  row_ids: Array<{ _id: string }>;
  first_row?: Record<string, unknown>;
};

/**
 * SeaTable update rows response
 */
export type SeaTableUpdateRowsResponse = {
  success: boolean;
};

/**
 * SeaTable delete rows response
 */
export type SeaTableDeleteRowsResponse = {
  success: boolean;
  deleted_rows?: number;
};
