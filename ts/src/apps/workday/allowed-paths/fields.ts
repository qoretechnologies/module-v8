import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdayFields from '../../../schemas/workday/fields.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_FIELDS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_FIELDS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayFields as unknown as OpenAPIV2.Document,
  schemaPath: 'fields',
  app: WORKDAY_APP_NAME,
});
