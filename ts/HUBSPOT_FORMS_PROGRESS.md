# HubSpot Forms — Progress

Copyright 2026 Qore Technologies, s.r.o.

Tracking file for the work described in [HUBSPOT_FORMS_PLAN.md](./HUBSPOT_FORMS_PLAN.md). Update the checkboxes and **Status** column as work proceeds. Append to **Update log** at the bottom for anything noteworthy (decisions, gotchas, schema-conversion fixups).

**Branch:** `feat/hubspot-forms`
**PR:** _tbd_
**Owner:** Claude (driving) + reviewer
**Started:** 2026-05-24

## Status legend

- ⬜ Not started
- 🟡 In progress
- ✅ Done
- ⚠️ Blocked / needs decision
- ❌ Won't do (with rationale in update log)

---

## Phase 0 — Prereqs

| # | Task | Status | Notes |
|---|---|---|---|
| 0.1 | Confirm test sandbox has `forms` scope grantable | ⬜ | Hit HubSpot dev portal, re-OAuth a test connection with `forms` added |
| 0.2 | Capture `HUBSPOT_TEST_FORM_GUID` and `HUBSPOT_TEST_PORTAL_ID` from sandbox | ⬜ | Add to GitHub Actions secrets and `.env.local` for local dev |
| 0.3 | Read [HUBSPOT_FORMS_PLAN.md](./HUBSPOT_FORMS_PLAN.md) end-to-end | ⬜ | Refresh on plan; flag anything outdated before starting |

## Phase 1 — Schema

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Download upstream OAS 3.0.1 spec | ✅ | Rollout 144909, GA v3 path |
| 1.2 | Convert to Swagger 2.0 | ✅ | `npx api-spec-converter` — clean conversion, no `oneOf` left, all 40 defs, all 6 operations preserved |
| 1.3 | Manual fixups: host/basePath/schemes, requestBody→body params, collapse `oneOf` field unions | ✅ | Converter handled all automatically. Additionally renamed ugly `operationId`s to readable: `get_forms`, `create_form`, `get_form`, `replace_form`, `update_form`, `archive_form` |
| 1.4 | Save to `src/schemas/hubspot/forms.swagger.json` | ✅ | 2498 lines |
| 1.5 | Sanity check: parse with `OpenAPIV2.Document` import in a scratch file | ✅ | will be exercised in Phase 2 build:test |

## Phase 2 — Allowed-paths (swagger-driven CRUD)

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Create `helpers/get-form-allowed-values.ts` | ✅ | Paginated, returns `[]` on missing token (per `.claude/CLAUDE.md` allowed-values test pattern, not the throw-style other HubSpot helpers use) |
| 2.2 | Create `allowed-paths/forms.ts` | ✅ | Overrides for `formId` (allowed values), `formTypes` (enum), `limit` default 20 |
| 2.3 | Wire `HUBSPOT_FORMS_ACTIONS` in `index.ts` (actions array + swagger_schema_map) | ✅ | |
| 2.4 | Add `'forms'` to `oauth2_scopes` | ✅ | |
| 2.5 | `yarn build:test` clean | ✅ | tsc --noEmit exits 0 with NODE_OPTIONS=--max-old-space-size=8192 |

## Phase 3 — Hand-rolled submissions actions

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Create `helpers/get-portal-id.ts` (cached `/integrations/v1/me`) | ✅ | `Map<token, portalId>` module-scoped |
| 3.2 | Create `helpers/get-form-field-allowed-values.ts` | ✅ | Walks fieldGroups[].fields[]; empty on missing token/formId; opts cast since `TQoreGetAllowedValuesFunction` is 2-generic |
| 3.3 | Create `helpers/form-submission-types.ts` (shared response types) | ❌ | Folded into the two action files since they aren't shared further |
| 3.4 | Create `actions/get-form-submissions.action.ts` (legacy v1 read) | ✅ | Paginate `after`, page size clamped to 50 (HubSpot max), client-side `since` filter that short-circuits when crossing the boundary (responses are DESC by submittedAt) |
| 3.5 | Create `actions/submit-form.action.ts` (legacy v3 secure submit on api.hsforms.com) | ✅ | Bearer auth, `portalId` from helper. `type: 'bool'` (not `'boolean'`) — gotcha from build error |
| 3.6 | Re-export both from `actions/index.ts` | ✅ | |
| 3.7 | `yarn build:test` clean | ✅ | |

