import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { TeamProjectReference } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AZURE_DEVOPS_CONN_OPTIONS, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient } from './constants';
type ActiveCampaignItem = TeamProjectReference;

const mapAzureDevOpsItemToAllowedValue = (item: ActiveCampaignItem): IQoreAllowedValue<string> => {
  return {
    value: item.id!,
    display_name: item.name!,
    desc: `State: ${item.state}\nVisibility: ${item.visibility}`,
    ...(item.defaultTeamImageUrl && { image: item.defaultTeamImageUrl }),
  };
};

export const getAzureDevOpsProjectAllowedValues: TQoreGetAllowedValuesFunction<
  typeof AZURE_DEVOPS_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: AzureDevOpsError,
  });

  try {
    const client = createAzureDevOpsClient({ token, organization });

    const coreApi = await client.getCoreApi();

    const projects = await coreApi.getProjects(undefined, 200);

    return projects.map(mapAzureDevOpsItemToAllowedValue);
  } catch (error) {
    throw new AzureDevOpsError('Failed to fetch allowed values: ' + error);
  }
};
