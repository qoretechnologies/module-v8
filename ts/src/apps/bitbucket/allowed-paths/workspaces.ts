import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';

export const BITBUCKET_WORKSPACES_ALLOWED_PATHS = {
  '/workspaces': {
    GET: {},
  },
  '/workspaces/{workspace}': {
    GET: {
      override_options: {
        workspace: {
          get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
        },
      },
    },
  },
  '/workspaces/{workspace}/members': {
    GET: {
      override_options: {
        workspace: {
          get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
        },
      },
    },
  },
  '/workspaces/{workspace}/projects': {
    GET: {
      override_options: {
        workspace: {
          get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const BITBUCKET_WORKSPACES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: bitbucket as unknown as OpenAPIV2.Document,
  allowedPaths: BITBUCKET_WORKSPACES_ALLOWED_PATHS,
  app: BITBUCKET_APP_NAME,
});
