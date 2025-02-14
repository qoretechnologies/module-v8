import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdaySuppliers from '../../../schemas/workday/suppliers.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_SUPPLIERS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_SUPPLIERS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdaySuppliers as unknown as OpenAPIV2.Document,
  schemaPath: 'suppliers',
  app: WORKDAY_APP_NAME,
});
