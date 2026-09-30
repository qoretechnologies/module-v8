# Maintaining the HubSpot schema contract

Copyright 2026 Qore Technologies, s.r.o.

HubSpot documents are downloaded into a private cache by an explicit operator
command. They are not included in the source or binary packages. The catalogue
owns its supported action inventory and English action presentation in
`ts/src/schema-cache/hubspot-contract.json`. A downloaded operation cannot rename
an action or silently add an action to that inventory.

`hubspot-compatibility.json` contains SHA-256 fingerprints of the normalized
operations and their transitive local references. Inputs, outputs, validation
constraints, required fields, choices and presentation participate in the
fingerprint. Object key order, document-level publication metadata and unused
endpoints do not. The compatibility file participates in the snapshot's contract
digest, so a cache qualified against another catalogue contract cannot be reused
silently.

Update, import and rollback check compatibility and then materialize every
supported action with the installed Qore runtime. Only a successful candidate
becomes active. Each process receives a fixed snapshot path; activation affects
subsequent launches, and existing processes must be restarted explicitly.

When an upstream change affects supported operations:

1. Obtain the ten supported v3 documents from HubSpot into a private directory.
   Preserve the previous inputs locally to review the change. Do not commit
   documents or add them to CI artifacts.
2. Review the changed request and response fields, constraints, requiredness and
   presentation. Update action overrides and the operation inventory if needed.
   New upstream endpoints require an explicit supported-action decision.
3. Build the catalogue. Use the exported `normalizeSchema(name, document)` and
   `schemaCompatibilityDigest(normalized)` functions from
   `ts/dist/schema-cache/hubspot.js` to calculate proposed fingerprints for the
   reviewed documents. Update the compatibility file and rebuild. Never replace
   fingerprints automatically as part of `update`, package builds or CI.
4. Import the candidate with `qore-hubspot-schemas import DIRECTORY` using the
   matching installed native module. Pin its snapshot for the following checks.
   Extract the HubSpot source catalogue with
   `qore-data-provider-i18n --module TypeScriptActionInterface --app Hubspot --output STAGING`.
   Review existing message identities, update the owned root catalogue and
   translate new or changed strings in every shipped locale. English fallback
   is not release qualification.
5. Run the schema-cache regression tests, source-owned i18n validation, full
   installed-provider qualification and both Ubuntu and Alpine CI scripts.
   Validate authenticated API calls separately when a change affects request
   behavior; metadata qualification cannot confirm live service behavior.
6. Release the catalogue contract, action changes and translations together.
   Operators can then update their cache and restart applications deliberately.

CI explicitly downloads a private candidate before provider materialization.
It keeps the provenance/checksum manifest and qualification reports, and removes
the downloaded documents on exit. A changed supported schema fails CI with an
actionable compatibility error, rather than silently changing app behavior.
CI and the explicit translation-regeneration workflow require network access;
Debian package builds and installed application startup do not download schemas.

## Other app schema snapshots

Freshdesk, Magento, Mailchimp, NetSuite, Pipedrive, Trello, Zendesk and Zoom use
the same explicit setup model through `qore-app-schemas`. The technical action
inventory and existing English presentation live in
`ts/src/schema-cache/app-contracts.json`; approved supported-surface fingerprints
live in `app-compatibility.json`. Provider source URLs and import instructions
live in `app-sources.json`. An app's fingerprint list is reviewed source data,
never a list automatically learned from downloads. Route aliases and the existing
Mailchimp type correction are applied once by `normalizeSchema()`.

Each app has a separate cache and writer lock. Import/update/rollback first
validate bounded JSON and local references, then compatibility and every action
in an installed Qore process. Only a successful candidate changes that app's
atomic active selection. The `run` wrapper passes a JSON map of immutable paths
in `QORE_APP_SCHEMA_SNAPSHOTS`. Discovery exposes the exact owned inventory even
when setup is missing; materialization retains `APP-SCHEMAS-UNAVAILABLE` as a
structured failure. A new download cannot rename actions or add unreviewed fields.

The repository retains its existing eight historical schema inputs for CI and
translation qualification. `test/docker_test/setup-app-schemas.sh` explicitly
imports those inputs into a temporary private cache, fully qualifies every app,
and returns its snapshot map. CI saves only manifests/reports and removes the
cache on exit. This keeps CI independent of account credentials and changing
public API versions. Public-source retrieval is tested separately from those
fixed regression inputs.

Debian export **must** use `ts/debian/export-source.py`. It omits the eight
documents from the source package. `copy-schemas.js` omits them from compiled
catalogues, and Debian build/install checks reject documents in either inputs
or payloads. There is no implicit fallback to a repository or installed schema.
The metadata package retains its other dependency redistribution review gates.

For a supported upstream change, follow the review, action/schema qualification,
presentation extraction, translation-parity and installed-artifact checks above.
Compute proposed fingerprints with `normalizeSchema(id, document)` and
`schemaCompatibilityDigest(normalized)` from `dist/schema-cache/apps.js`. Review
the request/response and security changes before adding any fingerprint. A newly
removed endpoint or changed API generation requires an app migration; copying a
new fingerprint into the allowlist cannot repair missing operations.

NetSuite retrieval uses an account-specific HTTPS endpoint and an owner-only
bearer-token file. It never follows redirects or saves credentials. No live
account call is part of the offline regression suite. Local imports remain
available for account-bound schemas and providers without a verified public
download. Service owners must test authenticated API behavior separately.
