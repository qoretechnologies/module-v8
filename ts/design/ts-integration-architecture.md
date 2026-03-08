Copyright 2026 Qore Technologies, s.r.o.

# TypeScript Integration Architecture

This document provides the high-level architecture of the TypeScript integrations module. It explains
how apps are loaded, the component model, connection configuration, localization, and the decision
matrix for choosing between integration patterns.

See also:
- [standard-app-development-guide.md](standard-app-development-guide.md) — unified client and library-based apps
- [swagger-app-development-guide.md](swagger-app-development-guide.md) — OpenAPI/Swagger-based apps
- [record-based-app-development-guide.md](record-based-app-development-guide.md) — table/row CRUD apps
- [triggers-and-events-guide.md](triggers-and-events-guide.md) — polling and webhook triggers
- [ts-integration-checklist.md](ts-integration-checklist.md) — pre-completion verification

---

## Overview

The TypeScript integrations module provides ~100 third-party app integrations running in V8 within
Qore. Each app exposes actions (API operations) and optionally triggers (event sources) that users
configure through a UI with dropdowns, forms, and response previews.

The module lives at `module-v8/ts/` and operates as a self-contained TypeScript project with its
own `package.json`, build system, test infrastructure, and localization.

---

## App Loading Flow

```
ActionsCatalogue/index.ts
    └─ imports all apps from src/apps/*/index.ts
         └─ each app exports: (locale: Locales) => TQoreAppWithActions
              ├─ mapActionsToApp(APP_NAME, actions, locale)  → localized actions
              ├─ mapTriggersToApp(APP_NAME, triggers, locale) → localized triggers
              └─ rest config (URL, auth, ping) → Qore data provider registration
```

**Key files:**
- `src/ActionsCatalogue/index.ts` — central registry; every new app must be added here
- `src/global/helpers/index.ts` — `mapActionsToApp`, `mapTriggersToApp`, `buildActionsFromSwaggerSchema`

**Verification command:**
```bash
yarn build && QORE_TYPESCRIPT_ACTION_VERBOSE=1 QORE_TYPESCRIPT_ACTION_SCRIPTS=./dist/index.js qdp ts-actions{}/<appname>
```
App name must be lowercase. If record-based, `"tables"` appears in the output.

---

## The Three Integration Patterns

### 1. Standard App (Unified Client or Third-Party Library)

Custom TypeScript actions that call APIs directly. Two sub-patterns:

**a) Unified Client (QoreApiClient)** — for REST APIs where you control the HTTP calls.
Extend `QoreApiClient`, override methods for auth/pagination/response handling.

Reference: `src/apps/survey-monkey/` (basic), `src/apps/dropbox/` (advanced)

**b) Third-Party Library** — for complex SDKs with typed operations.
Initialize the library client in `client.ts` or `helpers/constants.ts`, use it across actions.

Reference: `src/apps/google-ads/` (google-ads-api SDK)

### 2. Swagger-based App

Actions auto-generated from an OpenAPI/Swagger schema. You provide the schema, define allowed
paths, and optionally add override_options for enhanced UX.

Reference: `src/apps/confluence/` (pure swagger)

### 3. Record-based App

Adds table/row CRUD operations on top of either pattern above. The app exposes `get_table_list`,
`get_record_type`, `search_records`, `create_records`, `update_records`, `delete_records`.

Reference: `src/apps/freshdesk/helpers/record-based/`

### Decision Matrix

| Criteria | Standard (Client) | Standard (Library) | Swagger | Record-based |
|----------|-------------------|--------------------|---------|-------------|
| REST API, full control needed | Yes | — | — | — |
| Complex SDK available | — | Yes | — | — |
| OpenAPI spec available | — | — | Yes | — |
| Multi-entity CRUD (table/row) | — | — | — | Add on top |
| Custom pagination logic | Yes | Depends on lib | No | — |
| Dynamic allowed values | Yes (via client) | Yes (via lib) | Via override_options | — |

