import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getGitHubOwnerAllowedValues } from '../get-owner-allowed-values';
import { getGitHubRepositoryIdAllowedValues } from '../get-repository-id-allowed-values';

export const GithubCommonOptions = {
  repo: {
    get_allowed_values: getGitHubRepositoryIdAllowedValues,
    required: true,
    type: 'string',
    on_change: ['refetch'],
    allowed_values_creatable: true,
    display_name: 'Repository',
    short_desc: `The name of the repository. For example, for the repository "qoretechnologies/qorus", the repo value would be "qorus".`,
  },
  owner: {
    get_allowed_values: getGitHubOwnerAllowedValues,
    required: true,
    type: 'string',
    on_change: ['refetch'],
    allowed_values_creatable: true,
    display_name: 'Owner',
    short_desc: `The owner of the repository. Can be either a user or an organization.`,
  },
} satisfies TQoreCrudOptions;

export const GithubSearchOptions = {
  ...GithubCommonOptions,
  orderBy: {
    type: {
      type: 'hash',
      fields: {
        column: {
          type: 'string',
          required: true,
        },
        ascending: {
          type: 'bool',
          required: false,
        },
      },
    },
  },
} satisfies TQoreCrudOptions;

export const GithubCreateOptions = {
  ...GithubCommonOptions,
} satisfies TQoreCrudOptions;