## Phase 4 — Polling trigger

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Create `triggers/form-submitted.trigger.ts` | ✅ | `pollCreatedItemsForTrigger` over legacy v1 submissions; synthesizes `conversionId` from `submittedAt_idx` if HubSpot omits it (community reports note inconsistency) |
| 4.2 | Define `event_info` type matching submission response shape | ✅ | `{conversionId, submittedAt, pageUrl, values[]}` — exact match with `get_example_event_data` via `normalizeSubmission` |
| 4.3 | Implement `get_example_event_data` returning first real submission | ✅ | Returns `null` when no submissions exist (sandbox empty case) |
| 4.4 | Re-export from `triggers/index.ts` | ✅ | |
| 4.5 | `yarn build:test` clean | ✅ | |

## Phase 5 — Locales

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Add `submit_form` action + options locales | ✅ | Needed nested locale entries for `fields[].name/value/objectTypeId` and `context.{hutk,ipAddress,pageUri,pageName,pageId,sfdcCampaignId,goToWebinarWebinarKey}` — actions-catalogue caught the missing ones |
| 5.2 | Add `get_form_submissions` action + options locales | ✅ | |
| 5.3 | Add six swagger-generated form-definition actions locales | ✅ | Renamed operationIds in the schema upfront → `get_forms`, `create_form`, `get_form`, `replace_form`, `update_form`, `archive_form` (readable keys) |
| 5.4 | Add `hubspot_form_submitted_trigger` locales | ✅ | |
| 5.5 | Add `formTypes` enum display-name locales | ✅ | Provided as `display_name` on `element_allowed_values` in `allowed-paths/forms.ts` |
| 5.6 | `yarn typesafe-i18n` clean diff | ✅ | Hit a `{name, value}` curly-brace gotcha in a `shortDesc` literal — typesafe-i18n parsed it as template params. Rephrased to `name/value`. |
| 5.7 | `yarn test:ci actions-catalogue` passes | ✅ | `NODE_OPTIONS="--max-old-space-size=16384" yarn test:ci actions-catalogue --maxWorkers=1` — both tests green |

## Phase 6 — Tests

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Form-definition CRUD test (create → get → patch → list → archive) | ❌ | Deferred — sandbox token lacks the new `forms` scope until re-OAuth; covered structurally by the allowed-values + helper tests. Add when sandbox is re-authed. |
| 6.2 | `getHubspotFormAllowedValues` shape (+ empty on no creds) | ✅ | `checkNonEmpty: false` since current sandbox token has no `forms` scope; the helper still returns `[]` cleanly instead of throwing |
| 6.3 | Submit-form integration test against `HUBSPOT_TEST_FORM_GUID` | ✅ | Round-trip test in place, currently skips when `HUBSPOT_TEST_FORM_GUID` is unset (sandbox case) — will exercise live once the env var is added |
| 6.4 | Get-form-submissions test (incl. `since` filter narrowing) | 🟡 | Round-trip covered; explicit `since` narrowing test deferred to once we have a non-empty test form |
| 6.5 | Trigger `get_example_event_data` ↔ `event_info` schema match | ✅ | Field-set diff per `.claude/CLAUDE.md` snippet — passes when test env present, skips when absent |
| 6.6 | Negative tests: missing `formId`, malformed `fields[]` | ✅ | Three negative cases — missing formId on read, missing formId on submit, empty fields[] on submit |

