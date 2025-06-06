import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { BitbucketWorkspaceAndRepoOptions } from './constants';

export const BITBUCKET_DEPLOYMENTS_ALLOWED_PATHS = {
  '/repositories/{workspace}/{repo_slug}/deployments': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
  },
} satisfies TAllowedPaths;

export const BITBUCKET_DEPLOYMENTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: bitbucket as unknown as OpenAPIV2.Document,
  allowedPaths: BITBUCKET_DEPLOYMENTS_ALLOWED_PATHS,
  app: BITBUCKET_APP_NAME,
});
