import {
  TQoreAppActionOption,
  TQoreGetRecordTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { GitHubError } from '../../constants';
import { getGitHubAssigneesAllowedValues } from '../get-assignee-allowed-values';
import { getGitHubIssueLabelsAllowedValues } from '../get-issue-label-allowed-values';

export const GitHubTables = ['issues', 'pulls', 'releases', 'repositories'] as const;
export type TGitHubTable = (typeof GitHubTables)[number];

const commonFields = {
  id: {
    type: 'integer',
    short_desc: 'Not writable. Unique ID',
    display_name: 'ID',
  },
  updated_at: {
    type: 'string',
    short_desc: 'Not writable. Last update timestamp',
    display_name: 'Updated At',
  },
  created_at: {
    type: 'string',
    short_desc: 'Not writable. Creation timestamp',
    display_name: 'Created At',
  },
} satisfies Record<string, TQoreAppActionOption>;

export const GitHubIssueRecordType = {
  type: 'hash',
  fields: {
    ...commonFields,
    state: {
      type: 'string',
      required: false,
      display_name: 'State',
    },
    number: {
      type: 'integer',
      short_desc: 'Not writable. Issue number in the repository',
      display_name: 'Issue Number',
    },
    title: {
      type: 'string',
      required: true,
      short_desc: 'Issue title',
      display_name: 'Title',
    },
    body: {
      type: 'string',
      short_desc: 'Issue description',
      display_name: 'Description',
    },
    assignee: {
      type: 'string',
      get_allowed_values: getGitHubAssigneesAllowedValues,
      allowed_values_creatable: true,
      short_desc: 'User assigned to this issue',
      display_name: 'Assignee',
    },
    assignees: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      element_allowed_values_creatable: true,
      get_element_allowed_values: getGitHubAssigneesAllowedValues,
      short_desc: 'Users assigned to this issue',
      display_name: 'Assignees',
    },
    labels: {
      element_allowed_values_creatable: true,
      get_element_allowed_values: getGitHubIssueLabelsAllowedValues,
      type: {
        type: 'list',
        element_type: 'string',
      },
      short_desc: 'Labels for categorizing this issue',
      display_name: 'Labels',
    },
    milestone: {
      type: 'string',
      short_desc: 'Milestone associated with this issue',
      display_name: 'Milestone',
    },
    type: {
      type: 'string',
      short_desc: 'Issue type (Bug, Task, etc.)',
      display_name: 'Issue Type',
    },
  },
} satisfies TQoreTypeObject;

export const GitHubPullRequestRecordType = {
  type: 'hash',
  fields: {
    ...commonFields,
    state: {
      type: 'string',
      display_name: 'State',
    },
    title: {
      type: 'string',
      short_desc: 'Pull request title',
      display_name: 'Title',
    },
    head: {
      type: 'string',
      required: true,
      short_desc: 'Branch where your changes are implemented',
      display_name: 'Head Branch',
    },
    base: {
      type: 'string',
      required: true,
      short_desc: 'Branch you want changes pulled into',
      display_name: 'Base Branch',
    },
    head_repo: {
      type: 'string',
      short_desc: 'Repository for the head branch (for forks)',
      display_name: 'Head Repository',
    },
    body: {
      type: 'string',
      short_desc: 'Pull request description',
      display_name: 'Description',
    },
    maintainer_can_modify: {
      type: 'bool',
      short_desc: 'Allow maintainers to modify this pull request',
      display_name: 'Maintainer Can Modify',
    },
    draft: {
      type: 'bool',
      short_desc: 'Create as draft pull request',
      display_name: 'Draft',
    },
    issue: {
      type: 'integer',
      short_desc: 'Issue number to create pull request from',
      display_name: 'Issue Number',
    },
  },
} satisfies TQoreTypeObject;

export const GitHubReleaseRecordType = {
  type: 'hash',
  fields: {
    ...commonFields,

    tag_name: {
      type: 'string',
      required: true,
      short_desc: 'Git tag name for this release',
      display_name: 'Tag Name',
    },
    target_commitish: {
      type: 'string',
      short_desc: 'Branch or commit SHA to create tag from',
      display_name: 'Target Commitish',
    },
    name: {
      type: 'string',
      short_desc: 'Release name',
      display_name: 'Name',
    },
    body: {
      type: 'string',
      short_desc: 'Release description',
      display_name: 'Description',
    },
    draft: {
      type: 'bool',
      short_desc: 'Create as unpublished draft release',
      display_name: 'Draft',
    },
    prerelease: {
      type: 'bool',
      short_desc: 'Mark as prerelease version',
      display_name: 'Prerelease',
    },
    discussion_category_name: {
      type: 'string',
      short_desc: 'Discussion category for this release',
      display_name: 'Discussion Category',
    },
    generate_release_notes: {
      type: 'bool',
      short_desc: 'Auto-generate release notes from commits',
      display_name: 'Generate Release Notes',
    },
    make_latest: {
      type: 'string',
      allowed_values: [
        { display_name: 'true', value: 'true' },
        { display_name: 'false', value: 'false' },
        { display_name: 'legacy', value: 'legacy' },
      ],
      short_desc: 'Mark this as the latest release',
      display_name: 'Make Latest',
    },
  },
} satisfies TQoreTypeObject;

