import { CommitSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = CommitSchema;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<string> => {
  return {
    display_name: item.title,
    value: item.id,
  };
};

export const getGitlabCommitAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    ErrorClass: GitLabError,
  });

  const projectId = context?.opts?.id || context?.opts?.project;

  if (!projectId) throw new GitLabError('Project Id is required to get commit allowed values');

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.Commits.all(projectId, {
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab commit allowed values: ${error.message || error}`
    );
  }
};
