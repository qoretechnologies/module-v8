import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue } from '../../../global/models/qore';

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

  const { data } = await QorusRequest.get<{
    data: ItemType[];
  }>(
    {
      path,
      params: {
        per_page: '100',
        order_by: 'created_at',
        order_type: 'desc',
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

  return data.map(options.mapItemToAllowedValue);
};
