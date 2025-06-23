import { Subscription } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Subscription): IQoreAllowedValue<string> => {
  const priceName = item.items?.[0]?.price?.name;
  const total = item.items?.[0]?.price?.unitPrice?.amount;
  const totalNumber = total ? (Number(total) / 100).toFixed(2) : 0;

  return {
    value: item.id,
    display_name: `${item.id}[${item.items?.[0]?.product?.name}]`,
    desc:
      `Id: ${item.id}\n` +
      `Status: ${item.status}\n` +
      `Collection mode: ${item.collectionMode}\n` +
      `Item: ${item.items?.[0]?.product?.name}\n` +
      `Price: ${priceName} ${totalNumber} ${item.currencyCode}\n`,
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

  const allSubscriptions: Subscription[] = [];
  const subscriptionCollection = client.subscriptions.list();

  try {
    for await (const subscription of subscriptionCollection) {
      allSubscriptions.push(subscription);
    }
  } catch (error) {
    console.error(`Failed to fetch subscriptions: ${error}`);
  }

  return allSubscriptions.map(mapPaddleItemToAllowedValue);
};
