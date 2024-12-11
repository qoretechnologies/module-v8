import { TAllowedPaths } from '../../global/models/qore';
import { getGitHubBranchIdAllowedValues } from './helpers/get-branch-id-allowed-values';
import { getGitHubIssueIdAllowedValues } from './helpers/get-issue-id-allowed-values';
import { getGitHubPullIdAllowedValues } from './helpers/get-pull-id-allowed-values';
import { getGitHubRepositoryIdAllowedValues } from './helpers/get-repository-id-allowed-values';

export const GITHUB_APP_NAME = 'Github';
export const GITHUB_ALLOWED_PATHS: TAllowedPaths = {
  '/repos/{owner}/{repo}/pulls': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        title: { required: true },
        head: { required: true },
        base: { required: true },
        body: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/pulls/{pull_number}': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PATCH: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/issues': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        title: { required: true },
        body: { required: true },
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/issues/{issue_number}': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        issue_number: {
          get_allowed_values: getGitHubIssueIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    PATCH: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
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
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/branches': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/releases': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        tag_name: { required: true },
        name: { required: true },
        body: { required: true },
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/contributors': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/orgs/{org}/members': {
    GET: {},
  },
  '/orgs/{org}/repos': {
    GET: {},
    POST: {
      override_options: {
        name: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PATCH: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/contents/{path}': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
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
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/actions/workflows': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/issues/{issue_number}/assignees': {
    POST: {
      override_options: {
        assignees: { required: true },
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        issue_number: {
          get_allowed_values: getGitHubIssueIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    DELETE: {
      override_options: {
        assignees: { required: true },
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
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
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          depends_on: ['owner', 'repo'],
        },
        reviewers: { required_groups: ['reviewers'] },
        team_reviewers: { required_groups: ['team_reviewers'] },
      },
    },
    DELETE: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          depends_on: ['owner', 'repo'],
        },
      },
    },
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        pull_number: {
          get_allowed_values: getGitHubPullIdAllowedValues,
          depends_on: ['owner', 'repo'],
        },
      },
    },
  },
  '/repos/{owner}/{repo}/git/refs': {
    POST: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
        ref: { required: true },
        sha: { required: true },
      },
    },
  },
  '/repos/{owner}/{repo}/branches/{branch}': {
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
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
      override_options: {
        secret_name: { required: true },
        encrypted_value: { required: true },
        key_id: { required: true },
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    GET: {
      override_options: {
        repo: {
          get_allowed_values: getGitHubRepositoryIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/repos/{owner}/{repo}/actions/secrets/public-key': { GET: {} },
};
