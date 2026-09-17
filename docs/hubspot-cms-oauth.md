# HubSpot optional CMS authorization

Copyright 2026 Qore Technologies, s.r.o.

The HubSpot catalog requests `content cms.domains.read` through
`rest.oauth2_auth_args.optional_scope`. HubSpot can omit optional scopes when the selected account cannot
grant them. A successful CRM connection ping does not establish CMS access.

| Operation | Endpoint families | Required grant |
| --- | --- | --- |
| Read or manage website and landing pages | `/cms/v3/pages/...`, `/cms/pages/2026-03/...` | `content` |
| Inspect connected domains | `GET /cms/v3/domains`, `GET /cms/domains/2026-03` and their descendants | `cms.domains.read` |

The published scope catalog offers `content` for these page APIs, with no narrower
page-read scope. It covers more than pages and can permit publishing. Domain
inspection uses the narrower read scope. The connector does not request file,
template/source-code, or domain-write access. A manually configured domain-write
operation requires an actual `cms.domains.write` grant; it is never inferred from
domain-read or content access. No additional CMS actions or schemas are installed;
use the existing **Make an API call** action.

## Granular scope migration — 2026-09-17

The default ticket grant now requests `crm.objects.tickets.read`,
`crm.objects.tickets.write`, `crm.schemas.tickets.read`, and `crm.schemas.tickets.write`
instead of the legacy `tickets` scope. Migrate the corresponding external app configuration before
deploying these defaults. Persisted `oauth2_scopes` overrides must be updated separately; changing
the catalog does not replace them or expand an existing token's grant.

The external Qorus HubSpot Access app also migrated `files` to `files.read`, `files.write`,
and `files.delete`, plus granular HubDB and timeline scopes. These are conditionally required
capabilities of the external app, not requirements of every Qorus connection. The default connector
does not request file, HubDB, or timeline access. Do not add those scopes to a CMS-only connection
unless its operations require them. A consent failure naming HubDB must be investigated against
the actual install URL's `scope` parameter; configuring conditional HubDB support alone does not
require every account to have it.

Qore's `RestClient` and the cloud token exchange/introspection service treat scope names as opaque
strings. No provider-specific change in Qore's generic OAuth engine or the qorus-api client-secret
registry is needed for a file-scope rename. If migrating `content` to granular page scopes, update
`TypeScriptHubspotRestClient`'s operation-level grant checks as well: it currently requires the
documented legacy `content` grant for supported page paths. File scopes do not grant page editing.

These scope requirements apply to the documented v3 and `2026-03` endpoint
families. The developer platform/app version and the REST API version are separate.
Changing the token API version cannot expand a grant. Authorization remains at
`https://app.hubspot.com/oauth/authorize`; token exchange and refresh remain at
`https://api.hubapi.com/oauth/2026-03/token`.

## Deployment

