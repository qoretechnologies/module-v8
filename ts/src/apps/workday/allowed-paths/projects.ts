import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import workdayProjects from '../../../schemas/workday/projects.swagger.json';
import { WORKDAY_APP_NAME } from '../constants';

export const WORKDAY_PROJECTS_ALLOWED_PATHS = {} satisfies TAllowedPaths;

export const WORKDAY_PROJECTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: workdayProjects as unknown as OpenAPIV2.Document,
  schemaPath: 'projects',
  app: WORKDAY_APP_NAME,
});
