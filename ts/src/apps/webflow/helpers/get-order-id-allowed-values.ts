import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Order } from 'webflow-api/api';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { WebflowError } from '../constants';
import { createWebflowClient } from './constants';

const WEBFLOW_ALLOWED_ITEMS_LIMIT = 500;

const mapWebflowItemToAllowedValue = (item: Order): IQoreAllowedValue<string> => {
  const name =
    `${item.customerInfo?.email || item.customerInfo?.fullName || 'Unknown customer'}` +
    ` - ${item.netAmount?.value} ${item.netAmount?.unit}`;

  const items = item.purchasedItems?.length
    ? item.purchasedItems.map((item) => ` - ${item.productName} - ${item.count}`).join('\n')
    : 'No items';

  return {
    value: item.orderId!,
    display_name: name,
    desc: `Status: ${item.status}\nItems: ${items}`,
  };
};

export const getWebflowOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, site } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['site'],
    ErrorClass: WebflowError,
  });

  const client = createWebflowClient(token);

  const items: Order[] = [];

  try {
    let total = 0;
    let offset = 0;

    do {
      const response = await client.orders.list(site, {
        limit: 100,
        offset,
      });

      if (response.orders) {
        items.push(...response.orders);
        total = response.pagination?.total || 0;
      }

      offset += 100;
    } while (items.length < total && items.length < WEBFLOW_ALLOWED_ITEMS_LIMIT);
  } catch (error) {
    console.error(`Failed to fetch orders: ${error}`);
  }

  return items.map(mapWebflowItemToAllowedValue);
};
