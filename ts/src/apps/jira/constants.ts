import { createAllowedPaths } from '../../global/helpers';
import { IQoreConnectionOptions } from '../zendesk';

export const JIRA_APP_NAME = 'Jira';
export const JIRA_ALLOWED_PATHS = createAllowedPaths([
  '/rest/api/3/announcementBanner',
  '/rest/api/3/issue',
  '/rest/api/3/project',
  '/rest/api/3/project/{projectIdOrKey}',
  '/rest/api/3/issue/{issueIdOrKey}',
  '/rest/api/3/issue/{issueIdOrKey}/comment',
  '/rest/api/3/issue/{issueIdOrKey}/comment/{id}',
  '/rest/api/3/issue/{issueIdOrKey}/worklog',
  '/rest/api/3/issue/{issueIdOrKey}/worklog/{id}',
  '/rest/api/3/field',
  '/rest/api/3/field/{fieldId}',
  '/rest/api/3/field/{id}/trash',
  '/rest/api/3/status',
]);

export const JIRA_SWAGGER_API_PATH = '/rest/api/3/';

export const JIRA_CONN_OPTIONS = {
  cloud_id: {
    display_name: 'Cloud ID',
    short_desc: 'The cloud ID',
    desc: 'The cloud ID',
    type: 'string',
  },
} satisfies IQoreConnectionOptions;
