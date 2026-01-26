import { VariableSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = VariableSchema;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<string> => {
  return {
    display_name: item.key,
    value: item.key,
  };
};

export const getGitlabProjectVariableKeyAllowedValues: TQoreGetAllowedValuesFunction<
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
    const data = await client.ProjectVariables.all(projectId, {
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab variable key allowed values: ${error.message || error}`
    );
  }
};

export const getGitlabGroupVariableKeyAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  string
> = async (context) => {
  const {
    token,
    url,
    id: groupId,
  } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    optionFields: ['id'],
    ErrorClass: GitLabError,
  });

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.GroupVariables.all(groupId, {
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab variable key allowed values: ${error.message || error}`
    );
  }
};
