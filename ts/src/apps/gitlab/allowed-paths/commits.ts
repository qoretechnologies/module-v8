import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabBranchAllowedValues } from '../helpers/get-branch-allowed-values';
import { getGitlabCommitAllowedValues } from '../helpers/get-commit-allowed-values';

const commonOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    allowed_values_creatable: true,
    on_change: ['refetch'],
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_COMMITS_ALLOWED_PATHS = {
  '/api/v4/projects/{id}/repository/commits': {
    GET: {
      override_options: {
        ...commonOptions,
        ref_name: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        ...commonOptions,
        start_branch: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
        },
        start_project: {
          allowed_values_creatable: true,
          get_allowed_values: getGitlabProjectAllowedValues,
        },
        start_sha: {
          depends_on: ['id'],
          allowed_values_creatable: true,
          get_allowed_values: getGitlabCommitAllowedValues,
        },
      },
    },
  },
  '/api/v4/projects/{id}/repository/commits/{sha}': {
    GET: {
      override_options: {
        ...commonOptions,
        sha: {
          get_allowed_values: getGitlabCommitAllowedValues,
          depends_on: ['id'],
        },
      },
    },
  },
  '/api/v4/projects/{id}/repository/commits/{sha}/comments': {
    GET: {
      override_options: {
        ...commonOptions,
        sha: {
          get_allowed_values: getGitlabCommitAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    POST: {
      override_options: {
        ...commonOptions,
        sha: {
          get_allowed_values: getGitlabCommitAllowedValues,
          depends_on: ['id'],
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
