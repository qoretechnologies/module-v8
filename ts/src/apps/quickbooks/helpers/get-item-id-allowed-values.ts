import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Item } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksItemToAllowedValue = (item: Item): IQoreAllowedValue<string> => {
  const itemName = item.Name || 'Unknown Item';
  const itemType = item.Type || 'Unknown Type';
  const unitPrice = item.UnitPrice || 0;
  const sku = item.Sku || '';
  const isActive = item.Active !== false;

  const displayName = sku ? `${itemName} (${sku})` : itemName;
  const statusIndicator = isActive ? '' : ' [INACTIVE]';

  return {
    value: item.Id!.toString(),
    display_name: `${displayName}${statusIndicator}`,
    desc:
      `Name: ${itemName}\n` +
      `Type: ${itemType}\n` +
      `Price: $${unitPrice}\n` +
      `Status: ${isActive ? 'Active' : 'Inactive'}`,
  };
};

export const getQuickbooksItemIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allItems: Item[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const items = await client.findItems({
      desc: 'MetaData.CreateTime',
    });

    allItems.push(...(items.QueryResponse.Item || []));
    total = items.QueryResponse.maxResults || 0;

    while (
      allItems.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allItems.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const items = await client.findItems({
        desc: 'MetaData.CreateTime',
        offset: allItems.length,
      });

      allItems.push(...(items.QueryResponse.Item || []));
      total = items.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch items: ${error}`);
  }

  return allItems.map(mapQuickbooksItemToAllowedValue);
};
