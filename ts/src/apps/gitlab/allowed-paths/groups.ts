import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabGroupAllowedValues } from '../helpers/get-group-allowed-values';

export const GITLAB_GROUPS_ALLOWED_PATHS = {
  '/api/v4/groups': {
    GET: {},
    POST: {
      override_options: {
        parent_id: {
          required: true,
          get_allowed_values: getGitlabGroupAllowedValues,
        },
      },
    },
  },
  '/api/v4/groups/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
