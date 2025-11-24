import { IssueSchema } from '@gitbeaker/rest';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GITLAB_CONN_OPTIONS, GitLabError } from '../constants';
import { createGitlabClient } from './constants';

type TGitlabItem = IssueSchema;

type TAllowedValueType = number;

const mapGitLabItemToAllowedValue =
  (field: 'id' | 'iid') =>
  (item: TGitlabItem): IQoreAllowedValue<TAllowedValueType> => {
    return {
      display_name: item.title,
      value: item[field],
    };
  };

const createIssueAllowedValueFunction = (
  field: 'id' | 'iid'
): TQoreGetAllowedValuesFunction<typeof GITLAB_CONN_OPTIONS, TAllowedValueType> => {
  return async (context) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['url', 'token'],
      ErrorClass: GitLabError,
    });

    const projectId = context?.opts?.id;

    const client = createGitlabClient({ url, token });

    try {
      if (projectId) {
        const data = await client.Issues.all({
          projectId,
          perPage: 100,
          maxPages: 3,
        });

        return data.map(mapGitLabItemToAllowedValue(field));
      } else {
        const issues = await client.Issues.all({
          perPage: 100,
          maxPages: 3,
        });

        return issues.map(mapGitLabItemToAllowedValue(field));
      }
    } catch (error) {
      throw new GitLabError(
        `Failed to fetch Gitlab issue allowed values: ${error.message || error}`
      );
    }
  };
};

export const getGitlabIssueIdAllowedValues = createIssueAllowedValueFunction('id');
export const getGitlabIssueIidAllowedValues = createIssueAllowedValueFunction('iid');
