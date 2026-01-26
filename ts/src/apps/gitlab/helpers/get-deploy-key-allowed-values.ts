import { DeployKeySchema, UserSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = DeployKeySchema;

type TAllowedValueType = number;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<TAllowedValueType> => {
  return {
    display_name: item.title,
    value: item.id,
  };
};

export const getGitlabDeployKeyAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  TAllowedValueType
> = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    ErrorClass: GitLabError,
  });

  const projectId = context?.opts?.id;
  let user: UserSchema | null = null;

  const client = createGitlabClient({ url, token });

  try {
    if (!projectId) {
      user = await client.Users.showCurrentUser();
    }

    const data = await client.DeployKeys.all({
      ...(projectId && { projectId }),
      ...(user && { userId: user.id }),
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab deploy key allowed values: ${error.message || error}`
    );
  }
};
