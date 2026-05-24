# HubSpot Forms — Implementation Plan

Copyright 2026 Qore Technologies, s.r.o.

Adds Marketing Forms coverage to the HubSpot integration: form definitions (CRUD), form submissions (read + submit), and a polling trigger for new submissions. Progress is tracked in [HUBSPOT_FORMS_PROGRESS.md](./HUBSPOT_FORMS_PROGRESS.md).

## 1. Scope & approach

| Piece | API | Approach |
|---|---|---|
| Form definitions CRUD | `GET/POST/PUT/PATCH/DELETE /marketing/v3/forms[/:id]` on `api.hubapi.com` | **Swagger-driven** via `buildActionsFromSwaggerSchema`, mirroring `allowed-paths/lists.ts` |
| Get form submissions | `GET /form-integrations/v1/submissions/forms/{formGuid}` on `api.hubapi.com` (legacy v1) | **Hand-rolled action** — legacy endpoint isn't in the public OpenAPI catalog |
| Submit a form | `POST /submissions/v3/integration/secure/submit/{portalId}/{formGuid}` on `api.hsforms.com` | **Hand-rolled action** — second host, can't go through app-level `rest:` block |
| New-submission trigger | Poll the submissions endpoint, dedupe by `submittedAt`+`pageUrl`+email | **Polling trigger** mirroring the seven existing HubSpot triggers; webhooks are app-level, not per-install, so skip for now |

Single new OAuth scope: **`forms`**. Covers all four pieces above.

## 2. File layout

```
ts/src/apps/hubspot/
├── allowed-paths/
│   └── forms.ts                                NEW — swagger-driven CRUD for form definitions
├── actions/
│   ├── index.ts                                MODIFIED — re-export new actions
│   ├── get-form-submissions.action.ts          NEW — legacy v1 submissions read
│   └── submit-form.action.ts                   NEW — legacy v3 secure submit on api.hsforms.com
├── triggers/
│   ├── index.ts                                MODIFIED — re-export new trigger
│   └── form-submitted.trigger.ts               NEW — polling trigger over submissions endpoint
├── helpers/
│   ├── get-form-allowed-values.ts              NEW — lists forms via /marketing/v3/forms
│   ├── get-form-field-allowed-values.ts        NEW — drives field-name pickers from form def
│   ├── get-portal-id.ts                        NEW — cached resolve of /integrations/v1/me.portalId
│   └── form-submission-types.ts                NEW — shared response/event types
└── index.ts                                    MODIFIED — register actions, scope, swagger map entry

ts/src/schemas/hubspot/
└── forms.swagger.json                          NEW — Swagger 2.0 (downconverted from upstream OAS 3.0.1)

ts/src/i18n/en/apps/Hubspot/
└── index.ts                                    MODIFIED — locales for new actions, options, trigger

ts/src/tests/
└── hubspot.test.ts                             MODIFIED — form CRUD, submit, read, trigger tests

.github/workflows/pull-request.yml              MODIFIED — add HUBSPOT_TEST_FORM_GUID, HUBSPOT_TEST_PORTAL_ID
```

## 3. Detailed steps

### 3.1 Schema — `schemas/hubspot/forms.swagger.json`

- Source: <https://raw.githubusercontent.com/HubSpot/HubSpot-public-api-spec-collection/main/PublicApiSpecs/Marketing/Forms/Rollouts/144909/v3/forms.json> (OpenAPI 3.0.1)
- Convert to Swagger 2.0: `npx api-spec-converter --from=openapi_3 --to=swagger_2 --syntax=json` — matches the format every other file in `schemas/hubspot/` uses
- Manual fixups expected (downconvert lossy areas):
  - `oneOf` on field-type unions (`SingleLineTextField | EmailField | …`) collapses to one inline schema — model it as a generic `hash` and tighten via overrides in `allowed-paths/forms.ts`
  - `requestBodies` move into operation `parameters` with `in: body`
  - Replace `info.version: "v3"`, set `host: "api.hubapi.com"`, `basePath: "/"`, `schemes: ["https"]`
- Six operations expected after conversion: `get/post /marketing/v3/forms`, `get/put/delete/patch /marketing/v3/forms/{formId}`

### 3.2 Allowed-paths — `allowed-paths/forms.ts`

Pattern: copy `allowed-paths/lists.ts`. Overrides per path:

- `GET /marketing/v3/forms`
  - `formTypes`: `element_allowed_values` = `[hubspot, captured, flow, blog_comment, all]` (display names from the locale)
  - `limit`: `default_value: 20`
- `POST /marketing/v3/forms`
  - leave body as auto-generated from swagger; add a top-level description in locale
- `GET|PUT|PATCH|DELETE /marketing/v3/forms/{formId}`
  - `formId`: `get_allowed_values: getHubspotFormAllowedValues`, `allowed_values_creatable: true`

Export `HUBSPOT_FORMS_ACTIONS = buildActionsFromSwaggerSchema({ schema, schemaPath: 'forms', allowedPaths, app: HUBSPOT_APP_NAME })`.

