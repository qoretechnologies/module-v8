Copyright 2026 Qore Technologies, s.r.o.

# TypeScript Integration Checklist

Comprehensive pre-completion verification checklist for TypeScript app integrations. Run through
this checklist before marking any integration work complete.

See also:
- [ts-integration-architecture.md](ts-integration-architecture.md) — architecture overview
- [standard-app-development-guide.md](standard-app-development-guide.md) — client and action patterns
- [swagger-app-development-guide.md](swagger-app-development-guide.md) — swagger-based apps
- [record-based-app-development-guide.md](record-based-app-development-guide.md) — record-based CRUD
- [triggers-and-events-guide.md](triggers-and-events-guide.md) — trigger implementation

---

## 1. App Structure

- [ ] App directory at `src/apps/<app-name>/`
- [ ] `index.ts` exists with default export `(locale: Locales) => TQoreAppWithActions`
- [ ] `constants.ts` exists with `APP_NAME`, `APP_LOGO`, custom Error class
- [ ] `actions/` directory with `index.ts` containing named exports
- [ ] Every `.action.ts` file has a corresponding named export in `actions/index.ts`
- [ ] `triggers/` directory with `index.ts` (if triggers exist)
- [ ] Every `.trigger.ts` file has a corresponding named export in `triggers/index.ts`
- [ ] `helpers/` directory exists
- [ ] `response-types/` directory exists (recommended for standard apps)
- [ ] App added to `src/ActionsCatalogue/index.ts`
- [ ] Copyright 2026 in new files

---

## 2. Constants (`constants.ts`)

- [ ] Exports `*_APP_NAME` with PascalCase string value
- [ ] Exports `*_APP_LOGO` with base64 string
- [ ] Exports custom Error class extending `Error` with `this.name` set in constructor
- [ ] Non-OAuth apps: exports `*_CONN_OPTIONS` with `satisfies TCustomConnOptions`

---

## 3. Client (`client.ts`) — if applicable

### QoreApiClient Pattern

- [ ] Extends `QoreApiClient` from `../../global/helpers/QoreApiClient`
- [ ] Constructor calls `super()` with `baseUrl` and `appName`
- [ ] Only overrides methods the API actually requires (minimal overrides)
- [ ] Exports singleton instance (e.g., `export const appClient = new AppApiClient()`)
- [ ] `helpers/constants.ts` re-exports the client (single import point)
- [ ] All actions import client from `../helpers/constants` (not directly from `../client`)
- [ ] Allowed values helpers use `client.fetchAllowedValues()` (not raw `fetchPaginated()`)
- [ ] Consistent token passing: `{ token }` in options

### Third-Party Library Pattern

- [ ] Library client initialized in `client.ts` or `helpers/constants.ts`
- [ ] Authentication handled through connection options
- [ ] Client/library used consistently across all actions and helpers

---

## 4. App Configuration (`index.ts`)

- [ ] `name:` uses APP_NAME from constants
- [ ] `display_name:` uses `L[locale].apps[APP_NAME].displayName()`
- [ ] `short_desc:` uses `L[locale].apps[APP_NAME].shortDesc()`
- [ ] `desc:` uses `L[locale].apps[APP_NAME].longDesc()`
- [ ] `logo:`, `logo_file_name:`, `logo_mime_type:` present
- [ ] `actions` array uses `mapActionsToApp(APP_NAME, ..., locale)`
- [ ] If triggers: `actions` array also uses `mapTriggersToApp(APP_NAME, ..., locale)`
- [ ] `rest` config has: `url`, `data: 'json'`, auth config, `ping_method`, `ping_path`
- [ ] OAuth2: `oauth2_grant_type`, `oauth2_auth_url`, `oauth2_token_url` configured
- [ ] Non-OAuth: `oauth2_grant_type: 'none'`, `rest_modifiers.options` references CONN_OPTIONS
- [ ] URL templates use `{{option_name}}` with `url_template_options` listing all options

---

## 5. Actions

For each action file:

