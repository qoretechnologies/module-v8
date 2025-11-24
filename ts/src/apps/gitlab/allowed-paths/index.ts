import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import gitlab from '../../../schemas/gitlab.swagger.json';
import { GITLAB_APP_NAME, GITLAB_CONN_OPTIONS } from '../constants';
import { GITLAB_BRANCHES_ALLOWED_PATHS } from './branches';
import { GITLAB_COMMITS_ALLOWED_PATHS } from './commits';
import { GITLAB_DEPLOY_KEYS_ALLOWED_PATHS } from './deploy-keys';
import { GITLAB_GROUPS_ALLOWED_PATHS } from './groups';
import { GITLAB_ISSUES_ALLOWED_PATHS } from './issues';
import { GITLAB_MEMBERS_ALLOWED_PATHS } from './members';
import { GITLAB_MERGE_REQUESTS_ALLOWED_PATHS } from './merge-requests';
import { GITLAB_PROJECTS_ALLOWED_PATHS } from './projects';
import { GITLAB_VARIABLES_ALLOWED_PATHS } from './variables';
import { GITLAB_WIKIS_ALLOWED_PATHS } from './wikis';

export const GITLAB_ALLOWED_PATHS = {
  ...GITLAB_BRANCHES_ALLOWED_PATHS,
  ...GITLAB_COMMITS_ALLOWED_PATHS,
  ...GITLAB_DEPLOY_KEYS_ALLOWED_PATHS,
  ...GITLAB_GROUPS_ALLOWED_PATHS,
  ...GITLAB_ISSUES_ALLOWED_PATHS,
  ...GITLAB_MEMBERS_ALLOWED_PATHS,
  ...GITLAB_MERGE_REQUESTS_ALLOWED_PATHS,
  ...GITLAB_PROJECTS_ALLOWED_PATHS,
  ...GITLAB_VARIABLES_ALLOWED_PATHS,
  ...GITLAB_WIKIS_ALLOWED_PATHS,
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;

export const GITLAB_ACTIONS = buildActionsFromSwaggerSchema({
  schema: gitlab as unknown as OpenAPIV2.Document,
  allowedPaths: GITLAB_ALLOWED_PATHS,
  app: GITLAB_APP_NAME,
});
