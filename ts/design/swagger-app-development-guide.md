Copyright 2026 Qore Technologies, s.r.o.

# Swagger-based App Development Guide

This guide covers building apps that auto-generate actions from OpenAPI/Swagger schemas. Instead
of writing individual action files, you provide the schema and configure allowed paths with
optional overrides for enhanced UX.

See also:
- [ts-integration-architecture.md](ts-integration-architecture.md) — high-level overview
- [standard-app-development-guide.md](standard-app-development-guide.md) — unified client pattern
- [ts-integration-checklist.md](ts-integration-checklist.md) — verification checklist

---

## Overview

Swagger-based apps use `buildActionsFromSwaggerSchema()` to automatically generate actions from
an OpenAPI schema. You control which paths/methods are exposed via `allowed-paths/`, and enhance
the auto-generated actions with `override_options` for better UX (allowed values, type corrections,
required fields).

**Reference:** `src/apps/confluence/` (pure swagger app)

---

## File Structure

```
src/apps/<app-name>/
├── constants.ts              # APP_NAME, conn options, logos, error class
├── index.ts                  # swagger config, rest config, rest_modifiers
├── allowed-paths/
│   ├── index.ts              # Combines all resource actions
│   └── <resource>.ts         # Per-resource path definitions
├── helpers/
│   ├── constants.ts          # Shared helpers, response converters
│   └── get-*-allowed-values.ts  # Dynamic allowed value helpers
└── triggers/                 # (optional)

src/schemas/<app>.swagger.json   # OpenAPI schema file
```

---

## Swagger Schema Configuration

### Single Schema

```typescript
// index.ts
export default (locale: Locales) =>
  ({
    // ... app metadata
    swagger: 'schemas/jira.swagger.json',
    swagger_options: {
      parse_flags: -1,  // or 128, depends on schema format
    },
  }) satisfies TQoreAppWithActions;
```

The schema file goes in `src/schemas/<app>.swagger.json`.

### Multiple Schemas

For apps with separate schemas per resource area:

```typescript
swagger_schema_map: {
  contacts: { swagger: 'schemas/hubspot/contacts.swagger.json' },
  companies: { swagger: 'schemas/hubspot/companies.swagger.json' },
  deals: { swagger: 'schemas/hubspot/deals.swagger.json' },
},
```

### swagger_options

| Option | Description |
|--------|-------------|
| `parse_flags` | Schema parsing flags (e.g., `-1` for all, `128` for lenient) |
| `utc_dates` | Convert dates to UTC |
| `query_date_format` | Date format for query parameters |

---

## Allowed Paths

Allowed paths define which API endpoints from the schema are exposed as actions, and what
HTTP methods are available for each.

### Structure

Each resource file defines a `TAllowedPaths` object and builds actions from it:

```typescript
import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import schema from '../../../schemas/app.swagger.json';
import { APP_NAME } from '../constants';

export const RESOURCE_ALLOWED_PATHS = {
  '/resources': {
    GET: {},                    // List resources
    POST: {},                   // Create resource
  },
  '/resources/{id}': {
    GET: {},                    // Get single resource
    PUT: {},                    // Update resource
    DELETE: {},                 // Delete resource
  },
} satisfies TAllowedPaths;

export const RESOURCE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: schema as any,
  allowedPaths: RESOURCE_ALLOWED_PATHS,
  app: APP_NAME,
});
```

See: `src/apps/confluence/allowed-paths/pages.ts` for a complete example.

### Combining Resources

The `allowed-paths/index.ts` combines all resource actions:

```typescript
export const APP_ACTIONS = [
  ...PAGES_ACTIONS,
  ...SPACES_ACTIONS,
  ...TASKS_ACTIONS,
] satisfies IQorePartialAppActionWithSwaggerPath[];
```

See: `src/apps/confluence/allowed-paths/index.ts`

---

## Override Options

Override options enhance auto-generated actions with better UX — adding allowed values,
correcting types, making fields required, etc.

### Adding Allowed Values

```typescript
'/resources/{id}': {
  GET: {
    override_options: {
      id: {
        type: 'softstring',
        get_allowed_values: getResourceIdAllowedValues,
      },
    },
  },
},
```

### Adding List Element Allowed Values

```typescript
'/resources': {
  GET: {
    override_options: {
      'space-id': {
        type: { type: 'list', element_type: 'softstring' },
        get_element_allowed_values: getSpaceIdAllowedValues,
      },
    },
  },
},
```

### Making Fields Required

