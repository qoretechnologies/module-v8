/**
 * QoreApiClient - Class-based Reusable HTTP Client for App Integrations
 *
 * A flexible, type-safe HTTP client that supports:
 * - Overridable methods for app-specific customization
 * - All pagination patterns (page, offset, cursor, token, URL-based)
 * - QorusRequest for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Custom authentication, path formatting, and response processing
 * - Graceful error handling and timeout management
 *
 * @example
 * ```typescript
 * // Create app-specific client
 * class FrontApiClient extends QoreApiClient {
 *   constructor() {
 *     super({
 *       baseUrl: 'https://api2.frontapp.com',
 *       appName: 'front',
 *     });
 *   }
 *
 *   protected buildHeaders(token?: string) {
 *     return {
 *       Authorization: `Bearer ${token}`,
 *     };
 *   }
 *
 *   protected getResponseOmitKeys() {
 *     return ['_links'];
 *   }
 * }
 *
 * // Use in actions
 * export const frontClient = new FrontApiClient();
 *
 * // Single requests
 * const conversation = await frontClient.get('conversations/123', { token });
 * const newContact = await frontClient.post('contacts', { name: 'John' }, { token });
 * const updated = await frontClient.patch('contacts/456', { email: 'new@email.com' }, { token });
 * await frontClient.delete('contacts/789', { token });
 *
 * // Paginated requests
 * const conversations = await frontClient.fetchPaginated({
 *   token,
 *   path: 'conversations',
 *   maxResults: 500,
 * });
 * ```
 */

import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { get, omit } from 'lodash';
import { Debugger } from '../../utils/Debugger';

// Delay helper to avoid circular dependency with index.ts
const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

// ============================================================================
// Types
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Response from QorusRequest
 */
type QorusResponse<T> = {
  data: T;
  headers?: Record<string, any>;
};

/**
 * Configuration for QoreApiClient
 */
export interface QoreApiClientConfig {
  /** Base URL of the API (e.g., 'https://api.example.com') */
  baseUrl: string | ((options?: Record<string, any>) => string);

  /** App name for logging and endpoint identification */
  appName: string;
}

/**
 * Base options for HTTP requests
 */
export interface BaseRequestOptions {
  /** Authentication token */
  token?: string;

  /** Query parameters */
  params?: Record<string, any>;

  /** Custom headers for this request */
  headers?: Record<string, string>;

  /** Override baseUrl for this request */
  baseUrl?: string;

  /** Path to extract object from response (using lodash.get) */
  objectPath?: string;

  /** Include response headers in return value */
  includeHeaders?: boolean;

  /** Additional connection options */
  connectionOptions?: Record<string, any>;
}

/**
 * Options for requests with body data (POST, PUT, PATCH)
 */
export interface RequestOptionsWithBody extends BaseRequestOptions {
  /** Request body */
  body?: any;
}

/**
 * Internal options for a single HTTP request (includes method and path)
 */
interface InternalRequestOptions extends RequestOptionsWithBody {
  /** API path (relative to baseUrl) */
  path: string;

  /** HTTP method */
  method: HttpMethod;
}

/**
 * Legacy RequestOptions for backward compatibility
 * @deprecated Use get(), post(), put(), patch(), delete() methods instead
 */
export interface RequestOptions extends RequestOptionsWithBody {
  /** HTTP method */
  method?: HttpMethod;
}

/**
 * Options for paginated requests
 */
export interface PaginatedRequestOptions extends Omit<RequestOptions, 'params'> {
  /** API path (relative to baseUrl) */
  path: string;

  /** Path to items array in response (e.g., 'results', 'data', '_embedded.items') */
  itemsPath?: string;

  /** Maximum number of results to fetch */
  maxResults?: number;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Delay between page fetches in milliseconds */
  fetchDelay?: number;

  /** Page size limit */
  limit?: number;

  /** Additional query parameters */
  params?: Record<string, any>;
}

/**
 * Options for fetching allowed values
 */
export interface AllowedValuesOptions<ItemType = unknown> extends PaginatedRequestOptions {
  /** Function to map items to allowed values */
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;

  /** Optional filter function */
  filterItems?: (item: ItemType) => boolean;
}

/**
 * Context passed to error handler
 */
interface ErrorContext {
  path: string;
  method: string;
  baseUrl: string;
}

// ============================================================================
// QoreApiClient Base Class
// ============================================================================

