import { BranchSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = BranchSchema;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<string> => {
  return {
    display_name: item.name,
    value: item.name,
  };
};

export const getGitlabBranchAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  string
> = async (context) => {
  const {
    token,
    url,
    id: projectId,
  } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    optionFields: ['id'],
    ErrorClass: GitLabError,
  });

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.Branches.all(projectId, {
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab branch allowed values: ${error.message || error}`
    );
  }
};
