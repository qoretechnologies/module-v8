Copyright 2026 Qore Technologies, s.r.o.

# Standard App Development Guide

This guide covers building apps that use either the QoreApiClient unified client or a third-party
library for API communication. This is the most common pattern, used by the majority of apps.

See also:
- [ts-integration-architecture.md](ts-integration-architecture.md) — high-level overview
- [triggers-and-events-guide.md](triggers-and-events-guide.md) — trigger implementation
- [ts-integration-checklist.md](ts-integration-checklist.md) — verification checklist

---

## Section A: Unified Client Pattern (QoreApiClient)

The unified client pattern provides a reusable, type-safe HTTP client with built-in pagination,
authentication, and error handling. Apps extend `QoreApiClient` and override only the methods
their API requires.

**Base class:** `src/global/helpers/QoreApiClient.ts`

### Basic Pattern — Survey Monkey Reference

Survey Monkey demonstrates the correct minimal implementation. Key principles:

1. **Minimal overrides** — only override what the API actually requires
2. **Single import point** — re-export the client from `helpers/constants.ts`
3. **Use `fetchAllowedValues()`** — not raw `fetchPaginated()` for allowed values
4. **Consistent token passing** — always `{ token }` in the options object
5. **Clean separation** — client (HOW to call) → helpers (WHAT to fetch) → actions (WHEN to fetch)
6. **No circular dependencies** — unidirectional import flow

**Reference files:**
- `src/apps/survey-monkey/client.ts` — client with 5 minimal overrides
- `src/apps/survey-monkey/helpers/constants.ts` — re-exports client as single import point
- `src/apps/survey-monkey/helpers/get-survey-allowed-values.ts` — uses `client.fetchAllowedValues()`
- `src/apps/survey-monkey/actions/` — all import client from `../helpers/constants`
- `src/apps/survey-monkey/index.ts` — clean app configuration

### Advanced Pattern — Dropbox Reference

When an API has complex requirements beyond what the base class supports, add custom methods
to the client class. Dropbox adds `fetchWithCursor()`, `uploadContent()`, and `downloadContent()`
for its non-standard pagination and file handling.

**Reference files:**
- `src/apps/dropbox/client.ts` — custom methods on top of QoreApiClient
- `src/apps/dropbox/helpers/get-file-allowed-values.ts` — uses `dropboxClient.fetchWithCursor()`
- `src/apps/dropbox/actions/upload-file.action.ts` — uses `dropboxClient.uploadContent()`

**When to add custom methods:**
- The API uses non-standard pagination (cursor with separate continue endpoints)
- File upload/download requires special headers or body formats
- The API has dual base URLs for different operation types
- Standard `get()`/`post()` methods cannot express the required behavior

### QoreApiClient Overridable Methods

All methods have sensible defaults. Only override what your API requires.

| Method | Default | Override when |
|--------|---------|--------------|
| `formatPath(path, baseUrl)` | Strips leading `/`, adds `/` prefix | API needs version prefix, trailing slash |
| `getBaseUrl(options)` | Returns `config.baseUrl` | Dynamic URLs (multi-tenant, subdomain-based) |
| `buildHeaders(token, customHeaders)` | Bearer token auth | API-Key header, Token prefix, custom headers |
| `processResponse(response, options)` | Returns `response.data` | Custom response extraction/transformation |
| `getResponseOmitKeys()` | Empty array | Remove API metadata (`_links`, `_meta`) |
| `handleError(error, context)` | Throws with context message | Custom error parsing, app-specific errors |
| `extractItems(response, options)` | `response[itemsPath]` with `_embedded` fallback | Non-standard response structures |
| `getDefaultItemsPath()` | `'results'` | Items in `'data'`, `'items'`, `'records'` |
| `hasMorePages(response, params, items, options)` | Check `page.total_pages` | Cursor, offset, token-based pagination |
| `getNextPageParams(response, params, options)` | Increment `page` | Cursor token, offset increment, URL extraction |
| `getInitialPaginationParams(options)` | `{ page: 1, size: pageSize }` | `per_page`, `offset: 0`, custom param names |
| `getDefaultPageSize()` | `100` | API-specific page size limits |
| `getNextPagePath(response, currentPath)` | Returns same path | URL-based pagination (full URL in response) |
| `getTotalCount(response)` | Check `page.total_pages` or `meta.total` | Custom total count location |

