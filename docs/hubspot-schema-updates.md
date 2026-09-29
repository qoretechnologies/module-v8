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