export const GitHubRepositoryRecordType = {
  type: 'hash',
  fields: {
    ...commonFields,

    name: {
      type: 'string',
      required: true,
      short_desc: 'Repository name',
      display_name: 'Name',
    },
    description: {
      type: 'string',
      short_desc: 'Repository description',
      display_name: 'Description',
    },
    homepage: {
      type: 'string',
      short_desc: 'Repository homepage URL',
      display_name: 'Homepage',
    },
    private: {
      type: 'bool',
      short_desc: 'Create as private repository',
      display_name: 'Private',
    },
    has_issues: {
      type: 'bool',
      short_desc: 'Enable issues for this repository',
      display_name: 'Has Issues',
    },
    has_projects: {
      type: 'bool',
      short_desc: 'Enable projects for this repository',
      display_name: 'Has Projects',
    },
    has_wiki: {
      type: 'bool',
      short_desc: 'Enable wiki for this repository',
      display_name: 'Has Wiki',
    },
    has_discussions: {
      type: 'bool',
      short_desc: 'Enable discussions for this repository',
      display_name: 'Has Discussions',
    },
    team_id: {
      type: 'integer',
      short_desc: 'Team with access to this repository',
      display_name: 'Team ID',
    },
    auto_init: {
      type: 'bool',
      short_desc: 'Initialize with README file',
      display_name: 'Auto Initialize',
    },
    gitignore_template: {
      type: 'string',
      short_desc: 'Gitignore template to use',
      display_name: 'Gitignore Template',
    },
    license_template: {
      type: 'string',
      short_desc: 'License template to use',
      display_name: 'License Template',
    },
    allow_squash_merge: {
      type: 'bool',
      short_desc: 'Allow squash merging pull requests',
      display_name: 'Allow Squash Merge',
    },
    allow_merge_commit: {
      type: 'bool',
      short_desc: 'Allow merge commits for pull requests',
      display_name: 'Allow Merge Commit',
    },
    allow_rebase_merge: {
      type: 'bool',
      short_desc: 'Allow rebase merging pull requests',
      display_name: 'Allow Rebase Merge',
    },
    delete_branch_on_merge: {
      type: 'bool',
      short_desc: 'Auto-delete head branches after merge',
      display_name: 'Delete Branch on Merge',
    },
    squash_merge_commit_title: {
      type: 'string',
      allowed_values: [
        { display_name: 'PR title', value: 'PR_TITLE' },
        { display_name: 'Commit title', value: 'COMMIT_OR_PR_TITLE' },
      ],
      short_desc: 'Title format for squash merge commits',
      display_name: 'Squash Merge Commit Title',
    },
    merge_commit_title: {
      type: 'string',
      allowed_values: [
        { display_name: 'PR title', value: 'PR_TITLE' },
        { display_name: 'Merge commit message', value: 'MERGE_MESSAGE' },
      ],
      short_desc: 'Title format for merge commits',
      display_name: 'Merge Commit Title',
    },
    merge_commit_message: {
      type: 'string',
      allowed_values: [
        { display_name: 'PR body', value: 'PR_BODY' },
        { display_name: 'PR title', value: 'PR_TITLE' },
        { display_name: 'Blank', value: 'BLANK' },
      ],
      short_desc: 'Message format for merge commits',
      display_name: 'Merge Commit Message',
    },
    has_downloads: {
      type: 'bool',
      short_desc: 'Enable downloads for this repository',
      display_name: 'Has Downloads',
    },
    is_template: {
      type: 'bool',
      short_desc: 'Mark as template repository',
      display_name: 'Is Template',
    },
  },
} satisfies TQoreTypeObject;

export const getGithubRecordType: TQoreGetRecordTypeFunction = (
  _context,
  tableName: TGitHubTable
) => {
  switch (tableName) {
    case 'issues':
      return GitHubIssueRecordType;
    case 'pulls':
      return GitHubPullRequestRecordType;
    case 'releases':
      return GitHubReleaseRecordType;
    case 'repositories':
      return GitHubRepositoryRecordType;
    default:
      throw new GitHubError(`Table ${tableName} is not supported yet`);
  }
};
