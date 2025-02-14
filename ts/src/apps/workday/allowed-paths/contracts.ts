import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdayContracts from '../../../schemas/workday/contracts.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_CONTRACTS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_CONTRACTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayContracts as unknown as OpenAPIV2.Document,
  schemaPath: 'contracts',
  app: WORKDAY_APP_NAME,
});
