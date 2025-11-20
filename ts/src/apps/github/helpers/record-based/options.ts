import { TQoreCrudOptions } from '@qoretechnologies/ts-toolkit';
import { getGitHubOwnerAllowedValues } from '../get-owner-allowed-values';
import { getGitHubRepositoryIdAllowedValues } from '../get-repository-id-allowed-values';

export const GithubCommonOptions = {
  repo: {
    get_allowed_values: getGitHubRepositoryIdAllowedValues,
    preselected: true,
    type: 'string',
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
  owner: {
    get_allowed_values: getGitHubOwnerAllowedValues,
    preselected: true,
    type: 'string',
    on_change: ['refetch'],
    allowed_values_creatable: true,
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
