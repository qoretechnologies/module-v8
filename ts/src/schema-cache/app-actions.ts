// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../global/helpers';
import { appContract } from './apps';

/** Build only owned action identities and overrides; never load external schemas during discovery. */
export function buildAppSchemaActions(id: string,
  options: Omit<Parameters<typeof buildActionsFromSwaggerSchema>[0], 'schema'>) {
  const contract = appContract(id);
  const paths: OpenAPIV2.PathsObject = Object.create(null);
  for (const op of contract.operations) {
    const item = paths[op.path] ||= {};
    (item as Record<string, OpenAPIV2.OperationObject>)[op.method] = {
      operationId: op.operationId, responses: {},
    };
  }
  const actions = buildActionsFromSwaggerSchema({ ...options, schema: {
    swagger: '2.0', info: { title: `Qore ${contract.app} action contract`, version: '1' }, paths,
  } });
  return actions.map(action => {
    const presentation = contract.presentation[action.action];
    if (!presentation) throw new Error(`Missing owned action presentation: ${contract.app}/${action.action}`);
    return { ...action, ...presentation };
  });
}
