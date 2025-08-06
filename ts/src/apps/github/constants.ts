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
      group: 'pull-requests',
      override_options: repoOwnerCommonOptions,
      independent_path_vars: ['repo'],
    },
    POST: {
      group: 'pull-requests',
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
      group: 'pull-requests',
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
      group: 'pull-requests',
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
      group: 'issues',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    POST: {
      group: 'issues',
      independent_path_vars: ['repo'],
      override_options: {
        title: { required: true, type: 'string' },
        body: { required: true },
        assignee: {
          allowed_values_creatable: true,
          get_allowed_values: getGitHubAssigneesAllowedValues,
        },
        assignees: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          element_allowed_values_creatable: true,
          get_element_allowed_values: getGitHubAssigneesAllowedValues,
          depends_on: ['repo', 'owner'],
        },
        labels: {
          element_allowed_values_creatable: true,
          get_element_allowed_values: getGitHubIssueLabelsAllowedValues,
          depends_on: ['repo', 'owner'],
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
      group: 'issues',
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
      group: 'issues',
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
      group: 'commits',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/branches': {
    GET: {
      group: 'branches',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/releases': {
    GET: {
      group: 'releases',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    POST: {
      group: 'releases',
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
      group: 'members',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/orgs/{org}/members': {
    GET: {
      group: 'members',
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
      group: 'repositories',
      override_options: {
        org: {
          get_allowed_values: getGitHubOrgAllowedValues,
          required: true,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      group: 'repositories',
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
      group: 'repositories',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    PATCH: {
      group: 'repositories',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    DELETE: {
      group: 'repositories',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/contents/{path}': {
    GET: {
      group: 'repositories',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    PUT: {
      group: 'repositories',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    DELETE: {
      group: 'repositories',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/issues': {
    GET: {
      group: 'issues',
    },
  },
  '/user/repos': {
    GET: {
      group: 'repositories',
    },
    POST: {
      group: 'repositories',
      override_options: {
        name: { required: true },
      },
    },
  },
  '/search/repositories': {
    GET: {
      group: 'search',
    },
  },
  '/search/issues': {
    GET: {
      group: 'search',
    },
  },
  '/repos/{owner}/{repo}/collaborators': {
    GET: {
      group: 'members',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/actions/workflows': {
    GET: {
      group: 'actions',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/issues/{issue_number}/assignees': {
    POST: {
      group: 'members',
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
      group: 'members',
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
      group: 'members',
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
      group: 'members',
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
      group: 'members',
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
      group: 'repositories',
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
      group: 'branches',
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
      group: 'secrets',
      independent_path_vars: ['repo'],
      override_options: {
        secret_name: { required: true },
        encrypted_value: { required: true },
        key_id: { required: true },
        ...repoOwnerCommonOptions,
      },
    },
    DELETE: {
      group: 'secrets',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
    GET: {
      group: 'secrets',
      independent_path_vars: ['repo'],
      override_options: repoOwnerCommonOptions,
    },
  },
  '/repos/{owner}/{repo}/actions/secrets/public-key': {
    GET: {
      group: 'secrets',
      independent_path_vars: ['repo'],
    },
  },
};