```typescript
override_options: {
  title: {
    required: true,
  },
},
```

### Changing Types

```typescript
override_options: {
  id: {
    type: 'softstring',  // Override from auto-detected type
  },
},
```

### Complete Example

See: `src/apps/confluence/allowed-paths/pages.ts` — demonstrates all override patterns:
- `get_allowed_values` for page ID, space ID, label ID
- `get_element_allowed_values` for list-type space filters
- `required: true` for title field
- `type: 'softstring'` for ID fields
- `response_data_converter` for pagination response transformation

---

## Data Converters

Data converters transform requests before sending and responses after receiving.

### Response Data Converter

Transform the API response before returning to the user:

```typescript
'/resources': {
  GET: {
    response_data_converter: (response, context) => {
      // Extract items from nested pagination structure
      return response?.results || [];
    },
  },
},
```

### Request Data Converter

Transform the request before sending to the API:

```typescript
'/resources': {
  POST: {
    request_data_converter: (request, context) => {
      // Transform flat options into nested API structure
      return {
        ...request,
        body: {
          representation: 'storage',
          value: request.body,
        },
      };
    },
  },
},
```

### Global Converters

Apply to all actions via `buildActionsFromSwaggerSchema`:

```typescript
const ACTIONS = buildActionsFromSwaggerSchema({
  schema,
  allowedPaths: ALLOWED_PATHS,
  app: APP_NAME,
  globalResponseDataConverter: (response, ctx) => {
    // Applied to all responses, per-path converters run after
    return response;
  },
  globalRequestDataConverter: (request, ctx) => {
    // Applied to all requests, per-path converters run after
    return request;
  },
  globalOptionsOverride: {
    // Applied to all paths, per-path overrides take precedence
    some_field: { type: 'softstring' },
  },
});
```

### Processor

For complex per-path transformations that need access to the schema operation data:

```typescript
'/resources': {
  GET: {
    processor: (operationData: OpenAPIV2.OperationObject) => {
      // Return additional action properties based on schema data
      return {
        override_options: { /* dynamic overrides */ },
      };
    },
  },
},
```

---

## rest_modifiers

### Custom Connection Options

```typescript
rest_modifiers: {
  options: APP_CONN_OPTIONS,
  required_options: 'cloud_id,apiKey',
},
```

### Post-Auth Processing

Fetch additional data after OAuth authentication (e.g., tenant/cloud ID):

```typescript
rest_modifiers: {
  set_options_post_auth: async (context) => {
    const token = context?.conn_opts?.token;
    const accounts = await fetchAccessibleResources(token);
    const cloudId = accounts[0].id;

    return {
      cloud_id: cloudId,
      swagger_base_path: `/ex/app/${cloudId}/api/v2`,
    };
  },
},
```

See: `src/apps/confluence/index.ts` for a complete post-auth example.

### Dynamic swagger_base_path

When the API base path depends on connection options (tenant ID, region, etc.):

```typescript
rest_modifiers: {
  set_options_post_auth: async (context) => {
    return {
      swagger_base_path: `/ex/confluence/${cloudId}/wiki/api/v2`,
    };
  },
},
```

### URL Template Options

When the base URL or ping path contains dynamic values:

```typescript
rest: {
  url: 'https://{{subdomain}}.example.com',
  ping_path: '/{{company_domain}}/v1/ping',
},
rest_modifiers: {
  url_template_options: ['subdomain', 'company_domain'],
},
```

---

## Action Name Modifier

When using multiple schema maps, use `actionNameModifier` to namespace actions:

```typescript
const CONTACT_ACTIONS = buildActionsFromSwaggerSchema({
  schema: contactSchema,
  allowedPaths: CONTACT_PATHS,
  app: APP_NAME,
  actionNameModifier: 'contacts',  // Actions get '_contacts' suffix
});
```

---

## Common Pitfalls

1. **Missing schema file** — ensure `src/schemas/<app>.swagger.json` exists
2. **`parse_flags` not set** — some schemas need `-1` or `128` to parse correctly
3. **Allowed paths not matching schema** — paths must exactly match the schema's path strings
4. **Missing `swagger_base_path`** — if the API needs a dynamic base path, set it in `set_options_post_auth`
5. **Override options on wrong key** — the option key must match the parameter name in the schema
6. **Missing locale entries** — swagger actions still need locale entries for `displayName`, `shortDesc`, `longDesc`
7. **Allowed values helpers making raw API calls** — if the app has a client, use it; if not, use `QorusRequest` directly but follow the same return-empty-on-error pattern
