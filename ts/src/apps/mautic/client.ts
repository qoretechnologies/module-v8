import { QoreApiClient, PaginatedRequestOptions, BaseRequestOptions } from '../../global/helpers/QoreApiClient';

export class MauticApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: '',
      appName: 'mautic',
    });
  }

  /**
   * Get base URL from connection options
   */
  protected getBaseUrl(options: BaseRequestOptions): string {
    return options?.connectionOptions?.instance_url || '';
  }

  /**
   * Build Basic Auth headers
   */
  protected buildHeaders(
    _token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return {
      ...customHeaders,
    };
  }

  /**
   * Override get to inject Basic Auth headers
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const authHeaders = this.getBasicAuthHeaders(options?.connectionOptions);
    return super.get<ResponseType>(path, {
      ...options,
      headers: { ...authHeaders, ...options?.headers },
    });
  }

  /**
   * Override post to inject Basic Auth headers
   */
  async post<ResponseType = unknown>(
    path: string,
    body?: unknown,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const authHeaders = this.getBasicAuthHeaders(options?.connectionOptions);
    return super.post<ResponseType>(path, body, {
      ...options,
      headers: { ...authHeaders, ...options?.headers },
    });
  }

  /**
   * Override patch to inject Basic Auth headers
   */
  async patch<ResponseType = unknown>(
    path: string,
    body?: unknown,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const authHeaders = this.getBasicAuthHeaders(options?.connectionOptions);
    return super.patch<ResponseType>(path, body, {
      ...options,
      headers: { ...authHeaders, ...options?.headers },
    });
  }

  /**
   * Override delete to inject Basic Auth headers
   */
  async delete<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const authHeaders = this.getBasicAuthHeaders(options?.connectionOptions);
    return super.delete<ResponseType>(path, {
      ...options,
      headers: { ...authHeaders, ...options?.headers },
    });
  }

  /**
   * Helper to create Basic Auth headers
   */
  private getBasicAuthHeaders(connectionOptions?: Record<string, unknown>): Record<string, string> {
    const username = connectionOptions?.username as string;
    const password = connectionOptions?.password as string;

    if (username && password) {
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      return {
        Authorization: `Basic ${credentials}`,
      };
    }

    return {};
  }

  /**
   * Prepend /api/ to all paths
   */
  protected formatPath(path: string): string {
    const clean = path.trim().replace(/^\/+/, '');
    if (clean.startsWith('api/')) {
      return `/${clean}`;
    }
    return `/api/${clean}`;
  }

  /**
   * Mautic returns objects keyed by ID, convert to array
   */
  protected extractItems<ItemType>(response: unknown, options: PaginatedRequestOptions): ItemType[] {
    const itemsPath = options.itemsPath || this.getDefaultItemsPath();
    const data = (response as Record<string, unknown>)?.[itemsPath];

    if (Array.isArray(data)) {
      return data as ItemType[];
    }

    if (data && typeof data === 'object') {
      return Object.values(data) as ItemType[];
    }

    return [];
  }

  /**
   * Default items path for Mautic responses
   */
  protected getDefaultItemsPath(): string {
    return 'contacts';
  }

  /**
   * Check if more pages exist based on total count
   */
  protected hasMorePages(
    response: unknown,
    _params: Record<string, unknown>,
    items: unknown[],
    options: PaginatedRequestOptions
  ): boolean {
    const total = (response as Record<string, unknown>)?.total as number || 0;
    const maxResults = options.maxResults || 500;
    return items.length < total && items.length < maxResults;
  }

  /**
   * Offset-based pagination for Mautic
   */
  protected getNextPageParams(
    _response: unknown,
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const start = ((params.start as number) || 0) + ((params.limit as number) || 30);
    return { ...params, start };
  }

  /**
   * Initial pagination params with offset (Mautic uses 'start')
   */
  protected getInitialPaginationParams(options: PaginatedRequestOptions): Record<string, unknown> {
    return {
      start: 0,
      limit: options.limit || 30,
      ...options.params,
    };
  }
}

export const mauticClient = new MauticApiClient();