- [ ] Uses `QoreAppCreator.createLocalizedAction<typeof options>({ ... })`
- [ ] `app:` references APP_NAME
- [ ] `action:` is a snake_case string
- [ ] `action_code:` is `EQoreAppActionCode.ACTION`
- [ ] `options` defined with `satisfies TQoreOptions`
- [ ] `response_type` defined (inline or imported from response-types/)
- [ ] `api_function` uses `getQoreContextRequiredValues` with `ErrorClass` set
- [ ] Error handling uses app-specific error class
- [ ] Exports default

---

## 6. Options

For each option across all actions:

- [ ] Correct type (`'string'`, `'int'`, `'float'`, `'boolean'`, `'date'`, `'hash'`, `'list'`, `'file'`)
- [ ] Date/datetime options use `type: 'date'` (not `type: 'string'`)
- [ ] Boolean options use `type: 'boolean'` (not string with allowed values)
- [ ] Numeric options use `type: 'float'` or `type: 'int'`
- [ ] `get_dynamic_type` for options whose type depends on other option values
- [ ] `on_change: ['refetch']` on parent options that affect dependent options
- [ ] No `any` type (use `unknown` or specific types)
- [ ] Update actions: optional updatable fields have `required_groups: ['update_field']` so at least one must be filled
- [ ] Options where at least one of a group must be provided use `required_groups` with a shared group name

---

## 7. UX and Documentation

### Allowed Values Coverage

- [ ] Every option accepting an ID or resource reference has `get_allowed_values` or static `allowed_values`
- [ ] Users never manually type resource IDs
- [ ] `display_name` is descriptive (not just raw ID)
- [ ] `desc` field included where additional context is useful (budget amount, status, date)
- [ ] Allowed values helpers return empty array on missing credentials (never throw)

### Option Dependencies

- [ ] Parent option has `on_change: ['refetch']` when it filters dependent options
- [ ] Campaign → ad group refresh, resource type → field refresh, etc.

### Defaults

- [ ] Required options with common values have `default_value`
- [ ] Optional options with sensible defaults have `default_value`
- [ ] Defaults consistent across similar actions

### Naming Consistency

- [ ] Similar options use same name across actions (always `campaign_id`, not sometimes `campaign`)
- [ ] Similar filters consistent across list/report actions
- [ ] Action names accurately describe behavior

### Response Types

- [ ] List actions return `type: 'list'`, single-resource return `type: 'hash'`
- [ ] Include all fields useful for downstream actions
- [ ] Human-readable field names (snake_case)
- [ ] Create/update actions echo back resource properties

### Descriptions (Markdown Support)

- [ ] `longDesc` uses **markdown** for complex options (examples, code blocks, format docs)
- [ ] `shortDesc` is **plain text only** (no markdown)
- [ ] Options with constraints document them in `longDesc` (char limits, min/max, formats)
- [ ] Complex options include examples in `longDesc` (GAQL queries, JSON structures)
- [ ] Conditional requirements explained in description

---

## 8. Triggers — if applicable

- [ ] Uses `QoreAppCreator.createLocalizedTrigger({ ... })`
- [ ] `action_code:` is `EQoreAppActionCode.EVENT`
- [ ] Polling: uses `pollCreatedItemsForTrigger` or `pollUpdatedItemsForTrigger`
- [ ] Webhook: `webhook_method`, `webhook_register`, `webhook_deregister` implemented
- [ ] `event_info` has `desc` (string) and `type` with `type: 'hash'` and `fields`
- [ ] `get_example_event_data` is present and async
- [ ] Fields in `get_example_event_data` match `event_info.type.fields` keys exactly
- [ ] No extra fields, no missing fields between event_info and example data

---

## 9. Swagger-specific — if applicable

- [ ] Schema file at `src/schemas/<app>.swagger.json`
- [ ] `swagger:` or `swagger_schema_map:` configured in `index.ts`
- [ ] `swagger_options.parse_flags` set correctly
- [ ] Allowed paths defined in `allowed-paths/` directory
- [ ] Allowed paths match schema path strings exactly
- [ ] `override_options` for enhanced UX (allowed values, type corrections, required fields)
- [ ] Data converters for non-standard request/response formats
- [ ] `swagger_base_path` set in `set_options_post_auth` if needed

---

## 10. Record-based — if applicable