See `src/global/helpers/QoreApiClient.ts` for the full source with inline examples for each method.

### Pagination Patterns

The base class supports all pagination patterns through method overrides:

**Page-based** (Survey Monkey): Override `hasMorePages`, `getNextPageParams`, `getInitialPaginationParams`
- See: `src/apps/survey-monkey/client.ts`

**Cursor-based** (Slack): Override `hasMorePages` to check cursor, `getNextPageParams` to pass cursor
- See: `src/apps/slack/client.ts`

**Offset-based** (Active Campaign): Override with offset increment logic
- See: `src/apps/active-campaign/client.ts`

**Token/URL-based** (Front): Override `getNextPageParams` to extract token from next URL
- See: `src/apps/front/client.ts`

**Custom cursor with continue endpoint** (Dropbox): Add `fetchWithCursor()` custom method
- See: `src/apps/dropbox/client.ts`

### Public API Methods

```typescript
// Single requests
client.get<T>(path, options?)
client.post<T>(path, body?, options?)
client.put<T>(path, body?, options?)
client.patch<T>(path, body?, options?)
client.delete<T>(path, options?)

// Paginated requests
client.fetchPaginated<T>(options)   // Returns T[]

// Allowed values (higher-level abstraction over fetchPaginated)
client.fetchAllowedValues<T>(options)  // Returns IQoreAllowedValue[]
```

**Always use `fetchAllowedValues()` for allowed value helpers** — it handles pagination and
mapping in one call. Do not use `fetchPaginated()` directly for this purpose.

---

## Section B: Third-Party Library Pattern

When a third-party SDK provides better type safety, authentication handling, or complex API
abstractions than raw HTTP calls, use the library directly.

### Google Ads Reference

Google Ads uses the `google-ads-api` SDK which provides strongly-typed operations for campaign
management, reporting, and resource manipulation.

**Reference files:**
- `src/apps/google-ads/client.ts` — initializes `GoogleAdsApi` client with OAuth2 credentials
- `src/apps/google-ads/actions/create-campaign.action.ts` — uses SDK methods
- `src/apps/google-ads/helpers/get-campaign-allowed-values.ts` — uses SDK for allowed values

### When to Use a Library

- The API has an official SDK with strong typing (Google APIs, Webflow, Klaviyo)
- Authentication is complex (OAuth2 with service accounts, API key rotation)
- The SDK provides abstractions that would be expensive to reimplement
- The API uses non-REST protocols (gRPC, GraphQL with codegen)

### Other Library-Based Apps

| App | Library | Notes |
|-----|---------|-------|
| Google Docs | `@googleapis/docs` | Google APIs pattern with `OAuth2Client` |
| Google Analytics | `@google-analytics/admin`, `@google-analytics/data` | Multiple client classes |
| Google Meet | `@googleapis/meet` | Same Google APIs pattern |
| Webflow | `webflow-api` | `WebflowClient` class |
| Klaviyo | `klaviyo-api` | Session-based auth, multiple API classes |

### Pattern

Initialize the library client in `client.ts` or `helpers/constants.ts`, export it for use
across actions and helpers. The client should handle authentication from connection options.

---

## Section C: Common Action Patterns

Actions are the core unit of functionality. Each action is a single API operation exposed to users.

### Creating an Action

Actions use `QoreAppCreator.createLocalizedAction`:

```typescript
import { QoreAppCreator } from '@qoretechnologies/ts-toolkit';

const options = {
  resource_id: {
    type: 'string',
    required: true,
    get_allowed_values: getResourceAllowedValues,
  },
  name: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const CreateResource = QoreAppCreator.createLocalizedAction<typeof options>({
  app: APP_NAME,
  action: 'create_resource',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ResourceResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, resource_id, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['resource_id', 'name'],
      ErrorClass: AppError,
    });

    return await client.post('resources', { resource_id, name }, { token });
  },
});

export default CreateResource;
```

See: `src/apps/survey-monkey/actions/create-survey.action.ts` for a complete example.

