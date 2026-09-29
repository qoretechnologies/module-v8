// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { hubspotContract } from '../../../schema-cache/hubspot';

/** Build stable action metadata without reading schemas, caches or the network. */
export function buildHubspotActions(
  options: Omit<Parameters<typeof buildActionsFromSwaggerSchema>[0], 'schema'> & { schemaPath: string }
) {
  const contract = hubspotContract.schemas[options.schemaPath];
  if (!contract) throw new Error(`Unknown HubSpot schema contract: ${options.schemaPath}`);
  const paths: OpenAPIV2.PathsObject = {};
  for (const operation of contract.operations) {
    const methods = (paths[operation.path] ||= {});
    (methods as Record<string, OpenAPIV2.OperationObject>)[operation.method] = {
      operationId: operation.action, responses: {},
    };
  }
  const actions = buildActionsFromSwaggerSchema({
    ...options,
    schema: { swagger: '2.0', info: { title: 'Qore HubSpot action contract', version: '1' }, paths },
  });
  if (actions.length !== contract.operations.length) {
    throw new Error(`HubSpot action overrides differ from the contract: ${options.schemaPath}`);
  }
  return actions;
}
