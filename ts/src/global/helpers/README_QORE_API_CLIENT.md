# QoreApiClient - Class-Based HTTP Client

## What Is This?

`QoreApiClient` is an extensible base class that apps can extend to create custom HTTP clients. It eliminates the need for each app to maintain 200-300 lines of duplicated HTTP client code.

## Current Situation

**14+ apps currently have custom client functions** in their `helpers/constants.ts` files:
- Front (~236 lines)
- HelpScout (~242 lines)
- Active Campaign (~177 lines)
- CopperCRM (~273 lines)
- Pipedrive (~280 lines)
- Figma (~190 lines)
- And 8+ more...

**Total: ~3,000 lines of mostly duplicated code**

## The Solution

Instead of maintaining custom client functions, apps extend `QoreApiClient` and override only what they need.

## How To Use

### 1. Create App Client Class

```typescript
// src/apps/myapp/client.ts
import { QoreApiClient } from '../../global/helpers/QoreApiClient';

export class MyAppApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.myapp.com',
      appName: 'myapp',
    });
  }

  // Override only what's different from defaults
  protected buildHeaders(token?: string) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  protected getDefaultPageSize() {
    return 100;
  }
}

export const myAppClient = new MyAppApiClient();
```

### 2. Use in Actions

```typescript
// src/apps/myapp/actions/get-users.ts
import { myAppClient } from '../client';

export const getUsers = async (context: TQoreAppActionFunctionContext) => {
  const { token } = context.conn_opts;

  // GET request
  const user = await myAppClient.get('users/123', { token });

  // POST request
  const newUser = await myAppClient.post('users', { name: 'John', email: 'john@example.com' }, { token });

  // PUT request
  const updatedUser = await myAppClient.put('users/123', { name: 'Jane' }, { token });

  // PATCH request
  const patchedUser = await myAppClient.patch('users/123', { email: 'new@example.com' }, { token });

  // DELETE request
  await myAppClient.delete('users/456', { token });

  // Paginated request
  const allUsers = await myAppClient.fetchPaginated({
    token,
    path: 'users',
    maxResults: 500,
  });

  return allUsers;
};
```

## Migration Examples

### Example 1: HelpScout (Simple)

**Before** (242 lines in `helpers/constants.ts`):
```typescript
export async function helpScoutApiClient<ResponseType>(options: THelpScoutRequestOptions): Promise<ResponseType> {
  // ~150 lines of request logic
}

export const fetchHelpScoutPaginatedRecords = async <ItemType>(options: THelpScoutPaginatedOptions): Promise<ItemType[]> {
  // ~90 lines of pagination logic
}
```

**After** (30 lines in new `client.ts`):
```typescript
import { QoreApiClient } from '../../global/helpers/QoreApiClient';

export class HelpScoutApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api.helpscout.net',
      appName: 'helpscout',
    });
  }

  protected buildHeaders(token?: string) {
    return { Authorization: `Bearer ${token}` };
  }

  protected getResponseOmitKeys() {
    return ['_links'];
  }

  protected getDefaultPageSize() {
    return 200;
  }
}

export const helpScoutClient = new HelpScoutApiClient();
```

**Savings: 212 lines (87% reduction)**

### Example 2: Front (Token-Based Pagination)

**After** (60 lines):
```typescript
import { get } from 'lodash';
import { QoreApiClient, PaginatedRequestOptions } from '../../global/helpers/QoreApiClient';

export class FrontApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: 'https://api2.frontapp.com',
      appName: 'front',
    });
  }

  protected buildHeaders(token?: string) {
    return { Authorization: `Bearer ${token}` };
  }

  protected getDefaultItemsPath() {
    return '_results';
  }

  protected getResponseOmitKeys() {
    return ['_links'];
  }

  protected hasMorePages(response: any): boolean {
    return !!get(response, '_pagination.next');
  }

  protected getNextPageParams(response: any, params: any): Record<string, any> | null {
    const nextUrl = get(response, '_pagination.next');
    if (!nextUrl) return null;

    // Extract page_token from URL
    const urlObj = new URL(nextUrl);
    const pageToken = urlObj.searchParams.get('page_token');
    return pageToken ? { ...params, page_token: pageToken } : null;
  }

  protected getInitialPaginationParams(options: PaginatedRequestOptions) {
    return {
      size: 100,
      ...options.params,
    };
  }
}

export const frontClient = new FrontApiClient();
```

**Savings: 176 lines (75% reduction)**

### Example 3: Pipedrive (Dual Pagination)

**After** (100 lines):
```typescript
import { get } from 'lodash';
import { QoreApiClient, PaginatedRequestOptions } from '../../global/helpers/QoreApiClient';

export class PipedriveApiClient extends QoreApiClient {
  private useCursorPagination = false;

  constructor() {
    super({
      baseUrl: 'https://api.pipedrive.com/v1',
      appName: 'pipedrive',
    });
  }

  protected getDefaultItemsPath() {
    return 'data';
  }

  protected hasMorePages(response: any): boolean {
    // Auto-detect pagination style
    if (response.additional_data?.next_cursor !== undefined) {
      this.useCursorPagination = true;
      return !!response.additional_data.next_cursor;
    }
    return !!get(response, 'additional_data.pagination.more_items_in_collection');
  }

  protected getNextPageParams(response: any, params: any): Record<string, any> | null {
    if (this.useCursorPagination) {
      const cursor = get(response, 'additional_data.next_cursor');
      return cursor ? { ...params, cursor } : null;
    }

    // Offset-based fallback
    const start = (params.start || 0) + (params.limit || 100);
    return { ...params, start };
  }

  protected getInitialPaginationParams(options: PaginatedRequestOptions) {
    this.useCursorPagination = false;
    return {
      limit: options.limit || 100,
      start: 0,
      ...options.params,
    };
  }
}

export const pipedriveClient = new PipedriveApiClient();
```

