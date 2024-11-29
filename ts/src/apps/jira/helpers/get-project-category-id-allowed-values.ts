import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraProjectCategoryIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

  const projectCategoryIds: IQoreAllowedValue[] = [];

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
      (projectCategory: any): IQoreAllowedValue => ({
        value: projectCategory.id,
        display_name: projectCategory.name,
      })
    )
  );

  return projectCategoryIds;
};
