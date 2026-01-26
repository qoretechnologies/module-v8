import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabBranchAllowedValues } from '../helpers/get-branch-allowed-values';

const commonOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_BRANCHES_ALLOWED_PATHS = {
  '/api/v4/projects/{id}/repository/branches': {
    GET: {
      override_options: {
        ...commonOptions,
      },
    },
    POST: {
      override_options: {
        ...commonOptions,
      },
    },
  },
  '/api/v4/projects/{id}/repository/branches/{branch}': {
    GET: {
      override_options: {
        ...commonOptions,
        branch: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonOptions,
        branch: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
        },
      },
    },
  },
  '/api/v4/projects/{id}/repository/merged_branches': {
    DELETE: {
      override_options: {
        ...commonOptions,
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
