import { pick } from 'lodash';
import {
  GitHubIssueRecordType,
  GitHubPullRequestRecordType,
  GitHubReleaseRecordType,
  GitHubRepositoryRecordType,
} from './get-record-type';

export const GitHubTables = ['issues', 'pulls', 'releases', 'repositories'] as const;

export type TGitHubTable = (typeof GitHubTables)[number];

export const needsRepoAndOwner = (tableName: string): boolean => {
  return ['issues', 'pulls', 'releases'].includes(tableName);
};

export const getGitHubTableKeys = (tableName: TGitHubTable): string[] => {
  switch (tableName) {
    case 'issues':
      return Object.keys(GitHubIssueRecordType.fields);
    case 'pulls':
      return Object.keys(GitHubPullRequestRecordType.fields);
    case 'releases':
      return Object.keys(GitHubReleaseRecordType.fields);
    case 'repositories':
      return Object.keys(GitHubRepositoryRecordType.fields);
    default:
      return [];
  }
};

export const formatGitHubRecord = (options: {
  record: Record<string, any>;
  tableName: TGitHubTable;
  fields: string[];
}): Record<string, any> => {
  const { record, tableName, fields } = options;

  switch (tableName) {
    case 'issues':
      return {
        ...pick(record, fields),
        labels: record.labels?.map((label: { name: string }) => label.name) || [],
        assignee: record.assignee?.login || null,
        assignees: record.assignees?.map((assignee: { login: string }) => assignee.login) || [],
        milestone: record.milestone?.title || null,
      };
    case 'pulls':
      return {
        ...pick(record, fields),
        base: record.base?.ref || null,
        head: record.head?.ref || null,
      };
    default:
      return pick(record, fields);
  }
};
