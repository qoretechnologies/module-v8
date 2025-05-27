import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotObject = {
  id: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  properties: Record<string, any>;
};

const mapHubspotObject = (object: THubspotObject): IQoreAllowedValue<string> => ({
  value: object.id,
  display_name: object.id,
  desc: Object.entries(object.properties)
    .map(([key, value]) => `${key}: ${value}`)
    .slice(0, 5)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_key, value]) => typeof value === 'string' || typeof value === 'number')
    .join('\n'),
});

export const getHubspotListObjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const listId = context?.opts?.listId;

  if (!listId) {
    throw new Error('The listId is required to get Hubspot list object id allowed values');
  }

  if (!token) {
    throw new Error('The token is required to get Hubspot custom object id allowed values');
  }

  const listResponse = await QorusRequest.get<{
    data: { list: { objectTypeId: string } };
  }>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/crm/v3/lists/${listId}`,
    },
    {
      endpointId: 'Hubspot',
      url: 'https://api.hubapi.com',
    }
  );

  const objectType = listResponse?.data?.list?.objectTypeId;

  if (!objectType) {
    throw new Error(`List with ID ${listId} does not have an associated object type`);
  }

  const customObjectIds = await fetchHubspotAllowedValues<THubspotObject>({
    token,
    object: objectType,
    mapItemToAllowedValue: mapHubspotObject,
  });

  return customObjectIds;
};
