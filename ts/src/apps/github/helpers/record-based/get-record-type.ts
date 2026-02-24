import {
  TQoreAppActionOption,
  TQoreGetRecordTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { GitHubError } from '../../constants';
import { getGitHubAssigneesAllowedValues } from '../get-assignee-allowed-values';
import { getGitHubIssueLabelsAllowedValues } from '../get-issue-label-allowed-values';
import { Debugger } from '../../../../utils/Debugger';

export const GitHubTables = ['issues', 'pulls', 'releases'] as const;
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
      short_desc: 'Users assigned to this issue',
      display_name: 'Assignees',
    },
    labels: {
      element_allowed_values_creatable: true,
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

export const getGithubRecordType: TQoreGetRecordTypeFunction = async (context, tableName: string) => {
  switch (tableName) {
    case 'issues': {
      let assigneeAllowedValues;
      let labelsAllowedValues;

      try {
        [assigneeAllowedValues, labelsAllowedValues] = await Promise.all([
          getGitHubAssigneesAllowedValues(context),
          getGitHubIssueLabelsAllowedValues(context),
        ]);
      } catch (error) {
        Debugger.log('Failed to resolve GitHub issue allowed values for record type', error);
      }

      return {
        ...GitHubIssueRecordType,
        fields: {
          ...GitHubIssueRecordType.fields,
          assignee: {
            ...GitHubIssueRecordType.fields.assignee,
            ...(assigneeAllowedValues && { allowed_values: assigneeAllowedValues }),
          },
          assignees: {
            ...GitHubIssueRecordType.fields.assignees,
            ...(assigneeAllowedValues && { element_allowed_values: assigneeAllowedValues }),
          },
          labels: {
            ...GitHubIssueRecordType.fields.labels,
            ...(labelsAllowedValues && { element_allowed_values: labelsAllowedValues }),
          },
        },
      };
    }
    case 'pulls':
      return GitHubPullRequestRecordType;
    case 'releases':
      return GitHubReleaseRecordType;
    default:
      throw new GitHubError(`Table ${tableName} is not supported yet`);
  }
};
