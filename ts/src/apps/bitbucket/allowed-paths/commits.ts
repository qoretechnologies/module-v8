import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { getBitbucketCommitAllowedValues } from '../helpers/get-commit-allowed-values';
import { BitbucketWorkspaceAndRepoOptions } from './constants';

export const BITBUCKET_COMMITS_ALLOWED_PATHS = {
  '/repositories/{workspace}/{repo_slug}/commits': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}/commit/{commit}': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        commit: {
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketCommitAllowedValues,
        },
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}/commit/{commit}/reports': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,

        commit: {
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketCommitAllowedValues,
        },
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}/commit/{commit}/comments': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,

        commit: {
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketCommitAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,

        commit: {
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketCommitAllowedValues,
        },
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}/commit/{commit}/approve': {
    POST: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,

        commit: {
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketCommitAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,

        commit: {
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketCommitAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const BITBUCKET_COMMITS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: bitbucket as unknown as OpenAPIV2.Document,
  allowedPaths: BITBUCKET_COMMITS_ALLOWED_PATHS,
  app: BITBUCKET_APP_NAME,
});
