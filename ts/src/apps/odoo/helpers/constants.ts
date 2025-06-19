import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import OdooAwait from 'odoo-await';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';

export const createOdooClient = async (options: {
  subdomain: string;
  username: string;
  password: string;
}) => {
  const client = new OdooAwait({
    baseUrl: `https://${options.subdomain}.odoo.com`,
    username: options.username,
    password: options.password,
    db: options.subdomain,
    port: undefined,
  });

  await client.connect();

  return client;
};

export const ODOO_ALLOWED_VALUES_TIMEOUT = 60_000;
export const ODOO_ALLOWED_VALUES_FETCH_DELAY = 100;

export type TFetchOdooAllowedValuesOptions<ItemType = unknown> = {
  username: string;
  password: string;
  subdomain: string;
  model: string;
  limit?: number;
  maxResults?: number;
  fields?: string[];
  filter?: Record<string, any>;
  mapItemToAllowedValue: (item: ItemType) => IQoreAllowedValue<any>;
};

export const fetchOdooAllowedValues = async <ItemType = unknown>(
  options: TFetchOdooAllowedValuesOptions<ItemType>
): Promise<IQoreAllowedValue<any>[]> => {
  const items = await fetchOdooRecords<ItemType>(options);

  return items.map(options.mapItemToAllowedValue);
};

export const fetchOdooRecords = async <ItemType = unknown>(
  options: Omit<TFetchOdooAllowedValuesOptions<ItemType>, 'mapItemToAllowedValue'>
): Promise<ItemType[]> => {
  const { model, fields } = options;

  const items: ItemType[] = [];
  const startTime = Date.now();
  const filter = options.filter || {};
  const maxResults = options.maxResults || 1000;
  const limit = options.limit || 500;
  let offset = 0;
  let hasMore = true;

  const client = await createOdooClient(options);

  try {
    do {
      if (Date.now() - startTime > ODOO_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(`Timeout fetching Odoo allowed values for ${model}`);
        break;
      }

      if (items.length >= maxResults) {
        break;
      }

      const data: ItemType[] = await client.searchRead(model, filter, fields || [], {
        limit,
        offset,
      });

      items.push(...data);

      hasMore = data.length === limit;
      offset += limit;

      if (hasMore) {
        await delay(ODOO_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (hasMore);
  } catch (error) {
    Debugger.log(`Error fetching Odoo records for ${model}`, error);

    return items;
  }

  return items;
};
