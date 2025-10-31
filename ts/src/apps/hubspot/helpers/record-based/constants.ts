import { HubspotError } from '../../constants';
import { createHubspotClient } from '../constants';

export const getHubspotCustomObjectIdToNameMap = async (
  token: string
): Promise<Record<string, string>> => {
  const client = createHubspotClient(token);

  try {
    const schemas = await client.crm.schemas.coreApi.getAll();

    const idToNameMap: Record<string, string> = {};
    schemas.results
      .filter((schema) => schema.objectTypeId)
      .forEach((schema) => {
        idToNameMap[schema.objectTypeId!] = schema.name;
      });

    return idToNameMap;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }

    throw new HubspotError(`Failed to fetch Hubspot schemas: ${error?.message || error}`);
  }
};

export const getHubspotCustomObjectNameToIdMap = async (
  token: string
): Promise<Record<string, string>> => {
  const client = createHubspotClient(token);

  try {
    const schemas = await client.crm.schemas.coreApi.getAll();

    const nameToIdMap: Record<string, string> = {};
    schemas.results
      .filter((schema) => schema.objectTypeId)
      .forEach((schema) => {
        nameToIdMap[schema.name] = schema.objectTypeId!;
      });

    return nameToIdMap;
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }

    throw new HubspotError(`Failed to fetch Hubspot schemas: ${error?.message || error}`);
  }
};
