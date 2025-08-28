import { Customer, Subscription } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { formatDateReadable, getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue =
  (customers: Record<string, Customer>) =>
  (item: Subscription): IQoreAllowedValue<string> => {
    const priceName = item.items?.[0]?.price?.name;
    const total = item.items?.[0]?.price?.unitPrice?.amount;
    const totalNumber = total ? (Number(total) / 100).toFixed(2) : 0;
    const customer = customers[item.customerId];

    return {
      value: item.id,
      display_name: `${customer?.email} [${item.items?.[0]?.product?.name}]`,
      desc:
        `Id: ${item.id}\n` +
        `Status: ${item.status}\n` +
        `Collection mode: ${item.collectionMode}\n` +
        `Item: ${item.items?.[0]?.product?.name}\n` +
        `Price: ${priceName} ${totalNumber} ${item.currencyCode}\n` +
        `Date: ${formatDateReadable(item.createdAt, { includeTime: false })}`,
    };
  };

export const getPaddleSubscriptionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const subscriptionCollection = client.subscriptions.list({
    perPage: 200,
  });

  try {
    const allSubscriptions: Subscription[] = await subscriptionCollection.next();
    const customerIds = new Set<string>(allSubscriptions.map((sub) => sub.customerId));
    const customersCollection = client.customers.list({
      perPage: 200,
      id: Array.from(customerIds),
    });

    const customers = Object.fromEntries(
      (await customersCollection.next()).map((customer) => [customer.id, customer])
    );

    return allSubscriptions.map(mapPaddleItemToAllowedValue(customers));
  } catch (error) {
    Debugger.log(`Failed to fetch subscriptions: ${error}`);

    return [];
  }
};
