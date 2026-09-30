# Pipedrive and Trello schema migration

Copyright 2026 Qore Technologies, s.r.o.

This migration addresses [Qore issue 5473](https://github.com/qoretechnologies/qore/issues/5473).
It retains **47 Pipedrive and 38 Trello actions/triggers**, with their existing
action identifiers and owned presentation identifiers. Request and response
fields follow the reviewed official schemas retrieved on September 30, 2026.

Install the matching catalogue, V8 module and Qore standard library together.
The Qore `OpenApi3` fix preserves Trello's combined API-key/token security
requirement, and the V8 fix materializes extra board/list selection fields.
Without these schema fixes, qualification fails and cannot activate the candidate.
The Qore `RestClient` fix that preserves explicit authorization headers with
saved tokens is also required for authenticated native Trello requests.

```sh
qore-app-schemas update pipedrive trello
qore-app-schemas run -- YOUR_APPLICATION
```

Restart existing application processes after activation. Previously qualified
legacy schemas are incompatible with this catalogue's new contract. Rollback
works between snapshots qualified for the installed contract; rolling back the
application version also requires its matching catalogue and saved snapshot.
Builds, package installation and ordinary startup remain offline. Provider
documents are downloaded only by explicit setup commands and are not added to
Debian source or binary packages.

## Pipedrive

The app combines the official [v1](https://developers.pipedrive.com/docs/api/v1/openapi.json)
and [v2](https://developers.pipedrive.com/docs/api/v2/openapi.json) documents.
Versioned paths and namespaced component references prevent collisions between
the two generations. Authentication remains OAuth bearer-token authentication;
contact writes require the `contacts:full` scope and existing connections may
need renewed consent.

| Resources | API path | Update method |
| --- | --- | --- |
| Activities, deals, organizations, persons, projects, tasks | `/api/v2/...` | `PATCH` |
| Leads | `/v1/leads` | `PATCH` |
| Notes | `/v1/notes` | `PUT` |

Existing workflows should review their input mappings and downstream response
consumers against the [provider migration guide](https://pipedrive.readme.io/docs/pipedrive-api-v2-migration-guide):

- Use `owner_id` instead of the old activity/deal `user_id` option. List actions
  use `cursor`, `sort_by` and `sort_direction` instead of v1 offsets and sort
  expressions. Activity list filters follow the current schema, without the
  removed `type` parameter.
- Activity attendees use `email`, and participants use `primary`. Set a primary
  participant to associate a person; the activity write API no longer has a
  standalone `person_id` input. `outcome` is an optional integer ID.
- Project writes use `person_ids` and `org_ids` arrays. Deal writes no longer
  expose the old `origin_id` and `channel_id` options. Person email and phone
  lists use the v2 `emails` and `phones` names.
- v2 uses typed booleans/numbers, revised timestamps and simpler related IDs.
  Do not assume the old embedded related-object response shape. Optional
  response fields may require `include_fields`.
- v2 custom fields are nested under `custom_fields`. Record helpers retain
  their flat column interface and nest/flatten these values at the API boundary.
  Leads and notes keep their v1 request bodies.

Allowed-value and record searches follow `additional_data.next_cursor` for v2
and the server's `pagination.next_start` for v1. They reject malformed or
repeated continuation values and propagate transport failures. The record
iterator returns the last page before ending and does not repeat completed
pages. Account field metadata, filters, users, activity types and project
board/phase helpers continue using documented v1 endpoints; project templates
use v2. Webhook registrations retain their existing contract; example-data
reads use the current resource version. Notes do not support saved-filter
conditions; record searches reject these conditions before making a request.

For offline import, create a JSON object containing the two downloaded documents:

```sh
node -e 'const fs=require("fs"); const result={}; for(const v of ["v1","v2"]) result[v]=JSON.parse(fs.readFileSync(v+".json")); fs.writeFileSync("pipedrive.json",JSON.stringify(result));'
qore-app-schemas import pipedrive /absolute/path/pipedrive.json
```

## Trello

The app uses the official [OpenAPI 3 document](https://dac-static.atlassian.com/cloud/trello/swagger.v3.json).
All supported operations retain their action identifiers, including the
upstream spelling change for `get-members-id`. Known trailing-slash aliases
remain normalized. Both API key and token remain required together; the
schema's security declaration is preserved.

The native adapter sends encoded path/query values exactly once and passes an
empty request object to converters for path-only calls. Trello board/list
selectors used only by forms are removed from both query and body locations
before sending requests.

Compared with the old Swagger 2 input, board updates no longer expose
`labelNames/color` query parameters. Use the existing label actions to manage
labels. Card creation adds `cardRole`; card updates add `cover` and describe
`pos` with a union. The card ID remains a path parameter. Native OpenAPI types
provide the reviewed request/response constraints. Trello record helpers use
the same REST endpoints and authentication as before.

## Qualification

`app-contracts.json`, `app-sources.json` and `app-compatibility.json` change
together. Compatibility still covers request/response fields, presentation,
constraints, references and security. No fingerprint is learned from downloads.
The updater now resolves deferred input options and output types for every
supported action in separate normal and AST processes, before activation.

Repository CI explicitly retrieves checksum-pinned private inputs listed in
`test/docker_test/app-schema-inputs.json`. The other six apps retain their
historical qualification inputs. Downloaded documents are removed with the
private cache and must not be retained as CI artifacts. Changing a pin requires
schema review, deterministic regression tests and runtime qualification.

Re-extract the source-owned presentation with the workflow in
[provider-i18n-catalogs.md](../design/provider-i18n-catalogs.md). Action identities
and owned English presentation are unchanged; retain translations only where
the generated root ID and source match exactly. Schema-generated dynamic forms
must also be checked by complete action materialization.

Deterministic tests cover schema composition, version routing, custom fields,
pagination, malformed inputs, failed downloads, native field overrides,
security requirements, qualification failure and snapshot preservation.
Authenticated read/write and pagination checks require dedicated service test
accounts. Offline metadata qualification does not establish live service access.

For native Pipedrive CRUD and cursor-pagination qualification, set
`PIPEDRIVE_APIKEY` for a test account and run:

```sh
qore-app-schemas run -- qore --enable-debug test/docker_test/qualify-live-pipedrive.qr
node test/docker_test/qualify-live-pipedrive-client.cjs
```

The test creates uniquely named persons, a deal, a lead, a note and an activity,
and removes its records on success or failure. It uses API-key headers, so this
does not test OAuth consent or token refresh. The Node test exercises the shared
PATCH and allowed-value helpers across two cursor pages and removes its own
test persons. Set `QORE_TYPESCRIPT_MASTER_ACTION_SCRIPT` to the catalogue entry
point when testing a development build.

For Trello, set `TRELLO_KEY` to the API key and `TRELLO_APIKEY` to the user
authorization token for the same application, then run:

```sh
qore-app-schemas run -- qore --enable-debug test/docker_test/qualify-live-trello.qr
node test/docker_test/qualify-live-trello-client.cjs
```

Each test creates a uniquely named private board and removes it and its contents
on success or failure. Native tests exercise board/list/card actions; the Node
test covers shared requests, allowed values and two record iterator pages.
Trello's list-card helper fetches the cards once and paginates locally.
An application signing secret cannot replace the user token.
