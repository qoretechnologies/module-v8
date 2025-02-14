import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdayEvents from '../../../schemas/workday/events.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_EVENTS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_EVENTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayEvents as unknown as OpenAPIV2.Document,
  schemaPath: 'events',
  app: WORKDAY_APP_NAME,
});
