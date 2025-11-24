import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';
import { MergeRequestSchema } from '@gitbeaker/rest';

type TGitlabItem = MergeRequestSchema;

type TAllowedValueType = number;

const mapGitLabItemToAllowedValue =
  (field: 'id' | 'iid') =>
  (item: TGitlabItem): IQoreAllowedValue<TAllowedValueType> => {
    return {
      display_name: item.title,
      value: item[field],
    };
  };

const createMergeRequestAllowedValueFunction = (
  field: 'id' | 'iid'
): TQoreGetAllowedValuesFunction<typeof GITLAB_CONN_OPTIONS, TAllowedValueType> => {
  return async (context) => {
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
      const data = await client.MergeRequests.all({
        projectId,
        perPage: 100,
        maxPages: 3,
      });

      return data.map(mapGitLabItemToAllowedValue(field));
    } catch (error) {
      throw new GitLabError(
        `Failed to fetch Gitlab issue allowed values: ${error.message || error}`
      );
    }
  };
};

export const getGitlabMergeRequestIdAllowedValues = createMergeRequestAllowedValueFunction('id');
export const getGitlabMergeRequestIidAllowedValues = createMergeRequestAllowedValueFunction('iid');
