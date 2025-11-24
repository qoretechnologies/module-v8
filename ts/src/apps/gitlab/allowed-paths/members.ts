import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import {
  getGitlabGroupMemberAllowedValues,
  getGitlabProjectMemberAllowedValues,
} from '../helpers/get-user-allowed-values';

export const GITLAB_MEMBERS_ALLOWED_PATHS = {
  '/api/v4/groups/{id}/members': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
          on_change: ['refetch'],
        },
      },
    },
    POST: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
          on_change: ['refetch'],
        },
      },
    },
  },
  '/api/v4/groups/{id}/members/{user_id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
          on_change: ['refetch'],
        },
        user_id: {
          get_allowed_values: getGitlabGroupMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
          on_change: ['refetch'],
        },
        user_id: {
          get_allowed_values: getGitlabGroupMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getGitlabGroupAllowedValues,
          on_change: ['refetch'],
        },
        user_id: {
          get_allowed_values: getGitlabGroupMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
  },
  '/api/v4/projects/{id}/members': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          on_change: ['refetch'],
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          on_change: ['refetch'],
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v4/projects/{id}/members/{user_id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          on_change: ['refetch'],
          allowed_values_creatable: true,
        },
        user_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          on_change: ['refetch'],
          allowed_values_creatable: true,
        },
        user_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          on_change: ['refetch'],
          allowed_values_creatable: true,
        },
        user_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
