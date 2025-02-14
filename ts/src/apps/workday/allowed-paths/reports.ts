import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdayReports from '../../../schemas/workday/reports.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_REPORTS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_REPORTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayReports as unknown as OpenAPIV2.Document,
  schemaPath: 'reports',
  app: WORKDAY_APP_NAME,
});
