import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';
import { BitbucketWorkspaceAndRepoOptions } from './constants';

export const BITBUCKET_REPOSITORIES_ALLOWED_PATHS = {
  '/repositories': {
    GET: {},
  },
  '/repositories/{workspace}': {
    GET: {
      override_options: {
        workspace: {
          get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
        },
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
    PUT: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
    POST: {
      override_options: {
        workspace: {
          get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
  },
} satisfies TAllowedPaths;

export const BITBUCKET_REPOSITORIES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: bitbucket as unknown as OpenAPIV2.Document,
  allowedPaths: BITBUCKET_REPOSITORIES_ALLOWED_PATHS,
  app: BITBUCKET_APP_NAME,
});
