import { MilestoneSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = MilestoneSchema;

type TAllowedValueType = number;

const mapGitLabItemToAllowedValue =
  (field: 'id' | 'iid') =>
  (item: TGitlabItem): IQoreAllowedValue<TAllowedValueType> => {
    return {
      display_name: item.title,
      value: item[field],
    };
  };

const createMilestoneAllowedValueFunction = (
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
      const data = await client.ProjectMilestones.all(projectId, {
        perPage: 100,
        maxPages: 3,
      });

      return data.map(mapGitLabItemToAllowedValue(field));
    } catch (error) {
      throw new GitLabError(
        `Failed to fetch Gitlab milestone allowed values: ${error.message || error}`
      );
    }
  };
};

export const getGitlabMilestoneIdAllowedValues = createMilestoneAllowedValueFunction('id');
export const getGitlabMilestoneIidAllowedValues = createMilestoneAllowedValueFunction('iid');
