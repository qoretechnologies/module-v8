import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { BitbucketWorkspaceAndRepoOptions } from './constants';
import { getBitbucketPullRequestAllowedValues } from '../helpers/get-pull-request-allowed-values';
import { getBitbucketPullRequestCommentAllowedValues } from '../helpers/get-pull-request-comment-allowed-values';

export const BITBUCKET_PULL_REQUESTS_ALLOWED_PATHS = {
  '/repositories/{workspace}/{repo_slug}/pullrequests': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
    POST: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}/pullrequests/{pull_request_id}': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
      },
    },
  },
  '/repositories/{workspace}/{repo_slug}/pullrequests/{pull_request_id}/comments': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
      },
    },
  },

  '/repositories/{workspace}/{repo_slug}/pullrequests/{pull_request_id}/comments/{comment_id}': {
    GET: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          on_change: ['refetch'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
        comment_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug', 'pull_request_id'],
          get_allowed_values: getBitbucketPullRequestCommentAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          on_change: ['refetch'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
        comment_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug', 'pull_request_id'],
          get_allowed_values: getBitbucketPullRequestCommentAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...BitbucketWorkspaceAndRepoOptions,
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          on_change: ['refetch'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
        comment_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug', 'pull_request_id'],
          get_allowed_values: getBitbucketPullRequestCommentAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const BITBUCKET_PULL_REQUESTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: bitbucket as unknown as OpenAPIV2.Document,
  allowedPaths: BITBUCKET_PULL_REQUESTS_ALLOWED_PATHS,
  app: BITBUCKET_APP_NAME,
});