---

## Component Model

### Standard App File Structure

```
src/apps/<app-name>/
├── client.ts              # Extends QoreApiClient or wraps library
├── constants.ts           # APP_NAME, APP_LOGO (base64), Error class
├── index.ts               # App config: (locale) => TQoreAppWithActions
├── actions/
│   ├── index.ts           # Named exports of all actions
│   └── *.action.ts        # Individual actions
├── triggers/              # (optional)
│   ├── index.ts           # Named exports of all triggers
│   └── *.trigger.ts       # Individual triggers
├── helpers/
│   ├── constants.ts       # Re-exports client (single import point)
│   └── get-*-allowed-values.ts  # Dynamic allowed value helpers
└── response-types/
    ├── index.ts
    └── *.ts               # TypeScript interfaces for API responses
```

### Swagger-based App File Structure

```
src/apps/<app-name>/
├── constants.ts           # APP_NAME, conn options, logos
├── index.ts               # swagger: 'schemas/<app>.swagger.json'
├── allowed-paths/
│   ├── index.ts           # Combines all path exports
│   └── <resource>.ts      # Per-resource path definitions
├── helpers/               # Allowed values, converters
└── triggers/              # (optional)

src/schemas/<app>.swagger.json   # OpenAPI schema
```

### Key Components

**`constants.ts`** — Every app has one. Contains:
- `APP_NAME` constant (PascalCase, e.g., `'SurveyMonkey'`)
- `APP_LOGO` constant (base64-encoded SVG)
- Custom Error class extending `Error` with `this.name` set
- For non-OAuth apps: connection options with `satisfies TCustomConnOptions`

**`client.ts`** — For standard apps. Either:
- Extends `QoreApiClient` with minimal overrides (Survey Monkey pattern)
- Wraps a third-party library (Google Ads pattern)
- Exports a singleton instance for use across the app

**`index.ts`** — The app entry point:
```typescript
export default (locale: Locales) =>
  ({
    name: APP_NAME,
    display_name: L[locale].apps[APP_NAME].displayName(),
    short_desc: L[locale].apps[APP_NAME].shortDesc(),
    desc: L[locale].apps[APP_NAME].longDesc(),
    logo: APP_LOGO,
    logo_file_name: 'app-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(APP_NAME, ACTIONS, locale),
      ...mapTriggersToApp(APP_NAME, TRIGGERS, locale),
    ],
    rest: { /* connection config */ },
  }) satisfies TQoreAppWithActions;
```

See: `src/apps/survey-monkey/index.ts` for a clean example.

---

## Connection Configuration

### OAuth2 Apps

```typescript
rest: {
  url: 'https://api.example.com/v1',
  data: 'json',
  oauth2_grant_type: 'authorization_code',
  oauth2_auth_url: 'https://example.com/oauth/authorize',
  oauth2_token_url: 'https://example.com/oauth/token',
  oauth2_scopes: ['read', 'write'],
  ping_method: 'GET',
  ping_path: 'users/me',
},
```

### API Key / Token Apps

For non-OAuth apps, use `rest_modifiers` with custom connection options:

```typescript
rest: {
  url: 'https://api.example.com',
  data: 'json',
  oauth2_grant_type: 'none',
  ping_method: 'GET',
  ping_path: '/api/v1/me',
},
rest_modifiers: {
  options: APP_CONN_OPTIONS,
  required_options: 'apiKey',
},
```

The `APP_CONN_OPTIONS` are defined in `constants.ts` with `satisfies TCustomConnOptions`.

### URL Templates

When the URL contains dynamic values from connection options:

```typescript
rest: {
  url: 'https://{{subdomain}}.example.com/api',
  ping_path: '/{{company_domain}}/v1/ping',
},
rest_modifiers: {
  url_template_options: ['subdomain', 'company_domain'],
},
```

Use double curly braces `{{option_name}}` and list all template options in `url_template_options`.

### Post-Auth Processing

