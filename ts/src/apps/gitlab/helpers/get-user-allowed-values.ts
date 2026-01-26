import { MemberSchema, UserSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = UserSchema | MemberSchema;

type TAllowedValueType = number;

const mapGitLabItemToAllowedValue = (item: TGitlabItem): IQoreAllowedValue<TAllowedValueType> => {
  return {
    display_name: item.username,
    value: item.id,
    ...(item.avatar_url && { image: item.avatar_url }),
  };
};

export const getGitlabUserAllowedValues: TQoreGetAllowedValuesFunction<
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
    if (projectId) {
      const data = await client.ProjectMembers.all(projectId, {
        perPage: 100,
        maxPages: 3,
      });

      return data.map(mapGitLabItemToAllowedValue);
    } else {
      user = await client.Users.showCurrentUser();

      return [user].map(mapGitLabItemToAllowedValue);
    }
  } catch (error) {
    throw new GitLabError(`Failed to fetch Gitlab user allowed values: ${error.message || error}`);
  }
};

export const getGitlabGroupMemberAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  TAllowedValueType
> = async (context) => {
  const { token, url, id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    optionFields: ['id'],
    ErrorClass: GitLabError,
  });

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.GroupMembers.all(id, {
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab group member allowed values: ${error.message || error}`
    );
  }
};

export const getGitlabProjectMemberAllowedValues: TQoreGetAllowedValuesFunction<
  typeof GITLAB_CONN_OPTIONS,
  TAllowedValueType
> = async (context) => {
  const { token, url, id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    optionFields: ['id'],
    ErrorClass: GitLabError,
  });

  const client = createGitlabClient({ url, token });

  try {
    const data = await client.ProjectMembers.all(id, {
      perPage: 100,
      maxPages: 3,
    });

    return data.map(mapGitLabItemToAllowedValue);
  } catch (error) {
    throw new GitLabError(
      `Failed to fetch Gitlab project member allowed values: ${error.message || error}`
    );
  }
};