/**
 * Base class for app-specific API clients
 *
 * Apps should extend this class and override methods as needed:
 * - formatPath() - Custom path formatting
 * - buildHeaders() - Custom authentication
 * - extractItems() - Custom response structures
 * - hasMorePages() - Custom pagination logic
 * - getNextPageParams() - Custom parameter building
 * - And more...
 */
export abstract class QoreApiClient {
  protected config: QoreApiClientConfig;
  protected defaultTimeout = 60_000;
  protected defaultFetchDelay = 300;

  constructor(config: QoreApiClientConfig) {
    this.config = config;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Make a GET request
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      ...options,
      path,
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   */
  async post<ResponseType = unknown>(
    path: string,
    body?: any,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      ...options,
      path,
      method: 'POST',
      body,
    });
  }

  /**
   * Make a PUT request
   */
  async put<ResponseType = unknown>(
    path: string,
    body?: any,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      ...options,
      path,
      method: 'PUT',
      body,
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<ResponseType = unknown>(
    path: string,
    body?: any,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      ...options,
      path,
      method: 'PATCH',
      body,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<ResponseType = unknown>(
    path: string,
    options?: RequestOptionsWithBody
  ): Promise<ResponseType> {
    return this.request<ResponseType>({
      ...options,
      path,
      method: 'DELETE',
    });
  }

  /**
   * Make a single HTTP request (internal method)
   * @deprecated Use get(), post(), put(), patch(), delete() methods instead
   */
  private async request<ResponseType = unknown>(
    options: InternalRequestOptions
  ): Promise<ResponseType> {
    const {
      token: _token,
      path,
      method,
      params,
      body,
      headers: customHeaders,
      baseUrl: customBaseUrl,
    } = options;

    // OVERRIDABLE: Get base URL
    const baseUrl = customBaseUrl || this.getBaseUrl(options);
    // OVERRIDABLE: Format path
    const formattedPath = this.formatPath(path, baseUrl);

    // OVERRIDABLE: Build headers
    const headers = this.buildHeaders(options.token, customHeaders);

    const endpointData = {
      url: baseUrl,
      endpointId: this.config.appName,
    };

    const context: ErrorContext = {
      path: formattedPath,
      method,
      baseUrl,
    };

    try {
      const response = await this.makeQorusRequest<ResponseType>({
        method,
        path: formattedPath,
        headers,
        params,
        body,
        endpointData,
      });

      if (!response?.data) {
        throw new Error(`No data received from ${this.config.appName} API for ${path}`);
      }

      // OVERRIDABLE: Extract and transform response
      return this.processResponse(response, options);
    } catch (error) {
      Debugger.log(`Error in ${method} ${formattedPath}`, error);

      // OVERRIDABLE: Handle errors
      throw this.handleError(error, context);
    }
  }

  /**
   * Fetch paginated data
   * Handles all pagination patterns automatically via overridable methods
   */
  async fetchPaginated<ItemType = unknown>(options: PaginatedRequestOptions): Promise<ItemType[]> {
    const items: ItemType[] = [];
    const timeout = options.timeout || this.defaultTimeout;
    const fetchDelay = options.fetchDelay || this.defaultFetchDelay;
    const maxResults = options.maxResults || 500;
    const startTime = Date.now();

    // OVERRIDABLE: Get initial params
    let currentParams = this.getInitialPaginationParams(options);
    let currentPath = options.path;

    try {
      while (true) {
        // Timeout check
        if (Date.now() - startTime > timeout) {
          Debugger.log(`Timeout fetching ${this.config.appName} records for ${options.path}`);
          break;
        }

        // Max results check
        if (items.length >= maxResults) {
          break;
        }

        // Make request (always use GET for pagination)
        const response = await this.get(currentPath, {
          ...options,
          params: currentParams,
        });

        // OVERRIDABLE: Extract items from response
        const pageItems = this.extractItems<ItemType>(response, options);

        // Handle array responses (no pagination)
        if (Array.isArray(response)) {
          items.push(...(response as unknown as ItemType[]));
          break;
        }

        // Handle empty responses
        if (!pageItems?.length) break;

        items.push(...pageItems);

        // OVERRIDABLE: Check if there are more pages
        if (!this.hasMorePages(response, currentParams, items, options)) {
          break;
        }

        // OVERRIDABLE: Get next page path (for URL-based pagination like Figma)
        const nextPath = this.getNextPagePath(response, currentPath);
        if (nextPath !== currentPath) {
          currentPath = nextPath;
        }

        // OVERRIDABLE: Build next page params
        const nextParams = this.getNextPageParams(response, currentParams, options);
        if (!nextParams) break;

        currentParams = nextParams;

        // Delay between requests
        if (items.length < maxResults) {
          await delay(fetchDelay);
        }
      }

      // Return up to maxResults
      return items.slice(0, maxResults);
    } catch (error) {
      Debugger.log(`Error fetching paginated ${this.config.appName} records`, error);
      // Return what we got so far (graceful degradation)
      return items;
    }
  }

  /**
   * Fetch allowed values for Qorus options
   */
  async fetchAllowedValues<ItemType = unknown>(
    options: AllowedValuesOptions<ItemType>
  ): Promise<IQoreAllowedValue<any>[]> {
    const { mapItemToAllowedValue, filterItems } = options;

    const items = await this.fetchPaginated<ItemType>(options);

    // OVERRIDABLE: Filter items before mapping
    const filteredItems = filterItems ? items.filter(filterItems) : items;

    return filteredItems.map(mapItemToAllowedValue);
  }

  // ============================================================================
  // OVERRIDABLE METHODS - Apps customize these
  // ============================================================================

  /**
   * Format path for API request
   * Override for custom path formatting (version prefixes, trailing slashes, etc.)
   *
   * @example
   * ```typescript
   * // Attio: Force v2 prefix
   * protected formatPath(path: string): string {
   *   let clean = path.trim().replace(/^\/+/, '');
   *   if (!clean.startsWith('v2/')) {
   *     clean = `v2/${clean}`;
   *   }
   *   return `/${clean}`;
   * }
   *
   * // Baserow: Add api/ prefix and trailing slash
   * protected formatPath(path: string): string {
   *   let clean = path.trim().replace(/^\/+/, '');
   *   if (!clean.endsWith('/')) clean = `${clean}/`;
   *   if (!clean.startsWith('api/')) clean = `api/${clean}`;
   *   return `/${clean}`;
   * }
   * ```
   */
  protected formatPath(path: string, baseUrl?: string): string {
    const formattedPath = path.trim().replace(/^\/+/, '');

    if (baseUrl?.endsWith('/')) {
      return formattedPath;
    }
    return `/${formattedPath}`;
  }

  /**
   * Get base URL for request
   * Override for dynamic URLs (multi-instance support)
   *
   * @example
   * ```typescript
   * // For multi-tenant apps like Active Campaign
   * protected getBaseUrl(options: RequestOptions): string {
   *   return options.connectionOptions?.url || 'https://default-url.com';
   * }
   * ```
   */
  protected getBaseUrl(options: RequestOptions): string {
    if (typeof this.config.baseUrl === 'function') {
      return this.config.baseUrl(options.connectionOptions);
    }
    return this.config.baseUrl;
  }

  /**
   * Build request headers
   * Override for custom authentication patterns
   *
   * @example
   * ```typescript
   * // Bearer token (default)
   * protected buildHeaders(token?: string, customHeaders?: Record<string, string>) {
   *   return {
   *     Authorization: `Bearer ${token}`,
   *     ...customHeaders,
   *   };
   * }
   *
   * // API token header (Active Campaign, BigML)
   * protected buildHeaders(token?: string, customHeaders?: Record<string, string>) {
   *   return {
   *     'Api-Token': token,
   *     ...customHeaders,
   *   };
   * }
   *
   * // Token prefix (Baserow)
   * protected buildHeaders(token?: string, customHeaders?: Record<string, string>) {
   *   return {
   *     Authorization: `Token ${token}`,
   *     ...customHeaders,
   *   };
   * }
   *
   * // Custom version headers (LinkedIn Organizations)
   * protected buildHeaders(token?: string, customHeaders?: Record<string, string>) {
   *   return {
   *     'LinkedIn-Version': '202401',
   *     Authorization: `Bearer ${token}`,
   *     ...customHeaders,
   *   };
   * }
   * ```
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    // Default: Bearer token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Merge custom headers
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Process response before returning
   * Override for custom response transformation
   *
   * @example
   * ```typescript
   * // Craft content extraction
   * protected processResponse<T>(response: QorusResponse<T>, options: RequestOptions): T {
   *   let data = super.processResponse(response, options);
   *
   *   if (options.extractContent) {
   *     data = this.extractCraftBlockContent(data);
   *   }
   *
   *   return data;
   * }
   * ```
   */
  protected processResponse<T>(response: QorusResponse<T>, options: RequestOptions): T {
    let data = response.data;

    // OVERRIDABLE: Extract object from response
    if (options.objectPath) {
      data = get(data, options.objectPath);
    }

    // OVERRIDABLE: Omit keys from response
    const omitKeys = this.getResponseOmitKeys();
    if (omitKeys.length > 0 && typeof data === 'object' && data !== null) {
      data = omit(data as any, omitKeys) as T;
    }

    // Include response headers if requested
    if (options.includeHeaders && response.headers) {
      return { data, headers: response.headers } as T;
    }

    return data;
  }

  /**
   * Get keys to omit from responses
   * Override to remove API-specific metadata keys
   *
   * @example
   * ```typescript
   * // HelpScout and Front: Remove HAL _links
   * protected getResponseOmitKeys(): string[] {
   *   return ['_links'];
   * }
   * ```
   */
  protected getResponseOmitKeys(): string[] {
    return []; // Default: don't omit anything
  }

  /**
   * Handle request errors
   * Override for custom error handling
   *
   * @example
   * ```typescript
   * // Custom error handling
   * protected handleError(error: any, context: ErrorContext): never {
   *   if (error.response?.statusText) {
   *     throw new Error(`API error: ${error.response.statusText}`);
   *   }
   *   throw error;
   * }
   * ```
   */
  protected handleError(error: any, context: ErrorContext): never {
    const message = `Error calling ${this.config.appName} API for ${context.baseUrl}${context.path}: ${error.message || error}`;
    Debugger.log(message, error);
    throw new Error(message);
  }

  /**
   * Extract items from paginated response
   * Override for custom response structures
   *
   * @example
   * ```typescript
   * // HelpScout: Try _embedded first, fallback to direct path
   * protected extractItems<T>(response: any, options: PaginatedRequestOptions): T[] {
   *   const itemsPath = options.itemsPath || 'results';
   *   const embedded = get(response, `_embedded.${itemsPath}`);
   *   if (embedded) return embedded;
   *   return get(response, itemsPath) || [];
   * }
   *
   * // Browse AI: Nested structure
   * protected extractItems<T>(response: any, options: PaginatedRequestOptions): T[] {
   *   const itemsPath = options.itemsPath || 'result';
   *   return get(response, `${itemsPath}.items`) || [];
   * }
   * ```
   */
  protected extractItems<ItemType>(response: any, options: PaginatedRequestOptions): ItemType[] {
    const itemsPath = options.itemsPath || this.getDefaultItemsPath();

    // Try _embedded first (HAL pattern - HelpScout, Front)
    const embedded = get(response, `_embedded.${itemsPath}`);
    if (embedded) return embedded;

    // Direct path
    return get(response, itemsPath) || [];
  }

  /**
   * Get default path to items in response
   * Override for app-specific defaults
   */
  protected getDefaultItemsPath(): string {
    return 'results';
  }

  /**
   * Check if there are more pages to fetch
   * Override for custom pagination completion logic
   *
   * @example
   * ```typescript
   * // Page-based (HelpScout)
   * protected hasMorePages(response: any, currentParams: any): boolean {
   *   const totalPages = get(response, 'page.total_pages');
   *   const currentPage = currentParams.page || 1;
   *   return currentPage < totalPages;
   * }
   *
   * // Offset-based (Active Campaign)
   * protected hasMorePages(response: any, params: any, items: any[]): boolean {
   *   const total = get(response, 'meta.total');
   *   return items.length < total;
   * }
   *
   * // Cursor-based (Pipedrive)
   * protected hasMorePages(response: any): boolean {
   *   return !!get(response, 'additional_data.next_cursor');
   * }
   *
   * // URL-based (Front, Figma)
   * protected hasMorePages(response: any): boolean {
   *   return !!get(response, '_pagination.next');
   * }
   * ```
   */
  protected hasMorePages(
    response: any,
    currentParams: Record<string, any>,
    items: any[],
    options: PaginatedRequestOptions
  ): boolean {
    // Default: check page.total_pages
    const totalPages = get(response, 'page.total_pages');
    if (totalPages !== undefined) {
      const currentPage = currentParams.page || 1;
      return currentPage < totalPages && items.length < (options.maxResults || 500);
    }

    return false;
  }

  /**
   * Get next page path (for URL-based pagination like Figma)
   * Override for APIs that return full URLs for next page
   *
   * @example
   * ```typescript
   * // Figma: Extract path from full URL
   * protected getNextPagePath(response: any, currentPath: string): string {
   *   const nextPage = get(response, 'pagination.next_page');
   *   if (!nextPage) return currentPath;
   *
   *   const url = new URL(nextPage);
   *   return url.pathname + url.search;
   * }
   * ```
   */
  protected getNextPagePath(_response: any, currentPath: string): string {
    // Default: path doesn't change
    return currentPath;
  }

  /**
   * Build parameters for next page request
   * Override for custom pagination parameter building
   *
   * @example
   * ```typescript
   * // Offset-based (Active Campaign)
   * protected getNextPageParams(response: any, params: any): any {
   *   const offset = (params.offset || 0) + (params.limit || 100);
   *   return { ...params, offset };
   * }
   *
   * // Cursor-based (Pipedrive)
   * protected getNextPageParams(response: any, params: any): any {
   *   const cursor = get(response, 'additional_data.next_cursor');
   *   return cursor ? { ...params, cursor } : null;
   * }
   *
   * // Token extraction from URL (Front)
   * protected getNextPageParams(response: any, params: any): any {
   *   const nextUrl = get(response, '_pagination.next');
   *   if (!nextUrl) return null;
   *
   *   const url = new URL(nextUrl);
   *   const pageToken = url.searchParams.get('page_token');
   *   return pageToken ? { ...params, page_token: pageToken } : null;
   * }
   *
   * // Custom param names (CopperCRM)
   * protected getNextPageParams(response: any, params: any): any {
   *   const pageNumber = (params.page_number || 1) + 1;
   *   return {
   *     page_size: params.page_size || 200,
   *     page_number: pageNumber,
   *   };
   * }
   * ```
   */
  protected getNextPageParams(
    _response: any,
    currentParams: Record<string, any>,
    _options: PaginatedRequestOptions
  ): Record<string, any> | null {
    // Default: increment page number
    const page = (currentParams.page || 1) + 1;
    return { ...currentParams, page };
  }

  /**
   * Get initial pagination parameters
   * Override for custom initial params (page vs offset vs cursor)
   *
   * @example
   * ```typescript
   * // Offset-based (Active Campaign)
   * protected getInitialPaginationParams(options: any): any {
   *   return {
   *     offset: 0,
   *     limit: options.limit || 100,
   *     ...options.params,
   *   };
   * }
   *
   * // Cursor-based (Attio)
   * protected getInitialPaginationParams(options: any): any {
   *   return {
   *     limit: options.limit || 50,
   *     ...options.params,
   *   };
   * }
   *
   * // Custom names (CopperCRM)
   * protected getInitialPaginationParams(options: any): any {
   *   return {
   *     page_number: 1,
   *     page_size: options.limit || 200,
   *     ...options.params,
   *   };
   * }
   * ```
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, any> {
    return {
      page: 1,
      size: options.limit || this.getDefaultPageSize(),
      ...options.params,
    };
  }

  /**
   * Get default page size for pagination
   * Override per app (ranges from 50-200 across apps)
   */
  protected getDefaultPageSize(): number {
    return 100;
  }

  /**
   * Extract total count from response (optional)
   * Override for APIs that provide total count
   */
  protected getTotalCount(response: any): number | undefined {
    return get(response, 'page.total_pages') || get(response, 'meta.total');
  }

  // ============================================================================
  // INTERNAL HELPERS - Not meant to be overridden
  // ============================================================================

  private async makeQorusRequest<T>(options: {
    method: HttpMethod;
    path: string;
    headers: Record<string, string>;
    params?: Record<string, any>;
    body?: any;
    endpointData: { url: string; endpointId: string };
  }): Promise<QorusResponse<T>> {
    const { method, path, headers, params, body, endpointData } = options;

    const requestConfig = {
      headers,
      path,
      ...(params && { params }),
      ...(body && { data: body }),
    };

    switch (method) {
      case 'GET':
        return await QorusRequest.get<QorusResponse<T>>(requestConfig, endpointData);
      case 'POST':
        return await QorusRequest.post<QorusResponse<T>>(requestConfig, endpointData);
      case 'PUT':
        return await QorusRequest.put<QorusResponse<T>>(requestConfig, endpointData);
      case 'PATCH':
        return await QorusRequest.patch<QorusResponse<T>>(requestConfig, endpointData);
      case 'DELETE':
        return await QorusRequest.deleteReq<QorusResponse<T>>(requestConfig, endpointData);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