**Savings: 180 lines (64% reduction)**

## Overridable Methods Reference

| Method | When to Override | Example |
|--------|------------------|---------|
| `formatPath(path)` | Need version prefix, trailing slash | Attio: force `/v2/` prefix |
| `buildHeaders(token)` | Custom auth headers | Active Campaign: `'Api-Token': token` |
| `getBaseUrl(options)` | Multi-instance support | Use `options.url` |
| `extractItems(response)` | Custom response structure | HelpScout: try `_embedded` first |
| `hasMorePages(response)` | Pagination completion logic | Front: check `_pagination.next` |
| `getNextPageParams(response)` | Build next page params | Extract cursor/token from response |
| `getNextPagePath(response)` | URL-based pagination | Figma: extract path from full URL |
| `getInitialPaginationParams(options)` | Initial params | Offset vs page vs cursor |
| `getDefaultItemsPath()` | Default items path | Front: `'_results'` |
| `getDefaultPageSize()` | Page size | HelpScout: `200` |
| `getResponseOmitKeys()` | Remove metadata | HelpScout/Front: `['_links']` |
| `processResponse(response)` | Transform response | Custom extraction logic |
| `handleError(error)` | Custom error handling | Throw custom error class |

## Pagination Patterns Supported

### Page-based (HelpScout, Baserow)
```typescript
protected getInitialPaginationParams(options: any) {
  return { page: 1, size: 200, ...options.params };
}

protected getNextPageParams(_response: any, params: any) {
  return { ...params, page: (params.page || 1) + 1 };
}

protected hasMorePages(response: any, params: any): boolean {
  const totalPages = get(response, 'page.total_pages');
  return (params.page || 1) < totalPages;
}
```

### Offset-based (Active Campaign, BigML)
```typescript
protected getInitialPaginationParams(options: any) {
  return { offset: 0, limit: 100, ...options.params };
}

protected getNextPageParams(_response: any, params: any) {
  const offset = (params.offset || 0) + (params.limit || 100);
  return { ...params, offset };
}

protected hasMorePages(_response: any, _params: any, items: any[], options: any): boolean {
  const total = get(_response, 'meta.total');
  return items.length < total && items.length < options.maxResults;
}
```

### Cursor-based (Pipedrive, Canva)
```typescript
protected getInitialPaginationParams(options: any) {
  return { limit: 100, ...options.params };
}

protected getNextPageParams(response: any, params: any) {
  const cursor = get(response, 'additional_data.next_cursor');
  return cursor ? { ...params, cursor } : null;
}

protected hasMorePages(response: any): boolean {
  return !!get(response, 'additional_data.next_cursor');
}
```

### Token-based (Front)
```typescript
protected getNextPageParams(response: any, params: any) {
  const nextUrl = get(response, '_pagination.next');
  if (!nextUrl) return null;

  const urlObj = new URL(nextUrl);
  const pageToken = urlObj.searchParams.get('page_token');
  return pageToken ? { ...params, page_token: pageToken } : null;
}
```

### URL-based (Figma)
```typescript
protected getNextPagePath(response: any, _currentPath: string): string {
  const nextPage = get(response, 'pagination.next_page');
  if (!nextPage) return _currentPath;

  const url = new URL(nextPage);
  return url.pathname + url.search;
}

protected hasMorePages(response: any): boolean {
  return !!get(response, 'pagination.next_page');
}
```

## Expected Impact

| App | Current Lines | New Lines | Savings | Reduction |
|-----|---------------|-----------|---------|-----------|
| HelpScout | 242 | 30 | 212 | 87% |
| Front | 236 | 60 | 176 | 75% |
| Active Campaign | 177 | 50 | 127 | 72% |
| CopperCRM | 273 | 80 | 193 | 71% |
| Pipedrive | 280 | 100 | 180 | 64% |
| Figma | 190 | 50 | 140 | 74% |
| Craft | 244 | 60 | 184 | 75% |
| Baserow | 211 | 40 | 171 | 81% |
| **Total** | **~2,500** | **~600** | **~1,900** | **76%** |

## Migration Steps

1. **Create client class** in `src/apps/{app}/client.ts`
2. **Update imports** in actions from `../helpers/constants` to `../client`
3. **Update usage** from `myAppApiClient({...})` to `myAppClient.request({...})`
4. **Remove old functions** from `helpers/constants.ts`
5. **Test** with real API calls

## Files

- **Implementation:** `src/global/helpers/QoreApiClient.ts`
- **Tests:** `src/tests/qore-api-client.test.ts` (✅ 6/6 passing)
- **This Guide:** `src/global/helpers/README_QORE_API_CLIENT.md`

## Next Steps

**Pilot Migration:** Start with HelpScout (simplest, 87% reduction, ~1-2 hours)