### 3.3 Helper — `helpers/get-form-allowed-values.ts`

```ts
export const getHubspotFormAllowedValues = async (
  { conn_opts }: { conn_opts?: { token?: string } }
): Promise<IQoreAllowedValue<string>[]> => {
  if (!conn_opts?.token) return [];
  // QorusRequest.get('/marketing/v3/forms?limit=200', { url: 'https://api.hubapi.com' })
  // page through paging.next.after up to a sane cap (1000)
  // map → { value: id, display_name: name, desc: formType }
};
```

Same empty-args-graceful pattern as `get-list-id-allowed-values.ts`.

### 3.4 Helper — `helpers/get-form-field-allowed-values.ts`

- Input: `conn_opts.token`, `opts.formId`
- Calls `GET /marketing/v3/forms/{formId}`
- Walks `fieldGroups[].fields[].name` → returns `{value: field.name, display_name: field.label}`
- Used by the submit-form action's `fields[].name` element allowed values
- Requires `on_change: ['refetch']` on the `formId` option (per `.claude/CLAUDE.md` "when an option depends on another option")

### 3.5 Helper — `helpers/get-portal-id.ts`

- One-shot resolve: `GET /integrations/v1/me` → `portalId: number`
- Cache per token in a `Map<token, portalId>` (module-scoped) since portalId never changes for a connection
- Used internally by the submit-form action — the user does NOT supply portalId

### 3.6 Action — `actions/get-form-submissions.action.ts`

Hand-rolled `createLocalizedAction`. Pattern: copy `actions/get-list-records.action.ts`.

