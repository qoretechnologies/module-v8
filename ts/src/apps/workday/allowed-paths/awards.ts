import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import workdayAwards from '../../../schemas/workday/awards.swagger.json';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import { OpenAPIV2 } from 'openapi-types';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_AWARDS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_AWARDS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayAwards as OpenAPIV2.Document,
  schemaPath: 'awards',
  app: WORKDAY_APP_NAME,
});