Use `set_options_post_auth` to process credentials after OAuth flow:

```typescript
rest_modifiers: {
  set_options_post_auth: (context) => {
    const token = context?.conn_opts?.token;
    return { url: `https://${subdomain}.example.com`, token };
  },
},
```

---

## Localization (i18n)

Every app, action, trigger, and option must have locale entries.

### File Location

`src/i18n/en/apps/<PascalCaseName>/index.ts`

The folder name is PascalCase matching the `APP_NAME` constant.

### Required Structure

```typescript
const locale = {
  displayName: () => 'App Display Name',
  shortDesc: () => 'Short plain text description',
  longDesc: () => 'Longer description, supports **markdown**',
  groups: [() => 'Category'],

  // Non-OAuth apps must include:
  connectionMessage: {
    title: 'Connect to App',
    content: 'Instructions for obtaining API key...',
  },

  actions: {
    action_name: {
      displayName: () => 'Action Display Name',
      shortDesc: () => 'Plain text short description',
      longDesc: () => 'Markdown-supported long description',
      options: {
        option_name: {
          displayName: () => 'Option Label',
          shortDesc: () => 'Plain text',
          longDesc: () => 'Markdown with examples, constraints, formats',
        },
      },
      response_type: { /* field locales */ },
    },
  },

  triggers: {
    trigger_name: {
      displayName: () => 'Trigger Name',
      shortDesc: () => 'Plain text',
      longDesc: () => 'Markdown description',
      event_info: { desc: () => 'Event description' },
    },
  },
};
```

### Markdown in Descriptions

- `shortDesc` — **plain text only** (no markdown)
- `displayName` — plain text (concise label)
- `longDesc` — **supports markdown**: use for complex options, examples, format documentation
- `desc` (in `event_info`) — string, plain text

Use markdown in `longDesc` when:
- The option accepts structured input (queries, JSON, nested data) — include code block examples
- The option has constraints (character limits, min/max) — document them
- The action has complex behavior — explain step-by-step
- The option has conditional requirements — explain clearly

### Workflow

1. Create/update locale file
2. Run `yarn typesafe-i18n` to regenerate types
3. Run `yarn test:ci actions-catalogue` to verify all locale keys are present

---

## Qorus Type Specifications

### File Type

Options with file uploads use `type: 'file'`:

```typescript
type TQoreFile = {
  name: string;       // File name
  mime_type: string;  // MIME type (e.g., 'application/pdf')
  content: string;    // Base64 encoded file content
};
```

### Date Type

Options with `type: 'date'` receive values in ISO 8601 format: `'2026-01-14T10:30:00.000Z'`

### Dynamic Types

When an option's type or an action's response type depends on runtime context (e.g., selected
table, resource type), use dynamic types:

- `get_dynamic_type` — for option types that change based on other option values
- `get_dynamic_response_type` — for response types that depend on options

Apps with dynamic types: NocoDB, SeaTable, Baserow, Supabase.

---

## Code Style Standards

- Prefer early returns over nested ifs
- Use named exports
- Max line length: 120 characters
- Use `===`/`!==` (never `==`/`!=`)
- Avoid `any` types (use `unknown`)
- Avoid `console.log` in production code (use `Debugger.log`)
- Use comments only for complex logic or important notes
- Prefer descriptive variable names over comments
- Copyright statements must reflect 2026

---

## Build and Test Commands

```bash
# Type-check (run after any code change)
yarn build:test

# Run focused test
NODE_OPTIONS=--max-old-space-size=8192 yarn test:ci <name>

# Verify app loads in Qore
yarn build && QORE_TYPESCRIPT_ACTION_VERBOSE=1 \
  QORE_TYPESCRIPT_ACTION_SCRIPTS=./dist/index.js \
  qdp ts-actions{}/<appname>

# Regenerate i18n types after locale changes
yarn typesafe-i18n

# Verify locale completeness
yarn test:ci actions-catalogue
```
