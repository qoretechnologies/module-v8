import * as AzureDevOps from 'azure-devops-node-api';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { omit } from 'lodash';

export const createAzureDevOpsClient = (options: { organization: string; token: string }) => {
  const { organization, token } = options;
  const url = `https://dev.azure.com/${organization}`;
  const authHandler = AzureDevOps.getPersonalAccessTokenHandler(token);
  const connection = new AzureDevOps.WebApi(url, authHandler);

  return connection;
};

const userReferenceFields = ['System.CreatedBy', 'System.ChangedBy', 'System.AssignedTo'];

export const mapAzureDevOpsWorkItem = (item: WorkItem) => {
  const fields: Record<string, any> = {};

  for (const [key, value] of Object.entries(item.fields || {})) {
    const newKey = key.replace('System.', '');
    if (userReferenceFields.includes(key)) {
      fields[newKey] = omit(value, ['_links']);
    } else {
      fields[newKey] = value;
    }
  }

  return {
    id: item.id,
    url: item.url,
    ...fields,
  };
};
