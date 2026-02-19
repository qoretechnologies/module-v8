import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { freshdeskClient } from '../client';

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

  try {
    const data = await freshdeskClient.get<ItemType[]>(path, {
      token,
      connectionOptions: { subdomain },
      params: { per_page: '100' },
    });

    if (!data) {
      return [];
    }

    return data.map(options.mapItemToAllowedValue);
  } catch {
    return [];
  }
};