- [ ] `index.ts` satisfies `TQoreRecordBasedApp & TQoreAppWithActions`
- [ ] `get_table_list` returns `string[]`
- [ ] `get_record_type` has **NO function references** (all values resolved inline)
- [ ] `expressions` defined and localized with `mapExpressionsToApp`
- [ ] `search_records` returns column-format data (`mapObjectToColumnFormat`)
- [ ] `create_records` accepts column-format data (`mapColumnFormatToObject`)
- [ ] `update_records` implemented
- [ ] `delete_records` implemented
- [ ] `search_options` defined and localized with `mapCrudOptionsToApp`
- [ ] All expression locales present (displayName, shortDesc, longDesc, args)
- [ ] All CRUD option locales present
- [ ] `qdp ts-actions{}/<appname>` output shows `"tables"`

---

## 11. Localization

- [ ] Locale file at `src/i18n/en/apps/<PascalCaseName>/index.ts`
- [ ] Has `displayName`, `shortDesc`, `longDesc` for app
- [ ] Has `groups` with valid `TAppGroups` values
- [ ] Non-OAuth apps: has `connectionMessage` with `title` and `content`
- [ ] Every action has locale entry with `displayName`, `shortDesc`, `longDesc`
- [ ] Every action locale has `options` matching ALL option keys
- [ ] Each option locale has at least `displayName` and `shortDesc`
- [ ] Nested hash options have `type.fields` entries
- [ ] List options have `type.element_type.fields` entries
- [ ] Trigger locales follow same pattern with `event_info.desc`
- [ ] Imported in `src/i18n/en/index.ts` and added to `en.apps` object
- [ ] `yarn typesafe-i18n` run after changes
- [ ] `yarn test:ci actions-catalogue` passes

---

## 12. Testing

- [ ] Test file at `src/tests/<app-name>.test.ts`
- [ ] Uses `configDotenv({ path: '.env' })`
- [ ] `beforeAll` with credential setup from env vars
- [ ] `hasCredentials` flag or equivalent skip mechanism
- [ ] Allowed values tests: positive + empty when no credentials (uses `checkAllowedValues`)
- [ ] CRUD tests for main actions (at least create + list/get)
- [ ] Trigger tests: `event_info` schema structure + `get_example_event_data` field matching
- [ ] Negative tests (missing required fields)
- [ ] Cleanup section to delete test resources
- [ ] Uses `skipOnTransientError` wrapper for API calls
- [ ] Environment variables documented
- [ ] `pull-request.yml` updated if new env vars needed (follows `${{ fromJson(secrets.TEST_VARIABLES).VAR_NAME }}` pattern)

---

## 13. Build and Verification

- [ ] `yarn build:test` passes (no TypeScript errors)
- [ ] `yarn build && qdp ts-actions{}/<appname>` loads successfully
- [ ] Actions appear in qdp output
- [ ] If record-based: `"tables"` appears in qdp output
- [ ] No TypeScript warnings or errors
- [ ] `NODE_OPTIONS=--max-old-space-size=8192 yarn test:ci <appname>` passes

---

## 14. Code Quality

- [ ] No `any` types except documented `as any` for framework constraints
- [ ] No `console.log` in production code (`Debugger.log` is fine; test files exempt)
- [ ] Uses `===`/`!==` (no `==`/`!=`)
- [ ] Descriptive variable names
- [ ] Early returns over nested ifs
- [ ] Max 120 character line length
- [ ] Named exports used

---

## Reference Implementations

| Pattern | App | Key files |
|---------|-----|-----------|
| Unified client (basic) | Survey Monkey | `src/apps/survey-monkey/client.ts`, `helpers/`, `actions/` |
| Unified client (advanced) | Dropbox | `src/apps/dropbox/client.ts` (custom methods) |
| Third-party library | Google Ads | `src/apps/google-ads/client.ts` (google-ads-api SDK) |
| Pure swagger | Confluence | `src/apps/confluence/allowed-paths/`, `index.ts` |
| Record-based | Freshdesk | `src/apps/freshdesk/helpers/record-based/` |
| Non-OAuth locale | Brevo | `src/i18n/en/apps/Brevo/index.ts` (connectionMessage) |
| Test patterns | Survey Monkey, Google Ads | `src/tests/survey-monkey.test.ts`, `src/tests/google-ads.test.ts` |
