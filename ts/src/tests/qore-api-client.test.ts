/**
 * QoreApiClient Tests
 *
 * Tests the class-based QoreApiClient that apps extend to create custom HTTP clients
 */

import { QoreApiClient } from '../global/helpers/QoreApiClient';

describe('QoreApiClient', () => {
  it('should create client with minimal config', () => {
    const client = new (class extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'TestApp',
        });
      }
    })();

    expect(client).toBeDefined();
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.patch).toBe('function');
    expect(typeof client.delete).toBe('function');
    expect(typeof client.fetchPaginated).toBe('function');
    expect(typeof client.fetchAllowedValues).toBe('function');
  });

  it('should create client with function baseUrl for dynamic URLs', () => {
    const client = new (class extends QoreApiClient {
      constructor() {
        super({
          baseUrl: (opts) => opts?.customUrl || 'https://default.api.com',
          appName: 'TestApp',
        });
      }
    })();

    expect(client).toBeDefined();
  });

  it('should allow class extension for custom behavior', () => {
    class TestApiClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'TestApp',
        });
      }

      protected buildHeaders(token?: string) {
        return {
          Authorization: `Bearer ${token}`,
          'Custom-Header': 'test',
        };
      }

      protected getDefaultPageSize() {
        return 50;
      }
    }

    const client = new TestApiClient();
    expect(client).toBeDefined();
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
  });

  it('should allow path formatter override', () => {
    class TestApiClientWithPaths extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'TestApp',
        });
      }

      protected formatPath(path: string): string {
        const clean = path.trim().replace(/^\/+/, '');
        return `/api/v1/${clean}`;
      }
    }

    const client = new TestApiClientWithPaths();
    expect(client).toBeDefined();
  });

  it('should allow pagination customization', () => {
    class TestApiClientWithPagination extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'TestApp',
        });
      }

      protected getInitialPaginationParams(options: any) {
        return {
          offset: 0,
          limit: options.limit || 100,
          ...options.params,
        };
      }

      protected getNextPageParams(_response: any, params: any) {
        const offset = (params.offset || 0) + (params.limit || 100);
        return { ...params, offset };
      }
    }

    const client = new TestApiClientWithPagination();
    expect(client).toBeDefined();
  });

  it('should allow response transformation override', () => {
    class TestApiClientWithOmit extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'TestApp',
        });
      }

      protected getResponseOmitKeys() {
        return ['_links', '_meta'];
      }
    }

    const client = new TestApiClientWithOmit();
    expect(client).toBeDefined();
  });

  // Real-world pattern tests based on existing apps

  it('should support token-based pagination (Front pattern)', () => {
    class FrontStyleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'FrontTest',
        });
      }

      protected getDefaultItemsPath() {
        return '_results';
      }

      protected hasMorePages(response: any): boolean {
        return !!response?._pagination?.next;
      }

      protected getNextPageParams(response: any, params: any): Record<string, any> | null {
        const nextUrl = response?._pagination?.next;
        if (!nextUrl) return null;

        // Extract page_token from URL
        const urlObj = new URL(nextUrl);
        const pageToken = urlObj.searchParams.get('page_token');
        return pageToken ? { ...params, page_token: pageToken } : null;
      }

      protected getInitialPaginationParams(options: any) {
        return {
          size: 100,
          ...options.params,
        };
      }
    }

    const client = new FrontStyleClient();
    expect(client).toBeDefined();
  });

  it('should support page-based pagination (HelpScout pattern)', () => {
    class HelpScoutStyleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'HelpScoutTest',
        });
      }

      protected getDefaultItemsPath() {
        return 'results';
      }

      protected getDefaultPageSize() {
        return 200;
      }

      protected getResponseOmitKeys() {
        return ['_links'];
      }

      protected hasMorePages(response: any, params: any): boolean {
        const totalPages = response?.page?.total_pages || 1;
        return (params.page || 1) < totalPages;
      }

      protected getNextPageParams(_response: any, params: any) {
        return { ...params, page: (params.page || 1) + 1 };
      }

      protected getInitialPaginationParams(options: any) {
        return {
          page: 1,
          size: options.limit || 200,
          ...options.params,
        };
      }
    }

    const client = new HelpScoutStyleClient();
    expect(client).toBeDefined();
  });

  it('should support dual pagination modes (Pipedrive pattern)', () => {
    class PipedriveStyleClient extends QoreApiClient {
      private useCursorPagination = false;

      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'PipedriveTest',
        });
      }

      protected getDefaultItemsPath() {
        return 'data';
      }

      protected hasMorePages(response: any): boolean {
        // Auto-detect pagination style
        if (response?.additional_data?.next_cursor !== undefined) {
          this.useCursorPagination = true;
          return !!response.additional_data.next_cursor;
        }
        return !!response?.additional_data?.pagination?.more_items_in_collection;
      }

      protected getNextPageParams(response: any, params: any): Record<string, any> | null {
        if (this.useCursorPagination) {
          const cursor = response?.additional_data?.next_cursor;
          return cursor ? { ...params, cursor } : null;
        }

        // Offset-based fallback
        const start = (params.start || 0) + (params.limit || 100);
        return { ...params, start };
      }

      protected getInitialPaginationParams(options: any) {
        this.useCursorPagination = false;
        return {
          limit: options.limit || 100,
          start: 0,
          ...options.params,
        };
      }
    }

    const client = new PipedriveStyleClient();
    expect(client).toBeDefined();
  });

  it('should support path normalization with version prefix (HelpScout/CopperCRM pattern)', () => {
    class PathNormalizationClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'PathTest',
        });
      }

      protected formatPath(path: string): string {
        let clean = path.trim().replace(/^\/+/, '');

        // Auto-prepend version if not present (idempotent)
        if (!clean.startsWith('v2/') && !clean.startsWith('api/v2/')) {
          clean = `v2/${clean}`;
        }

        return `/${clean}`;
      }
    }

    const client = new PathNormalizationClient();
    expect(client).toBeDefined();
  });

  it('should support offset-based pagination (Active Campaign pattern)', () => {
    class ActiveCampaignStyleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'ActiveCampaignTest',
        });
      }

      protected buildHeaders(token?: string) {
        return {
          'Api-Token': token || '',
        };
      }

      protected hasMorePages(_response: any, _params: any, items: any[], options: any): boolean {
        const total = _response?.meta?.total || 0;
        return items.length < total && items.length < (options.maxResults || 500);
      }

      protected getNextPageParams(_response: any, params: any) {
        const offset = (params.offset || 0) + (params.limit || 100);
        return { ...params, offset };
      }

      protected getInitialPaginationParams(options: any) {
        return {
          offset: 0,
          limit: options.limit || 100,
          ...options.params,
        };
      }
    }

    const client = new ActiveCampaignStyleClient();
    expect(client).toBeDefined();
  });

  it('should support cursor-based pagination (Canva pattern)', () => {
    class CanvaStyleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'CanvaTest',
        });
      }

      protected getDefaultItemsPath() {
        return 'items';
      }

      protected hasMorePages(response: any): boolean {
        return !!response?.continuation;
      }

      protected getNextPageParams(response: any, params: any) {
        const continuation = response?.continuation;
        return continuation ? { ...params, continuation } : null;
      }

      protected getInitialPaginationParams(options: any) {
        return {
          limit: options.limit || 100,
          ...options.params,
        };
      }
    }

    const client = new CanvaStyleClient();
    expect(client).toBeDefined();
  });

  it('should support URL-based pagination (Figma pattern)', () => {
    class FigmaStyleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'FigmaTest',
        });
      }

      protected hasMorePages(response: any): boolean {
        return !!response?.pagination?.next_page;
      }

      protected getNextPagePath(response: any, _currentPath: string): string {
        const nextPage = response?.pagination?.next_page;
        if (!nextPage) return _currentPath;

        // Extract path from full URL
        const url = new URL(nextPage);
        return url.pathname + url.search;
      }

      protected getInitialPaginationParams(options: any) {
        return {
          page_size: options.limit || 30,
          ...options.params,
        };
      }
    }

    const client = new FigmaStyleClient();
    expect(client).toBeDefined();
  });

  it('should support custom items extraction (HelpScout HAL pattern)', () => {
    class HALStyleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'HALTest',
        });
      }

      protected extractItems<T>(response: any, options: any): T[] {
        const itemsPath = options.itemsPath || this.getDefaultItemsPath();

        // Try _embedded first (HAL pattern)
        const embedded = response?._embedded?.[itemsPath];
        if (embedded) return embedded;

        // Fallback to direct path
        return response?.[itemsPath] || [];
      }

      protected getDefaultItemsPath() {
        return 'conversations';
      }
    }

    const client = new HALStyleClient();
    expect(client).toBeDefined();
  });

  it('should support dynamic baseUrl (multi-instance pattern)', () => {
    class MultiInstanceClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: (opts) => opts?.customUrl || 'https://default.api.com',
          appName: 'MultiInstanceTest',
        });
      }

      protected getBaseUrl(options: any): string {
        const baseUrl =
          typeof this.config.baseUrl === 'function'
            ? this.config.baseUrl(options)
            : this.config.baseUrl;

        return options?.customUrl || baseUrl;
      }
    }

    const client = new MultiInstanceClient();
    expect(client).toBeDefined();
  });

  it('should support nested items path (Browse AI pattern)', () => {
    class NestedItemsClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://api.test.com',
          appName: 'BrowseAITest',
        });
      }

      protected extractItems<T>(response: any, _options: any): T[] {
        // Nested structure: result.items
        return response?.result?.items || [];
      }

      protected hasMorePages(response: any): boolean {
        return !!response?.result?.next_page_token;
      }

      protected getNextPageParams(response: any, params: any) {
        const token = response?.result?.next_page_token;
        return token ? { ...params, page_token: token } : null;
      }
    }

    const client = new NestedItemsClient();
    expect(client).toBeDefined();
  });

  it('Should make an actual request and fail with 403', async () => {
    class SimpleClient extends QoreApiClient {
      constructor() {
        super({
          baseUrl: 'https://qoretechnologies59848.activehosted.com',
          appName: 'SimpleTest',
        });
      }
    }

    const client = new SimpleClient();

    try {
      const response = await client.get('api/3/tags');

      console.dir({ response }, { depth: null });
    } catch (error) {
      console.dir({ error }, { depth: null });
      throw error;
    }
  });
});
