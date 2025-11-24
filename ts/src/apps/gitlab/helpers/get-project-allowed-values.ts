import { ProjectSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = ProjectSchema;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<number> => {
  return {
    display_name: item.name_with_namespace,
    value: item.id,
  };
};

export const getGitlabProjectAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  number
> = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    ErrorClass: GitLabError,
  });

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.Projects.all({ perPage: 100, maxPages: 3, membership: true });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab project allowed values: ${error.message || error}`
    );
  }
};