Options:
- `formId` — `softstring`, required, `get_allowed_values: getHubspotFormAllowedValues`, `allowed_values_creatable: true`
- `limit` — `integer`, default 50, max 50 per HubSpot (page size)
- `maxResults` — `integer`, default 200 (paginate until reached or no more pages)
- `after` — `string`, optional paging cursor
- `since` — `date`, optional ISO 8601 — applied client-side as `submittedAt >= since` filter (legacy v1 doesn't support a server-side filter)

API: `QorusRequest.get('/form-integrations/v1/submissions/forms/${formId}', { url: 'https://api.hubapi.com' })`.

Response type:
```ts
{
  results: Array<{
    conversionId: string,
    submittedAt: number,         // epoch ms
    pageUrl: string | null,
    values: Array<{ name: string, value: string }>,
  }>,
  paging?: { next?: { after: string } },
}
```

### 3.7 Action — `actions/submit-form.action.ts`

Hand-rolled `createLocalizedAction`.

Options:
- `formId` — `softstring`, required, `get_allowed_values: getHubspotFormAllowedValues`
- `fields` — `list<hash{name, value}>`, required, `get_element_allowed_values` on `name` via `getHubspotFormFieldAllowedValues`
- `context` — optional hash: `{ pageUri?: string, pageName?: string, hutk?: string, ipAddress?: string, sfdcCampaignId?: string }`
- `legalConsentOptions` — optional hash (pass-through)
- `submittedAt` — optional date → converted to epoch ms
- `skipValidation` — optional boolean, default false

API: `POST https://api.hsforms.com/submissions/v3/integration/secure/submit/{portalId}/{formId}` with `Authorization: Bearer ${token}`. Resolve `portalId` via `getHubspotPortalId(token)`. Request body shape per HubSpot's secure submit spec.

Response type: `{ inlineMessage: string }` (HubSpot returns either an inline message or a redirect URL).

### 3.8 Trigger — `triggers/form-submitted.trigger.ts`

Pattern: copy `triggers/contact-created-or-updated.trigger.ts` but drop the `activationCriteria` (only one mode: created).

Options:
- `formId` — required, `get_allowed_values: getHubspotFormAllowedValues`

Implementation:
- `action_code: EQoreAppActionCode.EVENT`
- `event_function`: call `pollCreatedItemsForTrigger` from `global/helpers/event-triggers` with `uniqueField: 'conversionId'`, `getItems` = paginated submissions sorted DESC by `submittedAt`
- `get_example_event_data`: return the most recent submission for the configured form (first page, first result)
- `event_info`: typed hash mirroring the submission response shape — must match what `get_example_event_data` returns exactly (per the `.claude/CLAUDE.md` trigger-testing snippet)

### 3.9 Register everything in `index.ts`

- Add `'forms'` to `oauth2_scopes`
- Add `forms: { swagger: 'schemas/hubspot/forms.swagger.json' }` to `swagger_schema_map`
- Add `HUBSPOT_FORMS_ACTIONS` to the `actions:` array via `mapActionsToApp`

### 3.10 Locales — `i18n/en/apps/Hubspot/index.ts`

Per the `.claude/CLAUDE.md` checklist, every new action, trigger, option, and field needs a locale entry:

- `submit_form` — display + desc + option descriptions
- `get_form_submissions` — display + desc + option descriptions
- Six swagger-generated form-definition actions — display + desc (action names auto-derived from operationId)
- `hubspot_form_submitted_trigger` — display + desc + option descriptions
- `formTypes` enum display names (`Native HubSpot`, `Captured external`, `Pop-up / flow`, `Blog comment`, `All`)

After editing locales: `yarn typesafe-i18n`, then `yarn test:ci actions-catalogue` to verify completeness.

### 3.11 Tests — `tests/hubspot.test.ts`

New blocks, gated on `hasCredentials`:
- `describe('forms')`:
  - create test form (POST) → save id → get (GET) → patch (PATCH) → list contains it (GET list) → archive (DELETE)
  - `getHubspotFormAllowedValues({ conn_opts })` → `checkAllowedValues` with `checkNonEmpty: true`
  - `getHubspotFormAllowedValues({})` → empty array
- `describe('form submissions')`:
  - `submit-form` against `HUBSPOT_TEST_FORM_GUID` with two fields → expect `inlineMessage` string
  - `get-form-submissions` against the same form → expect array, expect the just-submitted record (poll up to ~5s — HubSpot indexes async)
  - `since` filter narrows the result set
- `describe('form trigger')`:
  - `get_example_event_data` returns a hash whose keys match `event_info.type.fields` exactly (the `.claude/CLAUDE.md` snippet)

### 3.12 CI — `.github/workflows/pull-request.yml`

Add:
```yaml
HUBSPOT_TEST_FORM_GUID: ${{ secrets.HUBSPOT_TEST_FORM_GUID }}
HUBSPOT_TEST_PORTAL_ID: ${{ secrets.HUBSPOT_TEST_PORTAL_ID }}
```
Both should be set up against the existing HubSpot sandbox account already used by the integration's tests.

## 4. Verification gate (must all pass before merge)

In order:

1. `yarn typesafe-i18n` — locale types up to date, no diff after
2. `yarn build:test` — TypeScript compiles, no errors
3. `NODE_OPTIONS=--max-old-space-size=8192 yarn test:ci actions-catalogue` — locale completeness
4. `NODE_OPTIONS=--max-old-space-size=8192 yarn test:ci hubspot` — all new + existing HubSpot tests
5. `yarn build && QORE_TYPESCRIPT_ACTION_VERBOSE=1 QORE_TYPESCRIPT_ACTION_SCRIPTS=./dist/index.js qdp ts-actions{}/hubspot` — Qore loads the new actions, confirm `tables` and the six form ops + two hand-rolled ops + trigger appear, no SCHEMA-ERROR for `forms`
6. `/verify-integration hubspot` from `.claude/skills/verify-integration/SKILL.md`

## 5. Risks & open decisions

- **Swagger downconvert fidelity** — HubSpot's spec uses `oneOf` heavily for field types. Worst case: the form-definition `POST`/`PUT` bodies become permissive `hash` types and we lose UI validation. Acceptable for a v1 — users editing forms via API rather than the HubSpot UI is a niche path.
- **Form fields with file upload** — `FileField` submissions need multipart upload; out of scope for v1. Document as a known limitation.
- **GDPR `legalConsentOptions`** — passing through as opaque hash. If we surface it later, the three sub-shapes (`Explicit`, `Implicit`, `LegitimateInterest`) need dynamic typing.
- **Webhook trigger** — deferred. HubSpot webhook subscriptions are configured at the developer app level, not per-OAuth-connection, so a true push trigger would require infrastructure changes (a single shared webhook endpoint demuxing per portalId). Polling matches the existing HubSpot triggers and ships now.
- **portalId env var in tests** — required because `/integrations/v1/me` is also under the `forms` scope; if the test token is missing that scope we'd silently fall through. Supplying `HUBSPOT_TEST_PORTAL_ID` lets the submit test work even if the me-endpoint resolution fails.
- **Schema rollout id `144909`** — pinned at download time. If HubSpot ships a new rollout we re-download and re-convert. Not auto-fetched at build time.

## 6. Reference links

- [Marketing Forms v3 reference](https://developers.hubspot.com/docs/reference/api/marketing/forms)
- [Forms v3 guide](https://developers.hubspot.com/docs/api-reference/marketing-forms-v3/guide)
- [Get submissions (legacy forms-v1)](https://developers.hubspot.com/docs/api-reference/legacy/forms-v1/submissions/get-form-integrations-v1-submissions-forms-form_guid)
- [Secure submit (legacy forms-v3)](https://developers.hubspot.com/docs/api-reference/legacy/forms-v3-legacy/post-submissions-v3-integration-secure-submit-portalId-formGuid)
- [Account details / portalId](https://developers.hubspot.com/docs/api-reference/legacy/account-activity-v1/account-details/get-integrations-v1-me)
- [Public OpenAPI spec collection](https://github.com/HubSpot/HubSpot-public-api-spec-collection/tree/main/PublicApiSpecs/Marketing/Forms)
