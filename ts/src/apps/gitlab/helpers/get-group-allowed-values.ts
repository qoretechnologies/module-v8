import { GroupSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = GroupSchema;

type TAllowedValueType = number;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<TAllowedValueType> => {
  return {
    display_name: item.name,
    value: item.id,
  };
};

export const getGitlabGroupAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  TAllowedValueType
> = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    ErrorClass: GitLabError,
  });

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.Groups.all({
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(`Failed to fetch Gitlab group allowed values: ${error.message || error}`);
  }
};