1. Deploy the accompanying Qore `RestClient` OAuth query-encoding fix from issue
   [#5443](https://github.com/qoretechnologies/qore/issues/5443). Extra OAuth
   arguments and `state` must be URL-encoded by the connection layer. Values in
   connection metadata must be plain text, not pre-encoded strings.
2. In the external HubSpot developer app, preserve the required scope set from
   `ts/src/apps/hubspot/rest.ts`, shared with the app definition. Configure `content` and `cms.domains.read` as
   optional, not required. For developer-platform apps, keep the corresponding
   `auth.optionalScopes` configuration synchronized and deploy the app version.
   For legacy apps, check the app's Auth settings and generated install URL.
3. Build and deploy both the TypeScript catalog and the Qore
   `TypeScriptActionInterface` module. Rebuild its AOT module when used. Reload
   the application catalog and recreate/reload connection objects so they receive
   the updated defaults and HubSpot REST client implementation.
   If `oauth2_alt_token_url` is configured, first deploy the service's
   [signed introspection operation](oauth2-token-introspection.md#delegated-requests).
   Existing alternate-endpoint and signer configuration is reused; no client
   secret needs to be copied into the connection.
4. Review persisted connection overrides. Explicit `oauth2_auth_args` replaces
   the catalog hash, so an old override can hide the new optional scopes. Merge
   `optional_scope` into intentional overrides, retaining other arguments. Leave
   an explicit empty hash for a CRM-only connection that should not request CMS.
   Check overrides of `oauth2_scopes`, the OAuth endpoints and client credentials
   against the same developer app. Do not overwrite intentional settings with a
   blanket migration.
5. Reauthorize connections that need CMS. A refresh token only renews the grant
   it already has; ordinary refresh cannot add these permissions. Confirm the
   target HubSpot account and its CMS subscription, then validate page/domain
   reads after consent. CRM-only connections need no reauthorization.

## Recoverable reauthorization

The application that stores connections owns consent callbacks and durable
credential storage. Keep the active connection usable while preparing a separate
candidate connection with updated authorization metadata. Generate a fresh state
value, validate it on callback, and exchange only an approved authorization code.
Cancelled consent and failed exchange must leave the active credentials intact.

Process the successful response on the candidate using
`processOAuth2TokenResponse()`, retain the returned options in secure temporary
storage, and validate the candidate's required operations. Do not attach the
active connection's persistence callback during this step. Keep both the old
credential record and candidate recoverable until the complete new option set is
durably saved in one transaction. Switch the active connection after that commit.
If saving is interrupted, recover the transaction result and retry with the saved
candidate; do not reuse a consumed authorization code or discard the original
credentials before the result is known. Do not revoke the original refresh token
as part of a failed or cancelled upgrade.

Never log authorization codes, tokens, client secrets, raw OAuth responses, or
staged connection options. Configure host logging to redact credential fields
and disable HTTP body/header debug logging during authorization. The CMS
introspection client uses a form-encoded POST body with no logger, discards raw
metadata errors, and does not save introspection responses in connection options.

## Capability checks and errors

The synchronous REST client used by **Make an API call** introspects the actual
outgoing access token at `/oauth/2026-03/token/introspect` immediately before a
supported CMS request. It uses the generic
`TypeScriptAppRestClient.introspectOAuth2Token()` API, which routes through the
configured alternate OAuth endpoint and signer when present. Direct requests use
the connection's client credentials. This happens after automatic refresh and on authentication
retries. It requires an active token and the operation's granted scope. It never
trusts the requested scopes or a cached permission list. This adds one metadata
request per CMS request and no metadata requests to CRM calls.

The alternate service must support `oauth2_operation=introspect` and return
metadata directly. An unsupported operation, missing signer, or metadata failure
blocks the CMS call with a recoverable error and leaves existing credentials
intact. CRM operations and normal token refresh keep their existing behavior.
See the [generic API contract](oauth2-token-introspection.md) for the exact
request fields and examples.

Missing, declined, unavailable or unverifiable grants produce
`HUBSPOT-CMS-CAPABILITY-ERROR` with reauthorization guidance. A CMS HTTP 403
produces the same error with account subscription/permission guidance, including
when the server rejects an operation despite its scope being granted. Other
transport/API errors retain their original behavior. The check also applies to
raw and bounded synchronous REST requests and copied clients. Direct HubSpot SDK
calls and unrelated CMS endpoint families are outside this page/domain adapter.

## Read-only examples

With the HubSpot connection selected in **Make an API call**, use:

```json
{"method": "GET", "path": "/cms/v3/domains"}
```

```json
{"method": "GET", "path": "/cms/pages/2026-03/site-pages?limit=10"}
```

Use the same connection for `GET /crm/v3/objects/contacts?limit=1` to verify CRM
continues working if CMS consent is declined or unavailable. These examples only
read data; the `content` permission also permits writes, so use a controlled
account for any subsequent editing or publishing work.

## Local verification

Build TypeScript with Node v24, then run:

```bash
cd ts
nvm use v24
node --max-old-space-size=8192 node_modules/typescript/bin/tsc --p tsconfig.build.json
node_modules/.bin/tsc-alias
node node_modules/jest/bin/jest.js --runInBand --config src/jest.config.ts --runTestsByPath src/tests/hubspot-oauth.test.ts
cd ..
cmake --build build --target TypeScriptActionInterface-qmod
env -u QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT -u QORE_TYPESCRIPT_ACTION_SCRIPTS \
  -u QORE_TYPESCRIPT_ACTION_TEST_SCRIPTS \
  QORE_MODULE_DIR=/path/to/updated/qore/qlib:build:qlib \
  qore --enable-debug test/hubspot-oauth.qtest
```

The integration fixture loads the catalog's compiled TypeScript connection
metadata factory through V8, registers it, and uses ephemeral loopback HTTP/HTTPS
listeners. `openssl` generates a temporary fixture certificate in memory. Clear
the three catalog environment variables before launching Qore so installed apps
cannot conflict with the fixture registration.
The Ubuntu and Alpine CI runners clear these variables for this fixture automatically.
It covers consent encoding, persisted overrides, page/domain grants, CRM-only
access, malformed metadata, entitlement rejection, refresh and staged
reauthorization, signed alternate-service introspection, signer preservation on
copied clients, and preservation of non-HTTP request exceptions. It does not use
environment credentials or production content.

## References

- [HubSpot scope catalog](https://developers.hubspot.com/docs/apps/legacy-apps/authentication/scopes)
- [Optional scopes and OAuth](https://developers.hubspot.com/docs/apps/legacy-apps/authentication/working-with-oauth)
- [Developer-platform scope configuration](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/scopes)
- [Pages API](https://developers.hubspot.com/docs/api-reference/latest/cms/pages/guide)
- [Token introspection and refresh](https://developers.hubspot.com/docs/api-reference/latest/authentication/manage-oauth-tokens)
