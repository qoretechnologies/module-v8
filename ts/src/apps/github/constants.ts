import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { getGitHubBranchIdAllowedValues } from './helpers/get-branch-id-allowed-values';
import { getGitHubIssueIdAllowedValues } from './helpers/get-issue-id-allowed-values';
import { getGitHubOwnerAllowedValues } from './helpers/get-owner-allowed-values';
import { getGitHubOwnerDefaultValue } from './helpers/get-owner-default-value';
import { getGitHubPullIdAllowedValues } from './helpers/get-pull-id-allowed-values';
import { getGitHubRepositoryIdAllowedValues } from './helpers/get-repository-id-allowed-values';
import { getGitHubOrgAllowedValues } from './helpers/get-user-org-allowed-values';
import { getGitHubAssigneesAllowedValues } from './helpers/get-assignee-allowed-values';
import { getGitHubIssueLabelsAllowedValues } from './helpers/get-issue-label-allowed-values';

export const GITHUB_APP_NAME = 'Github';

export const repoOwnerCommonOptions = {
  repo: {
    get_allowed_values: getGitHubRepositoryIdAllowedValues,
    required: true,
    type: 'string',
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
  owner: {
    get_allowed_values: getGitHubOwnerAllowedValues,
    get_default_value: getGitHubOwnerDefaultValue,
    required: true,
    type: 'string',
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOverrideOption>;

export const GITHUB_ALLOWED_PATHS: TAllowedPaths = {
  '/repos/{owner}/{repo}/pulls': {
    GET: {
      override_options: repoOwnerCommonOptions,
      independent_path_vars: ['repo'],
    },
    POST: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        title: { required: true },
        head: { required: true },
        base: { required: true },
        body: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/pulls/{pull_number}': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    PATCH: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
  },
  '/repos/{owner}/{repo}/issues': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    POST: {
      independent_path_vars: ['repo'],
      override_options: {
        title: { required: true, type: 'string' },
        body: { required: true },
        assignee: {
          allowed_values_creatable: true,
          get_allowed_values: getGitHubAssigneesAllowedValues,
        },
        assignees: {
          element_allowed_values_creatable: true,
          get_element_allowed_values: getGitHubAssigneesAllowedValues,
        },
        labels: {
          element_allowed_values_creatable: true,
          get_element_allowed_values: getGitHubIssueLabelsAllowedValues,
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        ...repoOwnerCommonOptions,
      },
    },
  },
  '/repos/{owner}/{repo}/issues/{issue_number}': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        issue_number: {
          get_allowed_values: getGitHubIssueIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    PATCH: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        issue_number: {
          get_allowed_values: getGitHubIssueIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
  },
  '/repos/{owner}/{repo}/commits': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/branches': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/releases': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    POST: {
      independent_path_vars: ['repo'],
      override_options: {
        tag_name: { required: true },
        name: { required: true },
        body: { required: true },
        ...repoOwnerCommonOptions,
      },
    },
  },
  '/repos/{owner}/{repo}/contributors': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/orgs/{org}/members': {
    GET: {
      override_options: {
        org: {
          get_allowed_values: getGitHubOrgAllowedValues,
          required: true,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/orgs/{org}/repos': {
    GET: {
      override_options: {
        org: {
          get_allowed_values: getGitHubOrgAllowedValues,
          required: true,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        name: { required: true },
        org: {
          get_allowed_values: getGitHubOrgAllowedValues,
          required: true,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    PATCH: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    DELETE: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/contents/{path}': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    PUT: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    DELETE: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/issues': {
    GET: {},
  },
  '/user/repos': {
    GET: {},
    POST: {
      override_options: {
        name: { required: true },
      },
    },
  },
  '/search/repositories': {
    GET: {},
  },
  '/search/issues': {
    GET: {},
  },
  '/repos/{owner}/{repo}/collaborators': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/actions/workflows': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/issues/{issue_number}/assignees': {
    POST: {
      independent_path_vars: ['repo'],
      override_options: {
        assignees: { required: true },
        ...repoOwnerCommonOptions,
        issue_number: {
          get_allowed_values: getGitHubIssueIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    DELETE: {
      independent_path_vars: ['repo'],
      override_options: {
        assignees: { required: true },
        ...repoOwnerCommonOptions,
        issue_number: {
          get_allowed_values: getGitHubIssueIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
  },
  '/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers': {
    POST: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          depends_on: ['owner', 'repo'],
        },
        reviewers: { required_groups: ['reviewers'] },
        team_reviewers: { required_groups: ['team_reviewers'] },
      },
    },
    DELETE: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    GET: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          depends_on: ['owner', 'repo'],
        },
      },
    },
  },
  '/repos/{owner}/{repo}/git/refs': {
    POST: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        ref: { required: true },
        sha: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/branches/{branch}': {
    GET: {
      independent_path_vars: ['repo'],
      override_options: {
        ...repoOwnerCommonOptions,
        branch: {
          get_allowed_values: getGitHubBranchIdAllowedValues,
          depends_on: ['owner', 'repo'],
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/actions/secrets/{secret_name}': {
    PUT: {
      independent_path_vars: ['repo'],
      override_options: {
        secret_name: { required: true },
        encrypted_value: { required: true },
        key_id: { required: true },
        ...repoOwnerCommonOptions,
      },
    },
    DELETE: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    GET: {
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/actions/secrets/public-key': {
    GET: {
      independent_path_vars: ['repo'],
    },
  },
};
