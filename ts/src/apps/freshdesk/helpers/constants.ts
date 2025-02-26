import { IQoreAllowedValue, QorusRequest } from '@qoretechnologies/ts-toolkit';

export type TFetchFreshdeskAllowedValuesOptions<ItemType = unknown> = {
  token: string;
  subdomain: string;
  path: string;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue;
};

export const fetchFreshdeskAllowedValues = async <ItemType = unknown>(
  options: TFetchFreshdeskAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue[]> => {
  const { path, subdomain, token } = options;

  const response = await QorusRequest.get<{
    data: ItemType[];
  }>(
    {
      path,
      params: {
        per_page: '100',
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      url: `https://${subdomain}.freshdesk.com`,
      endpointId: 'Freshdesk',
    }
  );

  const data = response?.data;

  if (!data) {
    return [];
  }

  return data.map(options.mapItemToAllowedValue);
};