### Option Types

| Type | Description | UI Rendering |
|------|-------------|-------------|
| `'string'` | Text input | Text field |
| `'int'` | Integer | Number input |
| `'float'` | Decimal number | Number input |
| `'boolean'` | True/false | Toggle |
| `'date'` | ISO 8601 date | Date picker |
| `'hash'` | Object with fields | Nested form |
| `'list'` | Array | Multi-value input |
| `'any'` | Any type | Free-form input |
| `'file'` | File upload | File picker |

### Allowed Values

**Static allowed values** — for fixed option sets:

```typescript
const STATUS_VALUES = [
  { value: 'active', display_name: 'Active' },
  { value: 'paused', display_name: 'Paused' },
] satisfies IQoreAllowedValue<string>[];
```

**Dynamic allowed values** — for values fetched from the API:

```typescript
const options = {
  survey_id: {
    type: 'string',
    required: true,
    get_allowed_values: getSurveyAllowedValues,
  },
};
```

See: `src/apps/survey-monkey/helpers/get-survey-allowed-values.ts` for the correct pattern
using `client.fetchAllowedValues()`.

**List element allowed values** — for list options where each element has finite choices:

```typescript
const options = {
  tags: {
    type: { type: 'list', element_type: 'string' },
    get_element_allowed_values: getTagAllowedValues,
    element_allowed_values_creatable: true,  // users can also type custom values
  },
};
```

### Dynamic Types

When an option's type depends on another option's value:

```typescript
const options = {
  table: {
    type: 'string',
    required: true,
    get_allowed_values: getTableAllowedValues,
    on_change: ['refetch'],  // triggers re-fetch of dependent options
  },
  fields: {
    type: 'hash',
    get_dynamic_type: async (context) => {
      const table = context?.opts?.table;
      // Return type based on selected table's schema
      return { type: 'hash', fields: await getTableFields(table, context) };
    },
  },
};
```

**Important:** The parent option must have `on_change: ['refetch']` for the UI to update
dependent options when the parent value changes.

### Dependent Options

When one option logically affects another:

```typescript
const options = {
  campaign_id: {
    type: 'string',
    get_allowed_values: getCampaignAllowedValues,
    on_change: ['refetch'],  // REQUIRED: refreshes ad_group_id dropdown
  },
  ad_group_id: {
    type: 'string',
    get_allowed_values: async (context) => {
      const campaignId = context?.opts?.campaign_id;
      return getAdGroupAllowedValues(context, campaignId);
    },
  },
};
```

### Response Types

Define response types so downstream actions know the output shape:

```typescript
const ResourceResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string', display_name: 'ID', short_desc: 'Resource identifier' },
    name: { type: 'string', display_name: 'Name', short_desc: 'Resource name' },
    created_at: { type: 'string', display_name: 'Created At', short_desc: 'Creation timestamp' },
  },
} satisfies TQoreResponseType;
```

For list actions, wrap in a list type:

```typescript
const ListResponseType = {
  type: 'list',
  element_type: ResourceResponseType,
} satisfies TQoreResponseType;
```

See: `src/apps/survey-monkey/response-types/` for well-organized response type definitions.

### Error Handling

Always use the app-specific Error class and `getQoreContextRequiredValues`:

```typescript
import { getQoreContextRequiredValues } from '../../global/helpers';
import { AppError } from '../constants';

// In api_function:
const { token, resource_id } = getQoreContextRequiredValues({
  context: { ...context, opts: obj },
  connectionFields: ['token'],
  optionFields: ['resource_id'],
  ErrorClass: AppError,
});

try {
  return await client.get(`resources/${resource_id}`, { token });
} catch (error) {
  throw new AppError(`Failed to get resource: ${error.message || error}`);
}
```

`getQoreContextRequiredValues` validates that all required fields are present and throws
with a descriptive error listing missing fields.

See: `src/global/helpers/index.ts` for the implementation.

---

## Section D: Descriptions and Documentation (Markdown Support)

User-facing descriptions are a critical part of the integration UX. The `longDesc` field
supports **markdown formatting** — use it to provide rich documentation.

### When to Use Markdown in `longDesc`

