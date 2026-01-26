import { TCustomConnOptions, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';
import { getBitbucketRepositoryAllowedValues } from '../helpers/get-repository-allowed-values';

export const BitbucketWorkspaceAndRepoOptions = {
  workspace: {
    on_change: ['refetch'],
    get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
  },
  repo_slug: {
    depends_on: ['workspace'],
    on_change: ['refetch'],
    get_allowed_values: getBitbucketRepositoryAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;