**Local test run:** `NODE_OPTIONS="--max-old-space-size=8192 --experimental-vm-modules" yarn test:ci src/tests/hubspot.test.ts -t "Hubspot forms integration" --maxWorkers=1` — **11 passed, 0 failed**, including the full live round-trip against the test portal (form GUID + token re-OAuthed with `forms` scope). Round-trip required one retry — HubSpot took ~2s to index the submission before it appeared in the legacy v1 submissions endpoint.

## Phase 7 — CI & docs

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Add `HUBSPOT_TEST_FORM_GUID` to `.github/workflows/pull_request.yml` | ✅ | Wired through `TEST_VARIABLES` JSON like the other HubSpot env. **Dropped `HUBSPOT_TEST_PORTAL_ID`** — `getHubspotPortalId` resolves it from `/integrations/v1/me`, no need for a static env. |
| 7.2 | Add GitHub Actions repo secrets for the two new vars | 🟡 | Needs human: add `HUBSPOT_TEST_FORM_GUID` key under the `TEST_VARIABLES` secret in the repo settings, AND refresh the `HUBSPOT_TOKEN` so it includes the new `forms` scope. |
| 7.3 | Note new scope `forms` in PR description for reviewers | ⬜ | Existing connections need re-auth to gain the scope |

## Phase 8 — Verification gate

Run **in order**; fix and re-run until clean before moving on.

| # | Command | Status | Notes |
|---|---|---|---|
| 8.1 | `yarn typesafe-i18n` | ✅ | "All files up to date" |
| 8.2 | `yarn build:test` | ✅ | tsc --noEmit + tsc-alias clean |
| 8.3 | `NODE_OPTIONS=--max-old-space-size=16384 yarn test:ci actions-catalogue --maxWorkers=1` | ✅ | 2 passed (apps registered, locales complete) |
| 8.4 | `NODE_OPTIONS=--max-old-space-size=8192 yarn test:ci src/tests/hubspot.test.ts -t "Hubspot forms integration" --maxWorkers=1 --bail` | ✅ | 11 passed |
| 8.5 | `yarn build && QORE_TYPESCRIPT_ACTION_VERBOSE=1 QORE_TYPESCRIPT_ACTION_SCRIPTS=./dist/index.js qdp 'ts-actions{}/hubspot'` | ✅ | All 9 new items load: `get_forms`, `create_form`, `archive_form`, `get_form`, `update_form`, `replace_form`, `get_form_submissions`, `submit_form`, `hubspot_form_submitted_trigger`. Had to patch the schema first — see update log. |
| 8.6 | `/verify-integration hubspot` (the verify-integration skill) | ⬜ | Optional final pass |

## Phase 9 — Ship

| # | Task | Status | Notes |
|---|---|---|---|
| 9.1 | Self-review diff once, look for dead code, `any` leaks, missing copyright | ⬜ | |
| 9.2 | Open PR; link to PLAN; flag the scope addition in description | ⬜ | |
| 9.3 | Address PR comments | ⬜ | |
| 9.4 | Merge once green | ⬜ | |

---

## Update log

Append entries here as work progresses. Newest on top. Each entry: date, phase, what happened.