- **Complex options**: explain format/structure with examples
- **Actions with constraints**: document limits, conditional requirements
- **Structured input** (GAQL queries, JSON, nested structures): include code block examples
- **Non-obvious behavior**: document edge cases
- **Complex actions**: explain what the action does step-by-step

### Rules

| Field | Format | Purpose |
|-------|--------|---------|
| `displayName` | Plain text | Concise label shown in UI |
| `shortDesc` | Plain text only | Brief description, no markdown |
| `longDesc` | **Markdown supported** | Detailed docs, examples, constraints |
| `event_info.desc` | Plain text | Trigger event description |

### Example

```typescript
longDesc: () => `Runs a custom Google Ads Query Language (GAQL) query.

**Query format:**
\`\`\`sql
SELECT campaign.name, metrics.clicks
FROM campaign
WHERE metrics.impressions > 100
ORDER BY metrics.clicks DESC
LIMIT 50
\`\`\`

**Important:**
- Maximum 10,000 rows returned per query
- Date ranges use \`segments.date\` field
- See [GAQL reference](https://developers.google.com/google-ads/api/docs/query/overview)`,
```

---

## Section E: Helpers

### Allowed Values Pattern

Create one file per allowed values function in `helpers/`:

```
helpers/
├── constants.ts                    # Re-exports client
├── get-survey-allowed-values.ts
├── get-collector-allowed-values.ts
└── get-contact-list-allowed-values.ts
```

**Correct pattern using `client.fetchAllowedValues()`:**

See: `src/apps/survey-monkey/helpers/get-survey-allowed-values.ts`

Key points:
- Type the function as `TQoreGetAllowedValuesFunction`
- Use `client.fetchAllowedValues()` with a typed mapping function
- Return `IQoreAllowedValue[]` with `value`, `display_name`, and optionally `desc`
- Return empty array on missing credentials (never throw to caller from allowed values)

**Static allowed values:**

```typescript
export const STATUS_ALLOWED_VALUES = [
  { value: 'active', display_name: 'Active' },
  { value: 'paused', display_name: 'Paused' },
  { value: 'archived', display_name: 'Archived' },
] satisfies IQoreAllowedValue<string>[];
```

### UX Requirements for Allowed Values

- Every option accepting an ID or resource reference **must** have `get_allowed_values`
- Users should never manually type resource IDs
- Include `display_name` that is descriptive (not just the raw ID)
- Include `desc` field for additional context (budget amount, status, creation date)

### Single Import Point

All actions and helpers should import the client from the same location.
The recommended pattern is to re-export from `helpers/constants.ts`:

```typescript
// helpers/constants.ts
export { surveyMonkeyClient } from '../client';
```

Then all imports use:
```typescript
import { surveyMonkeyClient } from '../helpers/constants';
```

This creates a clean, unidirectional dependency flow and makes refactoring easier.

---

## Section F: Constants

Every app has a `constants.ts` with:

```typescript
export const APP_NAME = 'MyApp';  // PascalCase

export const APP_LOGO = '...';  // Base64 encoded SVG

export class MyAppError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'MyAppError';
    this.errorCode = errorCode;
  }
}
```

For non-OAuth apps, also export connection options:

```typescript
export const MY_APP_CONN_OPTIONS = {
  apiKey: {
    type: 'string',
    sensitive: true,
  },
} satisfies TCustomConnOptions;
```

---

## Common Pitfalls

1. **Forgetting `helpers/constants.ts` re-export** — leads to scattered imports from `../client`
2. **Using `fetchPaginated()` for allowed values** — use `fetchAllowedValues()` instead
3. **Missing `on_change: ['refetch']`** — dependent dropdowns won't update in UI
4. **Using `any` type** — use `unknown` or specific types
5. **Missing locale entries** — run `yarn typesafe-i18n` and `yarn test:ci actions-catalogue`
6. **Not exporting from `actions/index.ts`** — action won't be registered
7. **Not adding to ActionsCatalogue** — app won't be loaded
8. **Missing `connectionMessage`** for non-OAuth apps — users won't know how to get credentials
9. **Raw IDs in allowed values** — always include descriptive `display_name`
10. **Throwing errors from allowed values helpers** — return empty array on missing credentials
