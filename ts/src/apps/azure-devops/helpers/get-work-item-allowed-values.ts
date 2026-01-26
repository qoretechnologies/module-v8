import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AZURE_DEVOPS_CONN_OPTIONS, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient } from './constants';
type ActiveCampaignItem = WorkItem;

const mapAzureDevOpsItemToAllowedValue = (item: ActiveCampaignItem): IQoreAllowedValue<number> => {
  return {
    value: item.id!,
    display_name: item.fields?.['System.Title'],
    desc: `State: ${item.fields?.['System.State']}\nType: ${item.fields?.['System.WorkItemType']}`,
  };
};

export const getAzureDevOpsWorkItemAllowedValues: TQoreGetAllowedValuesFunction<
  typeof AZURE_DEVOPS_CONN_OPTIONS,
  number
> = async (context) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: AzureDevOpsError,
  });

  try {
    const client = createAzureDevOpsClient({ token, organization });
    const api = await client.getWorkItemTrackingApi();

    const { project } = context?.opts || {};

    const wiql = {
      query:
        `SELECT [System.Id], [System.Title] FROM WorkItems` +
        ` ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC`,
    };

    const response = await api.queryByWiql(wiql, project, undefined, 200);

    if (!response?.workItems || response.workItems.length === 0) {
      return [];
    }

    const workItemIds: number[] = [];
    response.workItems.forEach((item: { id: number }) => {
      if (item.id) workItemIds.push(item.id);
    });

    const workItems = await api.getWorkItems(workItemIds);

    return workItems.map(mapAzureDevOpsItemToAllowedValue);
  } catch (error) {
    throw new AzureDevOpsError('Failed to fetch allowed values: ' + error);
  }
};
