import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';

export const BITBUCKET_SEARCH_ALLOWED_PATHS = {
  '/teams/{username}/search/code': {
    GET: {},
  },
  '/users/{selected_user}/search/code': {
    GET: {},
  },
  '/workspaces/{workspace}/search/code': {
    GET: {
      override_options: {
        workspace: {
          allowed_values_creatable: true,
          get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const BITBUCKET_SEARCH_ACTIONS = buildActionsFromSwaggerSchema({
  schema: bitbucket as unknown as OpenAPIV2.Document,
  allowedPaths: BITBUCKET_SEARCH_ALLOWED_PATHS,
  app: BITBUCKET_APP_NAME,
});
