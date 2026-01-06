import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import pipedrive from '../../schemas/pipedrive.swagger.json';
import { PIPEDRIVE_ACTIVITIES_ALLOWED_PATHS } from './allowed-paths/activities';
import { PIPEDRIVE_DEALS_ALLOWED_PATHS } from './allowed-paths/deals';
import { PIPEDRIVE_LEADS_ALLOWED_PATHS } from './allowed-paths/leads';
import { PIPEDRIVE_NOTES_ALLOWED_PATHS } from './allowed-paths/notes';
import { PIPEDRIVE_ORGANIZATIONS_ALLOWED_PATHS } from './allowed-paths/organizations';
import { PIPEDRIVE_PERSONS_ALLOWED_PATHS } from './allowed-paths/persons';
import { PIPEDRIVE_PROJECTS_ALLOWED_PATHS } from './allowed-paths/projects';
import { PIPEDRIVE_TASKS_ALLOWED_PATHS } from './allowed-paths/tasks';
import { PIPEDRIVE_APP_NAME } from './base-constants';

export {
  PIPEDRIVE_APP_LOGO,
  PIPEDRIVE_APP_NAME,
  PipedriveError,
  extractPipedriveError,
} from './base-constants';

export const PIPEDRIVE_ALLOWED_PATHS = {
  ...PIPEDRIVE_ACTIVITIES_ALLOWED_PATHS,
  ...PIPEDRIVE_DEALS_ALLOWED_PATHS,
  ...PIPEDRIVE_LEADS_ALLOWED_PATHS,
  ...PIPEDRIVE_NOTES_ALLOWED_PATHS,
  ...PIPEDRIVE_ORGANIZATIONS_ALLOWED_PATHS,
  ...PIPEDRIVE_PERSONS_ALLOWED_PATHS,
  ...PIPEDRIVE_PROJECTS_ALLOWED_PATHS,
  ...PIPEDRIVE_TASKS_ALLOWED_PATHS,
} satisfies TAllowedPaths;

export const PIPEDRIVE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: pipedrive as unknown as OpenAPIV2.Document,
  allowedPaths: PIPEDRIVE_ALLOWED_PATHS,
  app: PIPEDRIVE_APP_NAME,
});
