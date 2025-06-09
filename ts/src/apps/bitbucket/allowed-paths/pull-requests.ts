import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import bitbucket from '../../../schemas/bitbucket.swagger.json';
import { BITBUCKET_APP_NAME } from '../constants';
import { getBitbucketPullRequestAllowedValues } from '../helpers/get-pull-request-allowed-values';
import { getBitbucketBranchAllowedValues } from '../helpers/get-pull-request-branch-allowed-values';
import { getBitbucketPullRequestCommentAllowedValues } from '../helpers/get-pull-request-comment-allowed-values';
import { BitbucketWorkspaceAndRepoOptions } from './constants';
import { getBitbucketWorkspaceMemberAllowedValues } from '../helpers/get-workspace-member-allowed-values';

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
        source: {
          type: 'softstring',
          get_allowed_values: getBitbucketBranchAllowedValues,
          allowed_values_creatable: true,
          required: true,
        },
        destination: {
          type: 'softstring',
          get_allowed_values: getBitbucketBranchAllowedValues,
          allowed_values_creatable: true,
          required: false,
          preselected: true,
        },
        type: {
          required: false,
        },
        title: {
          required: true,
        },
        reviewers: {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getBitbucketWorkspaceMemberAllowedValues,
        },
      },
      request_data_converter: (req) => {
        if (!req?.body) return req;

        const { body, ...rest } = req;

        const source = body.source;
        const destination = body.destination;
        const reviewers = body.reviewers?.length ? body.reviewers : undefined;

        return {
          ...rest,
          body: {
            ...omit(body, ['source', 'destination', 'reviewers']),
            source: {
              branch: {
                name: source,
              },
            },

            ...(destination && {
              destination: {
                branch: {
                  name: destination,
                },
              },
            }),

            ...(reviewers && {
              reviewers: reviewers.map((reviewer: string) => ({
                uuid: reviewer,
              })),
            }),
          },
        };
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
        type: {
          required: false,
        },
        pull_request_id: {
          type: 'softstring',
          depends_on: ['workspace', 'repo_slug'],
          get_allowed_values: getBitbucketPullRequestAllowedValues,
        },
        source: {
          type: 'softstring',
          get_allowed_values: getBitbucketBranchAllowedValues,
          allowed_values_creatable: true,
          required: false,
          preselected: true,
        },
        destination: {
          type: 'softstring',
          get_allowed_values: getBitbucketBranchAllowedValues,
          allowed_values_creatable: true,
          required: false,
          preselected: true,
        },
        title: {
          required: false,
          preselected: true,
        },
        reviewers: {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getBitbucketWorkspaceMemberAllowedValues,
        },
      },
      request_data_converter: (req) => {
        if (!req?.body) return req;

        const { body, ...rest } = req;

        const source = body.source;
        const destination = body.destination;
        const reviewers = body.reviewers?.length ? body.reviewers : undefined;

        return {
          ...rest,
          body: {
            ...omit(body, ['source', 'destination', 'reviewers']),
            ...(source && {
              source: {
                branch: {
                  name: source,
                },
              },
            }),

            ...(destination && {
              destination: {
                branch: {
                  name: destination,
                },
              },
            }),

            ...(reviewers && {
              reviewers: reviewers.map((reviewer: string) => ({
                uuid: reviewer,
              })),
            }),
          },
        };
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
        type: {
          required: false,
        },
        content: {
          required: true,
        },
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
        type: {
          required: false,
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