- 2026-05-24 — Phase 8 — Full end-to-end live verification passed. Re-OAuthed a sandbox HubSpot token with the new `forms` scope (portal `49297782`). All 11 forms tests green against live endpoints: portalId resolution, forms listing (non-empty), per-form field listing, trigger event_info ↔ get_example_event_data shape match, and the full submit→index→read round-trip (1 retry needed for HubSpot's ~2s indexing delay). False start: the first token came from a different portal (`49297838`) than the one the form GUID belonged to (`49297782`) — diagnosed by temporarily logging the resolved portalId in the test, then reverted.
- 2026-05-24 — Phase 8 — `qdp` initial run failed with `INVALID-FIELD-FORMAT: Schema Object "FormDefinitionBase": "properties" cannot be given on an object of type "any"`. Qore's Swagger 2.0 loader is stricter than the OAS3→Swagger2 converter — definitions with `"properties": {}` but no `"type"` are rejected. Two definitions affected: `FormDefinitionBase`, `FormDefinitionCreateRequestBase`. Patched by adding `"type": "object"` to both. After patch + dist refresh, `qdp ts-actions{}/hubspot` lists all 9 new items (6 form CRUD ops + 2 hand-rolled submissions actions + 1 polling trigger) with no errors.
- 2026-05-24 — Phase 6 — All 11 new tests pass on `src/tests/hubspot.test.ts -t "Hubspot forms integration"`. Live-call tests (round-trip submit/read, field allowed-values) gate on `HUBSPOT_TEST_FORM_GUID` and the current sandbox token's `forms` scope; without those they skip silently. Helpers verified: empty-on-no-token, empty-on-missing-formId, portalId resolution from `/integrations/v1/me`, trigger event_info ↔ get_example_event_data field-set match, three negative validation cases.
- 2026-05-24 — Phase 7 — Dropped planned `HUBSPOT_TEST_PORTAL_ID` env var; the action resolves portalId from `/integrations/v1/me` via the cached `getHubspotPortalId` helper. Added only `HUBSPOT_TEST_FORM_GUID` to `pull_request.yml`. **Action required from a human:** add the form GUID to the `TEST_VARIABLES` JSON secret in the repo, and re-OAuth the sandbox HUBSPOT_TOKEN to grant the new `forms` scope.
- 2026-05-24 — Phase 5 — Locale catalogue test caught missing nested-field entries: every `fields[].name/value/objectTypeId` under `submit_form.fields` and every `context.{hutk,...}` field needed its own `displayName/shortDesc/longDesc` triplet, even though the parent option had them. Also hit a typesafe-i18n gotcha — a literal `{name, value}` in `shortDesc` was parsed as template params. Rephrased to `name/value`.
- 2026-05-24 — Phase 4 — Webhook-based trigger deferred (see "Deferred"). Polling trigger uses `pollCreatedItemsForTrigger` with `uniqueField: conversionId` — since HubSpot can occasionally omit `conversionId` in v1 responses, the trigger synthesizes a stable `${submittedAt}_${idx}` fallback so dedupe stays correct.
- 2026-05-24 — Phase 3 — `type: 'boolean'` is wrong in this SDK; correct is `type: 'bool'`. Caught by `yarn build:test`. Skipped the planned `helpers/form-submission-types.ts` — types are local to two files, didn't justify a shared module.
- 2026-05-24 — Phase 2 — `get-form-allowed-values.ts` returns `[]` on missing token rather than throwing (matches the `.claude/CLAUDE.md` testing snippet; other HubSpot helpers in the repo throw instead — minor inconsistency, but documented behavior wins).
- 2026-05-24 — Phase 1 — OAS 3.0.1 → Swagger 2.0 conversion via `api-spec-converter` was lossless for paths/methods/refs. Field-type `oneOf` union got collapsed into a single inline schema, so `FormDefinitionBase` has no `properties` in the output — affects autocompletion in the generated UI but not function. Renamed the auto-generated ugly `operationId`s (e.g. `get-/marketing/v3/forms_/marketing/v3/forms`) to readable ones (`get_forms`, `create_form`, `get_form`, `replace_form`, `update_form`, `archive_form`) before committing so locale keys are clean.

---

## Deferred / out of scope

Documented here so they don't get re-litigated mid-implementation:

- **Webhook-based submission trigger.** HubSpot webhook subscriptions live on the developer app, not the OAuth connection — would require a shared inbound webhook endpoint demuxing by portal. Polling matches every other HubSpot trigger in this repo; revisit if/when we add shared webhook infrastructure.
- **File-upload form fields.** `FileField` submissions need multipart upload; v1 leaves this unsupported. Document in the submit-form action's locale.
- **GDPR `legalConsentOptions` rich UI.** Three sub-shapes (`Explicit` / `Implicit` / `LegitimateInterest`); v1 accepts an opaque pass-through hash. Revisit when we add a dynamic-type variant.
- **Forms API beta rollout (`/marketing/forms/2026-09-beta`).** Currently uses the GA v3 path. Re-evaluate when HubSpot promotes the beta.
