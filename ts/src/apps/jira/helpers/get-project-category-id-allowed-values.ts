import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraProjectCategoryIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error(
      'The token and cloud_id are required to get Jira project category allowed values'
    );
  }

  const projectCategoryIds: IQoreAllowedValue<string>[] = [];

  const { data: fetchedProjectCategories } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/projectCategory`,
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  projectCategoryIds.push(
    ...fetchedProjectCategories.map(
      (projectCategory: any): IQoreAllowedValue<string> => ({
        value: projectCategory.id,
        display_name: projectCategory.name,
        desc: projectCategory.description,
      })
    )
  );

  return projectCategoryIds;
};
